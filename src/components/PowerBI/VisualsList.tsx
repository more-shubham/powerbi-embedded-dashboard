"use client";

import { useEffect, useState } from "react";
import { LayoutGrid, Pencil, Trash2 } from "lucide-react";
import type * as pbi from "powerbi-client";
import type { EditingVisual, PowerBIVisual } from "@/types";
import { extractVisualData } from "@/lib/powerbi-data-extraction";
import { getVisualTypeMetadata, getVisualTypeLabel } from "@/constants/visual-types";
import { withTimeout } from "@/lib/async-utils";
import { asExtendedVisual } from "@/lib/powerbi-type-guards";

interface VisualInfo {
  name: string;
  type: string;
  title: string;
  visual: PowerBIVisual;
}

interface VisualsListProps {
  report: pbi.Report | null;
  onEditVisual?: (editingVisual: EditingVisual) => void;
  onDeleteVisual?: (visualName: string) => Promise<boolean>;
  refreshKey?: number;
}

// Helper to render visual type icon
function VisualTypeIcon({ type }: { type: string }) {
  const metadata = getVisualTypeMetadata(type);
  const Icon = metadata.icon;
  const className = `h-4 w-4 ${metadata.iconClassName || ""}`.trim();
  return <Icon className={className} />;
}

export function VisualsList({
  report,
  onEditVisual,
  onDeleteVisual,
  refreshKey,
}: VisualsListProps) {
  const [visuals, setVisuals] = useState<VisualInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [deletingName, setDeletingName] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchVisuals = async () => {
      if (!report) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const pages = await withTimeout(report.getPages(), 5000, "Failed to get pages");

        if (cancelled) return;

        const activePage = pages.find((p) => p.isActive);

        if (!activePage) {
          setVisuals([]);
          setLoading(false);
          return;
        }

        const pageVisuals = await withTimeout(
          activePage.getVisuals(),
          5000,
          "Failed to get visuals"
        );

        if (cancelled) return;

        const visualInfos: VisualInfo[] = pageVisuals.map((v) => ({
          name: v.name,
          type: v.type,
          title: v.title || getVisualTypeLabel(v.type),
          visual: asExtendedVisual(v),
        }));

        setVisuals(visualInfos);
        setLoading(false);
      } catch {
        if (cancelled) return;
        setVisuals([]);
        setLoading(false);
      }
    };

    fetchVisuals();

    return () => {
      cancelled = true;
    };
  }, [report, refreshKey]);

  const handleEditClick = async (visualInfo: VisualInfo) => {
    if (!onEditVisual) return;

    setEditingName(visualInfo.name);
    try {
      const data = await extractVisualData(visualInfo.visual);

      onEditVisual({
        visual: visualInfo.visual,
        type: data.type,
        name: data.name,
        title: data.title,
        position: data.position,
        dataRoles: {
          category: data.category,
          values: data.values.length > 0 ? data.values : undefined,
        },
      });
    } catch {
      // Failed to extract visual data
    }
    setEditingName(null);
  };

  const handleDeleteClick = async (visualInfo: VisualInfo) => {
    if (!onDeleteVisual) return;

    setDeletingName(visualInfo.name);
    await onDeleteVisual(visualInfo.name);
    setDeletingName(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
      </div>
    );
  }

  if (visuals.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500 dark:text-gray-400">
        <LayoutGrid className="mx-auto mb-2 h-8 w-8 opacity-50" />
        <p className="text-sm">No visuals on this page</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
        {visuals.length} visuals on this page
      </p>
      <div className="max-h-[60vh] space-y-1 overflow-y-auto">
        {visuals.map((visual) => (
          <div
            key={visual.name}
            className="group flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <span className="shrink-0 text-gray-500">
              <VisualTypeIcon type={visual.type} />
            </span>
            <span className="flex-1 truncate text-sm">{visual.title}</span>
            <span className="text-xs text-gray-400 group-hover:hidden">
              {getVisualTypeLabel(visual.type)}
            </span>
            <div className="hidden items-center gap-1 group-hover:flex">
              <button
                onClick={() => handleEditClick(visual)}
                disabled={editingName === visual.name || deletingName === visual.name}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {editingName === visual.name ? (
                  <div className="h-3 w-3 animate-spin rounded-full border border-blue-600 border-t-transparent" />
                ) : (
                  <Pencil className="h-3 w-3" />
                )}
                Edit
              </button>
              <button
                onClick={() => handleDeleteClick(visual)}
                disabled={editingName === visual.name || deletingName === visual.name}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
              >
                {deletingName === visual.name ? (
                  <div className="h-3 w-3 animate-spin rounded-full border border-red-600 border-t-transparent" />
                ) : (
                  <Trash2 className="h-3 w-3" />
                )}
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
