"use client";

import { usePowerBI } from "@/contexts";
import { createOrUpdateVisual } from "@/lib/powerbi-operations";
import type { PowerBIPage, EditingVisual } from "@/types";
import type { CreateVisualConfig } from "@/lib/powerbi-visual-creator";
import { Modal } from "../ui/Modal";
import { VisualBuilder } from "../VisualBuilder";

export function PowerBIVisualBuilderModal() {
  const {
    state: { report, editingVisual, isBuilderOpen },
    closeBuilder,
    refreshVisuals,
  } = usePowerBI();

  const handleCreateOrUpdateVisual = async (config: CreateVisualConfig) => {
    if (!report) return;

    try {
      const reportPages = await report.getPages();
      const activePage = reportPages.find((p) => p.isActive) as PowerBIPage | undefined;
      if (!activePage) return;

      await createOrUpdateVisual(activePage, config, editingVisual?.visual);

      refreshVisuals();
      closeBuilder();
    } catch {
      closeBuilder();
    }
  };

  const getInitialData = (visual: EditingVisual | null) => {
    if (!visual) return undefined;
    return {
      visualType: visual.type,
      title: visual.title || "",
      categoryTable: visual.dataRoles?.category?.table,
      categoryColumn: visual.dataRoles?.category?.column,
      values: visual.dataRoles?.values,
      posX: visual.position?.x,
      posY: visual.position?.y,
      width: visual.position?.width,
      height: visual.position?.height,
    };
  };

  return (
    <Modal
      isOpen={isBuilderOpen}
      onClose={closeBuilder}
      title={editingVisual ? "Edit Visual" : "Create Visual"}
      size="md"
    >
      <VisualBuilder
        key={editingVisual ? `edit-${editingVisual.name}` : "create"}
        onSubmit={handleCreateOrUpdateVisual}
        onCancel={closeBuilder}
        initialData={getInitialData(editingVisual)}
      />
    </Modal>
  );
}
