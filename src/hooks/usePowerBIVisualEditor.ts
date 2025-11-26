"use client";

import { useEffect, useState, useCallback } from "react";
import type * as pbi from "powerbi-client";
import type { EditingVisual, CommandDetail, PowerBIVisual, PowerBIPage } from "@/types";
import { extractVisualData } from "@/lib/powerbi-data-extraction";
import { deleteVisual } from "@/lib/powerbi-operations";

interface UsePowerBIVisualEditorOptions {
  onVisualDeleted?: () => void;
  onError?: (message: string) => void;
}

interface UsePowerBIVisualEditorReturn {
  editingVisual: EditingVisual | null;
  setEditingVisual: (visual: EditingVisual | null) => void;
  isBuilderOpen: boolean;
  setIsBuilderOpen: (open: boolean) => void;
  closeBuilder: () => void;
  handleDeleteVisual: (visualName: string) => Promise<boolean>;
}

export function usePowerBIVisualEditor(
  report: pbi.Report | null,
  options?: UsePowerBIVisualEditorOptions
): UsePowerBIVisualEditorReturn {
  const [editingVisual, setEditingVisual] = useState<EditingVisual | null>(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);

  const closeBuilder = useCallback(() => {
    setIsBuilderOpen(false);
    setEditingVisual(null);
  }, []);

  const handleDeleteVisual = useCallback(
    async (visualName: string): Promise<boolean> => {
      if (!report) {
        options?.onError?.("Report not loaded");
        return false;
      }

      try {
        const pages = await report.getPages();
        const activePage = pages.find((p) => p.isActive) as PowerBIPage | undefined;

        if (!activePage) {
          options?.onError?.("No active page found");
          return false;
        }

        await deleteVisual(activePage, visualName);
        options?.onVisualDeleted?.();
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        options?.onError?.(`Failed to delete visual: ${message}`);
        return false;
      }
    },
    [report, options]
  );

  useEffect(() => {
    if (!report) return;

    const handleCommand = async (event: pbi.service.ICustomEvent<unknown>) => {
      const commandDetail = event.detail as CommandDetail;

      if (commandDetail.command === "editVisual") {
        try {
          const pages = await report.getPages();
          const activePage = pages.find((p) => p.isActive);
          if (!activePage) return;

          const visuals = await activePage.getVisuals();
          const visual = visuals.find((v) => v.name === commandDetail.visual.name) as
            | PowerBIVisual
            | undefined;

          if (visual) {
            const data = await extractVisualData(visual);

            setEditingVisual({
              visual,
              type: data.type,
              name: data.name,
              title: data.title,
              position: data.position,
              dataRoles: {
                category: data.category,
                values: data.values.length > 0 ? data.values : undefined,
              },
            });

            setIsBuilderOpen(true);
          }
        } catch {}
      } else if (commandDetail.command === "deleteVisual") {
        await handleDeleteVisual(commandDetail.visual.name);
      }
    };

    report.on("commandTriggered", handleCommand);

    return () => {
      report.off("commandTriggered", handleCommand);
    };
  }, [report, handleDeleteVisual]);

  return {
    editingVisual,
    setEditingVisual,
    isBuilderOpen,
    setIsBuilderOpen,
    closeBuilder,
    handleDeleteVisual,
  };
}
