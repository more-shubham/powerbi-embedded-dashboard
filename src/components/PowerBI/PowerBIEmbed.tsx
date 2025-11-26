"use client";

import { useState } from "react";
import "powerbi-report-authoring";
import { usePowerBIEmbed, usePowerBIPages, usePowerBIVisualEditor } from "@/hooks";
import { EMBED_CONFIG } from "@/constants";
import { createOrUpdateVisual, deletePage, createPage } from "@/lib/powerbi-operations";
import type { PowerBIPage, EditingVisual } from "@/types";
import type { CreateVisualConfig } from "@/lib/powerbi-visual-creator";

import { Modal } from "../ui/Modal";
import { Drawer } from "../ui/Drawer";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { VisualBuilder } from "../VisualBuilder";
import {
  PowerBIPageNavigation,
  PowerBILoadingState,
  PowerBIErrorState,
  FloatingButtonGroup,
  PagesList,
  VisualsList,
  FiltersPanel,
} from "./index";

export default function PowerBIEmbed() {
  const {
    containerRef,
    report,
    loading,
    error,
    pages,
    currentPageIndex,
    setCurrentPageIndex,
    refreshPages,
  } = usePowerBIEmbed();

  const { goToPreviousPage, goToNextPage, goToPage, canGoPrevious, canGoNext } = usePowerBIPages({
    report,
    pages,
    currentPageIndex,
    setCurrentPageIndex,
  });

  const {
    editingVisual,
    setEditingVisual,
    isBuilderOpen,
    setIsBuilderOpen,
    closeBuilder,
    handleDeleteVisual,
  } = usePowerBIVisualEditor(report);

  const [activeDrawer, setActiveDrawer] = useState<"pages" | "visuals" | "filters" | null>(null);
  const [visualsRefreshKey, setVisualsRefreshKey] = useState(0);

  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleEditFromList = (visual: EditingVisual) => {
    setEditingVisual(visual);
    setActiveDrawer(null);
    setIsBuilderOpen(true);
  };

  const handleSaveReport = async () => {
    if (!report) return;

    setIsSaving(true);
    try {
      await report.save();
      setShowSaveConfirm(false);
    } catch {
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreatePage = async (displayName: string): Promise<boolean> => {
    if (!report) return false;

    try {
      const newPage = await createPage(report, displayName);
      await refreshPages();

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

      if (pageIndex === currentPageIndex && pageIndex > 0) {
        goToPage(pageIndex - 1);
      }

      await refreshPages();
      return true;
    } catch {
      return false;
    }
  };

  const handleCreateOrUpdateVisual = async (config: CreateVisualConfig) => {
    if (!report) return;

    try {
      const reportPages = await report.getPages();
      const activePage = reportPages.find((p) => p.isActive) as PowerBIPage | undefined;
      if (!activePage) return;

      await createOrUpdateVisual(activePage, config, editingVisual?.visual);

      setVisualsRefreshKey((prev) => prev + 1);
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
    <div className="relative h-screen w-screen overflow-hidden">
      {loading && <PowerBILoadingState />}
      {error && <PowerBIErrorState error={error} onRetry={() => window.location.reload()} />}

      <div
        ref={containerRef}
        className="h-full w-full"
        style={{ height: "100vh", width: "100vw" }}
      />

      {!loading && !error && (
        <PowerBIPageNavigation
          pages={pages}
          currentPageIndex={currentPageIndex}
          onPrevious={goToPreviousPage}
          onNext={goToNextPage}
          canGoPrevious={canGoPrevious}
          canGoNext={canGoNext}
        />
      )}

      {/* Floating Button Group - Save, Edit, Pages, Visuals, Filters */}
      <FloatingButtonGroup
        visible={
          !loading && !error && currentPageIndex >= EMBED_CONFIG.minPageIndexForVisualCreation
        }
        onCreateVisual={() => setIsBuilderOpen(true)}
        onShowPages={() => setActiveDrawer("pages")}
        onShowVisuals={() => setActiveDrawer("visuals")}
        onShowFilters={() => setActiveDrawer("filters")}
        onSaveReport={() => setShowSaveConfirm(true)}
        isSaving={isSaving}
      />

      {/* Visual Builder Modal */}
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

      {/* Pages List Drawer */}
      <Drawer
        isOpen={activeDrawer === "pages"}
        onClose={() => setActiveDrawer(null)}
        title="Pages"
        width="sm"
      >
        <PagesList
          pages={pages}
          currentPageIndex={currentPageIndex}
          onPageSelect={goToPage}
          onClose={() => setActiveDrawer(null)}
          onDeletePage={handleDeletePage}
          onCreatePage={handleCreatePage}
        />
      </Drawer>

      {/* Visuals List Drawer */}
      <Drawer
        isOpen={activeDrawer === "visuals"}
        onClose={() => setActiveDrawer(null)}
        title="Visuals"
        width="sm"
      >
        <VisualsList
          report={report}
          onEditVisual={handleEditFromList}
          onDeleteVisual={async (name) => {
            const success = await handleDeleteVisual(name);
            if (success) {
              setVisualsRefreshKey((prev) => prev + 1);
            }
            return success;
          }}
          refreshKey={visualsRefreshKey}
        />
      </Drawer>

      {/* Filters Drawer */}
      <Drawer
        isOpen={activeDrawer === "filters"}
        onClose={() => setActiveDrawer(null)}
        title="Filters"
        width="sm"
      >
        <FiltersPanel report={report} />
      </Drawer>

      {/* Save Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showSaveConfirm}
        onClose={() => setShowSaveConfirm(false)}
        onConfirm={handleSaveReport}
        title="Save Report"
        message={
          <>
            <p className="mb-2">This will permanently save all changes to the Power BI report.</p>
            <p className="font-medium text-amber-600 dark:text-amber-400">
              This action will modify the original report and affect all users who access it.
            </p>
          </>
        }
        confirmText="Save Report"
        cancelText="Cancel"
        variant="warning"
        isLoading={isSaving}
      />
    </div>
  );
}
