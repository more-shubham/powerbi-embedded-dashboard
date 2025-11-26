"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Filter, X, SlidersHorizontal, LayoutGrid } from "lucide-react";
import type * as pbi from "powerbi-client";
import type { PowerBIVisual } from "@/types";
import type { FilterConfig, FilterLevel } from "@/types/powerbi-filters";
import { FilterBuilder } from "../FilterBuilder";
import { applyVisualFilter, clearVisualFilters } from "@/lib/powerbi-filters";

interface FiltersPanelProps {
  report: pbi.Report | null;
}

interface AppliedFilter {
  id: string;
  table: string;
  column?: string;
  measure?: string;
  operator: string;
  values?: string[];
  conditions?: Array<{ operator: string; value?: unknown }>;
  filterType: string;
  raw: pbi.models.IFilter;
}

export function FiltersPanel({ report }: FiltersPanelProps) {
  const [activeTab, setActiveTab] = useState<"page" | "visual">("page");
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedVisual, setSelectedVisual] = useState<PowerBIVisual | null>(null);
  const [visuals, setVisuals] = useState<
    Array<{ name: string; title: string; visual: PowerBIVisual }>
  >([]);
  const [isApplying, setIsApplying] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<AppliedFilter[]>([]);

  // Load applied filters from report
  const loadAppliedFilters = useCallback(async () => {
    if (!report) return;

    try {
      const filters = await report.getFilters();

      const parsedFilters: AppliedFilter[] = filters.map((f, index) => {
        const target = (f as pbi.models.IBasicFilter | pbi.models.IAdvancedFilter).target as
          | pbi.models.IFilterColumnTarget
          | pbi.models.IFilterMeasureTarget;
        const table = target?.table || "Unknown";
        const column = (target as pbi.models.IFilterColumnTarget)?.column;
        const measure = (target as pbi.models.IFilterMeasureTarget)?.measure;

        if (f.filterType === 1) {
          const basicFilter = f as pbi.models.IBasicFilter;
          return {
            id: `filter-${index}`,
            table,
            column,
            measure,
            operator: basicFilter.operator || "In",
            values: basicFilter.values?.map(String) || [],
            filterType: "basic",
            raw: f,
          };
        } else {
          const advFilter = f as pbi.models.IAdvancedFilter;
          return {
            id: `filter-${index}`,
            table,
            column,
            measure,
            operator: advFilter.logicalOperator || "And",
            conditions: advFilter.conditions?.map((c) => ({
              operator: c.operator || "",
              value: c.value,
            })),
            filterType: "advanced",
            raw: f,
          };
        }
      });

      setAppliedFilters(parsedFilters);
    } catch {
      // Filter loading failed - applied filters will remain empty
    }
  }, [report]);

  useEffect(() => {
    loadAppliedFilters();
  }, [loadAppliedFilters]);

  const loadVisuals = async () => {
    if (!report) return;

    try {
      const pages = await report.getPages();
      const activePage = pages.find((p) => p.isActive);
      if (!activePage) return;

      const pageVisuals = await activePage.getVisuals();
      setVisuals(
        pageVisuals.map((v) => ({
          name: v.name,
          title: v.title || v.type,
          visual: v as unknown as PowerBIVisual,
        }))
      );
    } catch {
      // Failed to load visuals
    }
  };

  const handleTabChange = (tab: "page" | "visual") => {
    setActiveTab(tab);
    setShowBuilder(false);
    setSelectedVisual(null);

    if (tab === "visual") {
      loadVisuals();
    }
  };

  const handleApplyFilter = async (filter: FilterConfig) => {
    if (!report) return;

    setIsApplying(true);

    try {
      const { buildFilter } = await import("@/types/powerbi-filters");
      const pbiFilter = buildFilter(filter);

      if (activeTab === "page") {
        const existingFilters = await report.getFilters();
        await report.setFilters([...existingFilters, pbiFilter]);
      } else if (activeTab === "visual" && selectedVisual) {
        await applyVisualFilter(selectedVisual, filter);
      }

      setShowBuilder(false);
      setSelectedVisual(null);
      await loadAppliedFilters();
    } catch {
      // Filter apply failed
    } finally {
      setIsApplying(false);
    }
  };

  const handleClearAllFilters = async () => {
    if (!report) return;

    setIsApplying(true);
    try {
      await report.setFilters([]);
      await loadAppliedFilters();
    } catch {
      // Clear failed
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemoveFilter = async (filterToRemove: AppliedFilter) => {
    if (!report) return;

    setIsApplying(true);
    try {
      const currentFilters = await report.getFilters();
      const updatedFilters = currentFilters.filter(
        (_, index) => `filter-${index}` !== filterToRemove.id
      );
      await report.setFilters(updatedFilters);
      await loadAppliedFilters();
    } catch {
      // Remove failed
    } finally {
      setIsApplying(false);
    }
  };

  const handleClearVisualFilters = async () => {
    if (!selectedVisual) return;

    setIsApplying(true);
    try {
      await clearVisualFilters(selectedVisual);
      setSelectedVisual(null);
    } catch {
      // Clear failed
    } finally {
      setIsApplying(false);
    }
  };

  const filterLevel: FilterLevel = activeTab === "page" ? "page" : "visual";

  // Format filter display text
  const getFilterDisplayText = (filter: AppliedFilter) => {
    if (filter.filterType === "basic") {
      const values = filter.values?.slice(0, 3).join(", ") || "";
      const more =
        (filter.values?.length || 0) > 3 ? ` +${(filter.values?.length || 0) - 3} more` : "";
      return `${filter.operator}: ${values}${more}`;
    } else {
      return (
        filter.conditions
          ?.map((c) => `${c.operator}${c.value !== undefined ? ` "${c.value}"` : ""}`)
          .join(` ${filter.operator} `) || ""
      );
    }
  };

  if (showBuilder) {
    return (
      <FilterBuilder
        level={filterLevel}
        onApply={handleApplyFilter}
        onCancel={() => {
          setShowBuilder(false);
          setSelectedVisual(null);
        }}
      />
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Tab Buttons */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => handleTabChange("page")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
            activeTab === "page"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Page
        </button>
        <button
          onClick={() => handleTabChange("visual")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
            activeTab === "visual"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
          }`}
        >
          <LayoutGrid className="h-4 w-4" />
          Visual
        </button>
      </div>

      {/* Page Filters Tab */}
      {activeTab === "page" && (
        <div className="flex min-h-0 flex-1 flex-col">
          {/* Add Filter Button */}
          <button
            onClick={() => setShowBuilder(true)}
            disabled={isApplying}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 px-4 py-3 text-sm font-medium text-gray-600 transition-all hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50 dark:border-gray-600 dark:text-gray-400 dark:hover:border-blue-500 dark:hover:bg-blue-900/10 dark:hover:text-blue-400"
          >
            <Plus className="h-4 w-4" />
            Add Filter
          </button>

          {/* Applied Filters */}
          {appliedFilters.length > 0 && (
            <div className="mt-4 flex min-h-0 flex-1 flex-col">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                  Active Filters
                </span>
                <button
                  onClick={handleClearAllFilters}
                  disabled={isApplying}
                  className="text-xs text-red-500 transition-colors hover:text-red-600 disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
                >
                  Clear all
                </button>
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto">
                {appliedFilters.map((filter) => (
                  <div
                    key={filter.id}
                    className="group flex items-center gap-2 rounded-lg border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-2.5 dark:border-blue-800/50 dark:from-blue-900/20 dark:to-indigo-900/20"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-800/50">
                      <Filter className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-800 dark:text-gray-200">
                        {filter.column || filter.measure}
                      </p>
                      <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                        {getFilterDisplayText(filter)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveFilter(filter)}
                      disabled={isApplying}
                      className="rounded-md p-1.5 text-gray-400 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 disabled:opacity-50 dark:hover:bg-red-900/20"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {appliedFilters.length === 0 && (
            <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                <Filter className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">No filters applied</p>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                Add a filter to refine your data
              </p>
            </div>
          )}
        </div>
      )}

      {/* Visual Filters Tab */}
      {activeTab === "visual" && (
        <div className="flex min-h-0 flex-1 flex-col">
          {selectedVisual ? (
            <>
              {/* Selected Visual Header */}
              <div className="mb-3 flex items-center gap-3 rounded-xl bg-blue-50 p-3 dark:bg-blue-900/20">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-800/50">
                  <LayoutGrid className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-800 dark:text-gray-200">
                    {visuals.find((v) => v.visual === selectedVisual)?.title || "Selected Visual"}
                  </p>
                  <button
                    onClick={() => setSelectedVisual(null)}
                    className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Change visual
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowBuilder(true)}
                  disabled={isApplying}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  Add Filter
                </button>
                <button
                  onClick={handleClearVisualFilters}
                  disabled={isApplying}
                  className="rounded-lg px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  Clear
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Visual Selection */}
              {visuals.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                    <LayoutGrid className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">No visuals found</p>
                  <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                    This page has no visuals to filter
                  </p>
                </div>
              ) : (
                <div className="flex-1 space-y-2 overflow-y-auto">
                  <p className="mb-2 text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                    Select a visual
                  </p>
                  {visuals.map((visual) => (
                    <button
                      key={visual.name}
                      onClick={() => setSelectedVisual(visual.visual)}
                      className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
                        <LayoutGrid className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      </div>
                      <span className="truncate text-sm font-medium text-gray-700 dark:text-gray-300">
                        {visual.title}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Loading Overlay */}
      {isApplying && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/50 dark:bg-gray-900/50">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
        </div>
      )}
    </div>
  );
}
