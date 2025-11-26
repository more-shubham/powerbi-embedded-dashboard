"use client";

import { Pencil, Layers, LayoutGrid, Filter, Save } from "lucide-react";

interface FloatingButtonGroupProps {
  visible: boolean;
  onCreateVisual: () => void;
  onShowPages: () => void;
  onShowVisuals: () => void;
  onShowFilters: () => void;
  onSaveReport: () => void;
  isSaving?: boolean;
}

export function FloatingButtonGroup({
  visible,
  onCreateVisual,
  onShowPages,
  onShowVisuals,
  onShowFilters,
  onSaveReport,
  isSaving = false,
}: FloatingButtonGroupProps) {
  if (!visible) return null;

  const buttonClass = `
    flex h-9 w-9 items-center justify-center
    rounded-full bg-blue-600 text-white shadow-md
    transition-all duration-200
    hover:bg-blue-700 hover:scale-105 hover:shadow-lg
    active:scale-95
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
  `;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {/* Save Report Button */}
      <button
        className={`${buttonClass} bg-green-600 hover:bg-green-700`}
        onClick={onSaveReport}
        disabled={isSaving}
        aria-label="Save report"
        title="Save Report"
      >
        {isSaving ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : (
          <Save className="h-4 w-4" />
        )}
      </button>

      {/* Create/Edit Visual Button */}
      <button
        className={buttonClass}
        onClick={onCreateVisual}
        aria-label="Create visual"
        title="Create Visual"
      >
        <Pencil className="h-4 w-4" />
      </button>

      {/* Filters Button */}
      <button
        className={buttonClass}
        onClick={onShowFilters}
        aria-label="Show filters"
        title="Filters"
      >
        <Filter className="h-4 w-4" />
      </button>

      {/* Pages List Button */}
      <button className={buttonClass} onClick={onShowPages} aria-label="Show pages" title="Pages">
        <Layers className="h-4 w-4" />
      </button>

      {/* Visuals List Button */}
      <button
        className={buttonClass}
        onClick={onShowVisuals}
        aria-label="Show visuals"
        title="Visuals"
      >
        <LayoutGrid className="h-4 w-4" />
      </button>
    </div>
  );
}
