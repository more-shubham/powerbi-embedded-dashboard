"use client";

import { usePowerBI } from "@/contexts";
import { createPage, deletePage } from "@/lib/powerbi-operations";
import { Drawer } from "../ui/Drawer";
import { PagesList } from "./PagesList";

export function PowerBIPagesDrawer() {
  const {
    state: { report, pages, currentPageIndex, activeDrawer },
    goToPage,
    closeDrawer,
    refreshPages,
  } = usePowerBI();

  const handleCreatePage = async (displayName: string): Promise<boolean> => {
    if (!report) return false;

    try {
      const newPage = await createPage(report, displayName);
      await refreshPages();

      // Navigate to the new page
      const updatedPages = await report.getPages();
      const newPageIndex = updatedPages.findIndex((p) => p.name === newPage.name);
      if (newPageIndex >= 0) {
        goToPage(newPageIndex);
      }

      return true;
    } catch {
      return false;
    }
  };

  const handleDeletePage = async (pageName: string, pageIndex: number): Promise<boolean> => {
    if (!report) return false;

    try {
      await deletePage(report, pageName);

      // If we deleted the current page, go to previous page
      if (pageIndex === currentPageIndex && pageIndex > 0) {
        goToPage(pageIndex - 1);
      }

      await refreshPages();
      return true;
    } catch {
      return false;
    }
  };

  return (
    <Drawer isOpen={activeDrawer === "pages"} onClose={closeDrawer} title="Pages" width="sm">
      <PagesList
        pages={pages}
        currentPageIndex={currentPageIndex}
        onPageSelect={goToPage}
        onClose={closeDrawer}
        onDeletePage={handleDeletePage}
        onCreatePage={handleCreatePage}
      />
    </Drawer>
  );
}
