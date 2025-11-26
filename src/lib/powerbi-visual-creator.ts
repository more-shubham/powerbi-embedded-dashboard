import * as pbi from "powerbi-client";
import type { DataField } from "@/types";

export type { DataField };

export interface VisualDataRoles {
  category?: DataField;
  values?: DataField[];
  columnValues?: DataField[];
  lineValues?: DataField[];
  legend?: DataField;
  tooltips?: DataField[];
}

export interface CreateVisualConfig {
  visualType: string;
  dataRoles: VisualDataRoles;
  title?: string;
  position?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export const VisualTypes = {
  clusteredBarChart: "clusteredBarChart",
  clusteredColumnChart: "clusteredColumnChart",
  lineChart: "lineChart",
  areaChart: "areaChart",
  pieChart: "pieChart",
  donutChart: "donutChart",
  card: "card",
  multiRowCard: "multiRowCard",
  table: "tableEx",
  matrix: "matrix",
  slicer: "slicer",
  kpi: "kpi",
  gauge: "gauge",
  map: "map",
  treemap: "treemap",
  waterfallChart: "waterfallChart",
  funnel: "funnel",
  scatterChart: "scatterChart",
  lineClusteredColumnComboChart: "lineClusteredColumnComboChart",
} as const;

export function buildColumnRef(field: DataField): pbi.models.IColumnTarget {
  return {
    table: field.table,
    column: field.column!,
  };
}

export function buildMeasureRef(field: DataField): pbi.models.IMeasureTarget {
  return {
    table: field.table,
    measure: field.measure!,
  };
}

export function buildDataFieldBinding(
  field: DataField
): pbi.models.IColumnTarget | pbi.models.IMeasureTarget {
  if (field.measure) {
    return buildMeasureRef(field);
  }
  return buildColumnRef(field);
}

export function buildVisualDescriptor(config: CreateVisualConfig): pbi.models.IVisualLayout {
  const layout: pbi.models.IVisualLayout = {
    x: config.position?.x ?? 0,
    y: config.position?.y ?? 0,
    width: config.position?.width ?? 400,
    height: config.position?.height ?? 300,
    displayState: {
      mode: pbi.models.VisualContainerDisplayMode.Visible,
    },
  };

  return layout;
}

interface DataFieldBinding {
  target: object;
}

export function createVisualConfig(config: CreateVisualConfig) {
  const dataRoleBindings: Record<string, DataFieldBinding[]> = {};

  if (config.dataRoles.category) {
    dataRoleBindings["Category"] = [{ target: buildColumnRef(config.dataRoles.category) }];
  }

  if (config.dataRoles.values) {
    dataRoleBindings["Values"] = config.dataRoles.values.map((field) => ({
      target: buildDataFieldBinding(field),
    }));
  }

  if (config.dataRoles.columnValues) {
    dataRoleBindings["ColumnValues"] = config.dataRoles.columnValues.map((field) => ({
      target: buildDataFieldBinding(field),
    }));
  }

  if (config.dataRoles.lineValues) {
    dataRoleBindings["LineValues"] = config.dataRoles.lineValues.map((field) => ({
      target: buildDataFieldBinding(field),
    }));
  }

  if (config.dataRoles.legend) {
    dataRoleBindings["Legend"] = [{ target: buildColumnRef(config.dataRoles.legend) }];
  }

  if (config.dataRoles.tooltips) {
    dataRoleBindings["Tooltips"] = config.dataRoles.tooltips.map((field) => ({
      target: buildDataFieldBinding(field),
    }));
  }

  return {
    visualType: config.visualType,
    layout: buildVisualDescriptor(config),
    dataRoles: dataRoleBindings,
  };
}

export const VisualPresets = {
  salesOverTime: (position?: CreateVisualConfig["position"]): CreateVisualConfig => ({
    visualType: VisualTypes.lineChart,
    dataRoles: {
      category: { table: "DimDate", column: "Month-Year" },
      values: [{ table: "All Measures", measure: "Total Sales" }],
    },
    title: "Sales Over Time",
    position,
  }),

  salesByCustomer: (position?: CreateVisualConfig["position"]): CreateVisualConfig => ({
    visualType: VisualTypes.clusteredBarChart,
    dataRoles: {
      category: { table: "dimCustomer", column: "Customer Code/Name" },
      values: [{ table: "All Measures", measure: "Total Sales" }],
    },
    title: "Sales by Customer",
    position,
  }),

  salesByProduct: (position?: CreateVisualConfig["position"]): CreateVisualConfig => ({
    visualType: VisualTypes.clusteredBarChart,
    dataRoles: {
      category: { table: "dimProduct", column: "Product Name-Code" },
      values: [{ table: "All Measures", measure: "Total Sales" }],
    },
    title: "Sales by Product",
    position,
  }),

  salesByPrincipal: (position?: CreateVisualConfig["position"]): CreateVisualConfig => ({
    visualType: VisualTypes.pieChart,
    dataRoles: {
      category: { table: "dimProduct", column: "Principal Name-Code" },
      values: [{ table: "All Measures", measure: "Total Sales" }],
    },
    title: "Sales by Principal",
    position,
  }),

  kpiTotalSales: (position?: CreateVisualConfig["position"]): CreateVisualConfig => ({
    visualType: VisualTypes.card,
    dataRoles: {
      values: [{ table: "All Measures", measure: "Total Sales" }],
    },
    title: "Total Sales",
    position,
  }),

  kpiTotalCases: (position?: CreateVisualConfig["position"]): CreateVisualConfig => ({
    visualType: VisualTypes.card,
    dataRoles: {
      values: [{ table: "All Measures", measure: "Total Cases" }],
    },
    title: "Total Cases",
    position,
  }),

  kpiBrokerage: (position?: CreateVisualConfig["position"]): CreateVisualConfig => ({
    visualType: VisualTypes.card,
    dataRoles: {
      values: [{ table: "All Measures", measure: "Calculated Brokerage" }],
    },
    title: "Calculated Brokerage",
    position,
  }),

  salesVsBrokerage: (position?: CreateVisualConfig["position"]): CreateVisualConfig => ({
    visualType: VisualTypes.lineClusteredColumnComboChart,
    dataRoles: {
      category: { table: "DimDate", column: "Month-Year" },
      columnValues: [{ table: "All Measures", measure: "Total Sales" }],
      lineValues: [{ table: "All Measures", measure: "Calculated Brokerage" }],
    },
    title: "Sales vs Brokerage",
    position,
  }),

  customerSlicer: (position?: CreateVisualConfig["position"]): CreateVisualConfig => ({
    visualType: VisualTypes.slicer,
    dataRoles: {
      values: [{ table: "dimCustomer", column: "Customer Code/Name" }],
    },
    position,
  }),

  dateSlicer: (position?: CreateVisualConfig["position"]): CreateVisualConfig => ({
    visualType: VisualTypes.slicer,
    dataRoles: {
      values: [{ table: "DimDate", column: "Month-Year" }],
    },
    position,
  }),

  principalSlicer: (position?: CreateVisualConfig["position"]): CreateVisualConfig => ({
    visualType: VisualTypes.slicer,
    dataRoles: {
      values: [{ table: "dimProduct", column: "Principal Name-Code" }],
    },
    position,
  }),
};

export function createGridLayout(
  configs: CreateVisualConfig[],
  options: {
    columns?: number;
    startX?: number;
    startY?: number;
    width?: number;
    height?: number;
    gapX?: number;
    gapY?: number;
  } = {}
): CreateVisualConfig[] {
  const {
    columns = 2,
    startX = 0,
    startY = 0,
    width = 400,
    height = 300,
    gapX = 20,
    gapY = 20,
  } = options;

  return configs.map((config, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);

    return {
      ...config,
      position: {
        x: startX + col * (width + gapX),
        y: startY + row * (height + gapY),
        width,
        height,
      },
    };
  });
}
