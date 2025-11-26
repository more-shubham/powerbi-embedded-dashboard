"use client";

import { usePowerBI } from "@/contexts";
import { deleteVisual } from "@/lib/powerbi-operations";
import type { PowerBIPage, EditingVisual } from "@/types";
import { Drawer } from "../ui/Drawer";
import { VisualsList } from "./VisualsList";

export function PowerBIVisualsDrawer() {
  const {
    state: { report, activeDrawer, visualsRefreshKey },
    closeDrawer,
    openBuilder,
    refreshVisuals,
  } = usePowerBI();

  const handleEditFromList = (visual: EditingVisual) => {
    closeDrawer();
    openBuilder(visual);
  };

  const handleDeleteVisual = async (visualName: string): Promise<boolean> => {
    if (!report) return false;

    try {
      const pages = await report.getPages();
      const activePage = pages.find((p) => p.isActive) as PowerBIPage | undefined;

      if (!activePage) return false;

      await deleteVisual(activePage, visualName);
      refreshVisuals();
      return true;
    } catch {
      return false;
    }
  };

  return (
    <Drawer isOpen={activeDrawer === "visuals"} onClose={closeDrawer} title="Visuals" width="sm">
      <VisualsList
        report={report}
        onEditVisual={handleEditFromList}
        onDeleteVisual={handleDeleteVisual}
        refreshKey={visualsRefreshKey}
      />
    </Drawer>
  );
}
