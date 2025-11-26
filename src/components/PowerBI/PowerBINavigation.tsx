"use client";

import { usePowerBI } from "@/contexts";
import { PowerBIPageNavigation } from "./PowerBIPageNavigation";

export function PowerBINavigation() {
  const {
    state: { pages, currentPageIndex, loading, error },
    goToPreviousPage,
    goToNextPage,
    canGoPrevious,
    canGoNext,
  } = usePowerBI();

  if (loading || error) {
    return null;
  }

  return (
    <PowerBIPageNavigation
      pages={pages}
      currentPageIndex={currentPageIndex}
      onPrevious={goToPreviousPage}
      onNext={goToNextPage}
      canGoPrevious={canGoPrevious}
      canGoNext={canGoNext}
    />
  );
}
