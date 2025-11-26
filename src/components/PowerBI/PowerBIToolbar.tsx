"use client";

import { usePowerBI } from "@/contexts";
import { EMBED_CONFIG } from "@/constants";
import { FloatingButtonGroup } from "./FloatingButtonGroup";

export function PowerBIToolbar() {
  const {
    state: { loading, error, currentPageIndex, isSaving },
    openBuilder,
    openDrawer,
    openSaveConfirm,
  } = usePowerBI();

  const isVisible =
    !loading && !error && currentPageIndex >= EMBED_CONFIG.minPageIndexForVisualCreation;

  return (
    <FloatingButtonGroup
      visible={isVisible}
      onCreateVisual={() => openBuilder()}
      onShowPages={() => openDrawer("pages")}
      onShowVisuals={() => openDrawer("visuals")}
      onShowFilters={() => openDrawer("filters")}
      onSaveReport={openSaveConfirm}
      isSaving={isSaving}
    />
  );
}
