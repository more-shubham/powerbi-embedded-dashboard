"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PageInfo } from "@/types";

interface PowerBIPageNavigationProps {
  pages: PageInfo[];
  currentPageIndex: number;
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
}

export function PowerBIPageNavigation({
  pages,
  currentPageIndex,
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
}: PowerBIPageNavigationProps) {
  if (pages.length <= 1) return null;

  return (
    <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full bg-white/95 px-2 py-1 shadow-lg backdrop-blur-sm dark:bg-gray-800/95">
      {/* Previous Page */}
      <button
        onClick={onPrevious}
        disabled={!canGoPrevious}
        className={`rounded-full p-1.5 transition-all hover:bg-gray-100 dark:hover:bg-gray-700 ${
          !canGoPrevious ? "cursor-not-allowed opacity-30" : "opacity-70 hover:opacity-100"
        }`}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4 text-gray-700 dark:text-gray-200" />
      </button>

      {/* Page Indicator */}
      <span className="min-w-20 px-2 text-center text-xs font-medium text-gray-700 dark:text-gray-200">
        {currentPageIndex + 1} / {pages.length}
      </span>

      {/* Next Page */}
      <button
        onClick={onNext}
        disabled={!canGoNext}
        className={`rounded-full p-1.5 transition-all hover:bg-gray-100 dark:hover:bg-gray-700 ${
          !canGoNext ? "cursor-not-allowed opacity-30" : "opacity-70 hover:opacity-100"
        }`}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4 text-gray-700 dark:text-gray-200" />
      </button>
    </div>
  );
}
