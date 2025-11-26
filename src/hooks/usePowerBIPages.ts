"use client";

import { useEffect, useCallback } from "react";
import type * as pbi from "powerbi-client";
import type { PageInfo, PageChangeDetail } from "@/types";

interface UsePowerBIPagesProps {
  report: pbi.Report | null;
  pages: PageInfo[];
  currentPageIndex: number;
  setCurrentPageIndex: (index: number) => void;
}

interface UsePowerBIPagesReturn {
  goToPreviousPage: () => Promise<void>;
  goToNextPage: () => Promise<void>;
  goToPage: (index: number) => Promise<void>;
  canGoPrevious: boolean;
  canGoNext: boolean;
}

export function usePowerBIPages({
  report,
  pages,
  currentPageIndex,
  setCurrentPageIndex,
}: UsePowerBIPagesProps): UsePowerBIPagesReturn {
  useEffect(() => {
    if (!report) return;

    const handlePageChanged = (event: pbi.service.ICustomEvent<unknown>) => {
      const pageEvent = event.detail as PageChangeDetail;
      const newIndex = pages.findIndex((p) => p.name === pageEvent.newPage.name);
      if (newIndex >= 0) {
        setCurrentPageIndex(newIndex);
      }
    };

    report.on("pageChanged", handlePageChanged);

    return () => {
      report.off("pageChanged", handlePageChanged);
    };
  }, [report, pages, setCurrentPageIndex]);

  const goToPage = useCallback(
    async (index: number) => {
      if (!report || pages.length === 0 || index < 0 || index >= pages.length) {
        return;
      }
      try {
        await report.setPage(pages[index].name);
        setCurrentPageIndex(index);
      } catch {}
    },
    [report, pages, setCurrentPageIndex]
  );

  const goToPreviousPage = useCallback(async () => {
    if (currentPageIndex > 0) {
      await goToPage(currentPageIndex - 1);
    }
  }, [currentPageIndex, goToPage]);

  const goToNextPage = useCallback(async () => {
    if (currentPageIndex < pages.length - 1) {
      await goToPage(currentPageIndex + 1);
    }
  }, [currentPageIndex, pages.length, goToPage]);

  return {
    goToPreviousPage,
    goToNextPage,
    goToPage,
    canGoPrevious: currentPageIndex > 0,
    canGoNext: currentPageIndex < pages.length - 1,
  };
}
