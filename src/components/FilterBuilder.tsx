"use client";

import { useState } from "react";
import { Plus, Trash2, Filter } from "lucide-react";
import { tableOptions, columnsByTable, measuresByTable } from "@/config/visual-builder-schema";
import type {
  FilterConfig,
  BasicFilterConfig,
  AdvancedFilterConfig,
  BasicFilterOperator,
  AdvancedFilterOperator,
  LogicalOperator,
  FilterLevel,
} from "@/types/powerbi-filters";

interface FilterBuilderProps {
  level: FilterLevel;
  onApply: (filter: FilterConfig) => void;
  onCancel: () => void;
}

const BASIC_OPERATORS: { label: string; value: BasicFilterOperator }[] = [
  { label: "Is one of", value: "In" },
  { label: "Is not one of", value: "NotIn" },
];

const ADVANCED_OPERATORS: { label: string; value: AdvancedFilterOperator }[] = [
  { label: "Equals", value: "Equals" },
  { label: "Not equals", value: "NotEquals" },
  { label: "Greater than", value: "GreaterThan" },
  { label: "Greater than or equal", value: "GreaterThanOrEqual" },
  { label: "Less than", value: "LessThan" },
  { label: "Less than or equal", value: "LessThanOrEqual" },
  { label: "Contains", value: "Contains" },
  { label: "Does not contain", value: "DoesNotContain" },
  { label: "Starts with", value: "StartsWith" },
  { label: "Ends with", value: "EndsWith" },
  { label: "Is blank", value: "IsBlank" },
  { label: "Is not blank", value: "IsNotBlank" },
];

export function FilterBuilder({ level, onApply, onCancel }: FilterBuilderProps) {
  const [filterType, setFilterType] = useState<"basic" | "advanced">("basic");
  const [selectedTable, setSelectedTable] = useState("");
  const [selectedColumn, setSelectedColumn] = useState("");
  const [targetType, setTargetType] = useState<"column" | "measure">("column");

  // Basic filter state
  const [basicOperator, setBasicOperator] = useState<BasicFilterOperator>("In");
  const [basicValues, setBasicValues] = useState<string[]>([""]);

  // Advanced filter state
  const [logicalOperator, setLogicalOperator] = useState<LogicalOperator>("And");
  const [conditions, setConditions] = useState<
    Array<{ operator: AdvancedFilterOperator; value: string }>
  >([{ operator: "Equals", value: "" }]);

  const availableColumns =
    targetType === "column"
      ? columnsByTable[selectedTable] || []
      : measuresByTable[selectedTable] || [];

  const handleAddBasicValue = () => {
    setBasicValues([...basicValues, ""]);
  };

  const handleRemoveBasicValue = (index: number) => {
    setBasicValues(basicValues.filter((_, i) => i !== index));
  };

  const handleBasicValueChange = (index: number, value: string) => {
    const newValues = [...basicValues];
    newValues[index] = value;
    setBasicValues(newValues);
  };

  const handleAddCondition = () => {
    setConditions([...conditions, { operator: "Equals", value: "" }]);
  };

  const handleRemoveCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const handleConditionChange = (index: number, field: "operator" | "value", value: string) => {
    const newConditions = [...conditions];
    if (field === "operator") {
      newConditions[index].operator = value as AdvancedFilterOperator;
    } else {
      newConditions[index].value = value;
    }
    setConditions(newConditions);
  };

  const handleApply = () => {
    if (!selectedTable || !selectedColumn) return;

    let filter: FilterConfig;

    if (filterType === "basic") {
      const validValues = basicValues.filter((v) => v.trim() !== "");
      if (validValues.length === 0) return;

      filter = {
        filterType: "basic",
        target: {
          table: selectedTable,
          ...(targetType === "column" ? { column: selectedColumn } : { measure: selectedColumn }),
        },
        operator: basicOperator,
        values: validValues,
      } as BasicFilterConfig;
    } else {
      const validConditions = conditions
        .filter(
          (c) => c.value.trim() !== "" || c.operator === "IsBlank" || c.operator === "IsNotBlank"
        )
        .map((c) => ({
          operator: c.operator,
          value: c.operator === "IsBlank" || c.operator === "IsNotBlank" ? undefined : c.value,
        }));

      if (validConditions.length === 0) return;

      filter = {
        filterType: "advanced",
        target: {
          table: selectedTable,
          ...(targetType === "column" ? { column: selectedColumn } : { measure: selectedColumn }),
        },
        logicalOperator,
        conditions: validConditions,
      } as AdvancedFilterConfig;
    }

    onApply(filter);
  };

  const levelLabel = level === "visual" ? "Visual" : level === "page" ? "Page" : "Report";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <Filter className="h-4 w-4" />
        <span>{levelLabel}-Level Filter</span>
      </div>

      {/* Filter Type Selection - Basic only available for columns */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Filter Type
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFilterType("basic")}
            disabled={targetType === "measure"}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-colors ${
              filterType === "basic"
                ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                : "border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
            } ${targetType === "measure" ? "cursor-not-allowed opacity-50" : ""}`}
          >
            Basic (List)
          </button>
          <button
            type="button"
            onClick={() => setFilterType("advanced")}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-colors ${
              filterType === "advanced"
                ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                : "border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
            }`}
          >
            Advanced (Conditions)
          </button>
        </div>
        {targetType === "measure" && (
          <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
            Measures require Advanced filter type
          </p>
        )}
      </div>

      {/* Target Type Selection */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Filter On
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setTargetType("column");
              setSelectedColumn("");
            }}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-colors ${
              targetType === "column"
                ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                : "border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
            }`}
          >
            Column
          </button>
          <button
            type="button"
            onClick={() => {
              setTargetType("measure");
              setSelectedColumn("");
              // Force advanced filter for measures
              setFilterType("advanced");
            }}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-colors ${
              targetType === "measure"
                ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                : "border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
            }`}
          >
            Measure
          </button>
        </div>
      </div>

      {/* Table Selection */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Table
        </label>
        <select
          value={selectedTable}
          onChange={(e) => {
            setSelectedTable(e.target.value);
            setSelectedColumn("");
          }}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
        >
          <option value="">Select table...</option>
          {tableOptions
            .filter((t) =>
              targetType === "column" ? t.group === "Dimensions" : t.group === "Measures"
            )
            .map((table) => (
              <option key={table.value} value={table.value}>
                {table.label}
              </option>
            ))}
        </select>
      </div>

      {/* Column/Measure Selection */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {targetType === "column" ? "Column" : "Measure"}
        </label>
        <select
          value={selectedColumn}
          onChange={(e) => setSelectedColumn(e.target.value)}
          disabled={!selectedTable}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800"
        >
          <option value="">Select {targetType === "column" ? "column" : "measure"}...</option>
          {availableColumns.map((col) => (
            <option key={col.value} value={col.value}>
              {col.label}
            </option>
          ))}
        </select>
      </div>

      {/* Basic Filter Configuration */}
      {filterType === "basic" && (
        <>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Operator
            </label>
            <select
              value={basicOperator}
              onChange={(e) => setBasicOperator(e.target.value as BasicFilterOperator)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
            >
              {BASIC_OPERATORS.map((op) => (
                <option key={op.value} value={op.value}>
                  {op.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Values
            </label>
            <div className="space-y-2">
              {basicValues.map((value, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleBasicValueChange(index, e.target.value)}
                    placeholder="Enter value..."
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
                  />
                  {basicValues.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveBasicValue(index)}
                      className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddBasicValue}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <Plus className="h-4 w-4" />
                Add value
              </button>
            </div>
          </div>
        </>
      )}

      {/* Advanced Filter Configuration */}
      {filterType === "advanced" && (
        <>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Match
            </label>
            <select
              value={logicalOperator}
              onChange={(e) => setLogicalOperator(e.target.value as LogicalOperator)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
            >
              <option value="And">All conditions (AND)</option>
              <option value="Or">Any condition (OR)</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Conditions
            </label>
            <div className="space-y-2">
              {conditions.map((condition, index) => (
                <div key={index} className="flex gap-2">
                  <select
                    value={condition.operator}
                    onChange={(e) => handleConditionChange(index, "operator", e.target.value)}
                    className="w-1/2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
                  >
                    {ADVANCED_OPERATORS.map((op) => (
                      <option key={op.value} value={op.value}>
                        {op.label}
                      </option>
                    ))}
                  </select>
                  {condition.operator !== "IsBlank" && condition.operator !== "IsNotBlank" && (
                    <input
                      type="text"
                      value={condition.value}
                      onChange={(e) => handleConditionChange(index, "value", e.target.value)}
                      placeholder="Value..."
                      className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
                    />
                  )}
                  {conditions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCondition(index)}
                      className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddCondition}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <Plus className="h-4 w-4" />
                Add condition
              </button>
            </div>
          </div>
        </>
      )}

      {/* Actions */}
      <div className="flex gap-2 border-t border-gray-200 pt-4 dark:border-gray-700">
        <button
          type="button"
          onClick={handleApply}
          disabled={!selectedTable || !selectedColumn}
          className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Apply Filter
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
