import * as pbi from "powerbi-client";

export type FilterLevel = "visual" | "page" | "report";

export type BasicFilterOperator = "In" | "NotIn" | "All";

export type AdvancedFilterOperator =
  | "Equals"
  | "NotEquals"
  | "LessThan"
  | "LessThanOrEqual"
  | "GreaterThan"
  | "GreaterThanOrEqual"
  | "Contains"
  | "DoesNotContain"
  | "StartsWith"
  | "DoesNotStartWith"
  | "EndsWith"
  | "DoesNotEndWith"
  | "IsBlank"
  | "IsNotBlank";

export type LogicalOperator = "And" | "Or";

export interface FilterTarget {
  table: string;
  column?: string;
  measure?: string;
}

export interface FilterCondition {
  operator: AdvancedFilterOperator;
  value?: string | number | boolean | Date;
}

export interface BasicFilterConfig {
  filterType: "basic";
  target: FilterTarget;
  operator: BasicFilterOperator;
  values: Array<string | number | boolean>;
}

export interface AdvancedFilterConfig {
  filterType: "advanced";
  target: FilterTarget;
  logicalOperator: LogicalOperator;
  conditions: FilterCondition[];
}

export type FilterConfig = BasicFilterConfig | AdvancedFilterConfig;

export interface FilterWithMetadata {
  id: string;
  level: FilterLevel;
  config: FilterConfig;
  displayName?: string;
}

export const FILTER_SCHEMAS = {
  basic: "http://powerbi.com/product/schema#basic",
  advanced: "http://powerbi.com/product/schema#advanced",
} as const;

function convertFilterValue(value: string | number | boolean): string | number | boolean {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed !== "" && !isNaN(Number(trimmed))) {
      return Number(trimmed);
    }
  }
  return value;
}

export function buildBasicFilter(config: BasicFilterConfig): pbi.models.IBasicFilter {
  if (!config.target.column) {
    throw new Error("BasicFilter requires a column target. Use AdvancedFilter for measures.");
  }

  const target: pbi.models.IFilterColumnTarget = {
    table: config.target.table,
    column: config.target.column,
  };

  const convertedValues = config.values.map(convertFilterValue);

  return {
    $schema: FILTER_SCHEMAS.basic,
    target,
    operator: config.operator,
    values: convertedValues,
    filterType: pbi.models.FilterType.Basic,
  };
}

export function buildAdvancedFilter(config: AdvancedFilterConfig): pbi.models.IAdvancedFilter {
  const target: pbi.models.IFilterColumnTarget | pbi.models.IFilterMeasureTarget = config.target
    .measure
    ? {
        table: config.target.table,
        measure: config.target.measure,
      }
    : {
        table: config.target.table,
        column: config.target.column!,
      };

  const conditions: pbi.models.IAdvancedFilterCondition[] = config.conditions.map((c) => ({
    operator: c.operator as pbi.models.AdvancedFilterConditionOperators,
    value:
      c.value !== undefined ? convertFilterValue(c.value as string | number | boolean) : undefined,
  }));

  return {
    $schema: FILTER_SCHEMAS.advanced,
    target,
    logicalOperator: config.logicalOperator as pbi.models.AdvancedFilterLogicalOperators,
    conditions,
    filterType: pbi.models.FilterType.Advanced,
  };
}

export function buildFilter(config: FilterConfig): pbi.models.IFilter {
  if (config.filterType === "basic") {
    return buildBasicFilter(config);
  }
  return buildAdvancedFilter(config);
}

export function createInFilter(
  table: string,
  column: string,
  values: Array<string | number>
): BasicFilterConfig {
  return {
    filterType: "basic",
    target: { table, column },
    operator: "In",
    values,
  };
}

export function createRangeFilter(
  table: string,
  column: string,
  min: number | string,
  max: number | string
): AdvancedFilterConfig {
  return {
    filterType: "advanced",
    target: { table, column },
    logicalOperator: "And",
    conditions: [
      { operator: "GreaterThanOrEqual", value: min },
      { operator: "LessThanOrEqual", value: max },
    ],
  };
}

export function createContainsFilter(
  table: string,
  column: string,
  value: string
): AdvancedFilterConfig {
  return {
    filterType: "advanced",
    target: { table, column },
    logicalOperator: "And",
    conditions: [{ operator: "Contains", value }],
  };
}
