"use client";

import "powerbi-report-authoring";
import { PowerBIProvider } from "@/contexts";
import { PowerBIContainer } from "./PowerBIContainer";
import { PowerBINavigation } from "./PowerBINavigation";
import { PowerBIToolbar } from "./PowerBIToolbar";
import { PowerBIVisualBuilderModal } from "./PowerBIVisualBuilderModal";
import { PowerBIPagesDrawer } from "./PowerBIPagesDrawer";
import { PowerBIVisualsDrawer } from "./PowerBIVisualsDrawer";
import { PowerBIFiltersDrawer } from "./PowerBIFiltersDrawer";
import { PowerBISaveDialog } from "./PowerBISaveDialog";
import { PowerBILoadingState } from "./PowerBILoadingState";
import { PowerBIErrorState } from "./PowerBIErrorState";
import { PowerBIErrorBoundary } from "./PowerBIErrorBoundary";
import { usePowerBI } from "@/contexts";

function PowerBIReportContent() {
  const {
    state: { loading, error },
  } = usePowerBI();

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {loading && <PowerBILoadingState />}
      {error && <PowerBIErrorState error={error} onRetry={() => window.location.reload()} />}

      <PowerBIContainer />

      <PowerBINavigation />
      <PowerBIToolbar />

      {/* Modals and Drawers */}
      <PowerBIVisualBuilderModal />
      <PowerBIPagesDrawer />
      <PowerBIVisualsDrawer />
      <PowerBIFiltersDrawer />
      <PowerBISaveDialog />
    </div>
  );
}

export default function PowerBIReport() {
  return (
    <PowerBIErrorBoundary>
      <PowerBIProvider>
        <PowerBIReportContent />
      </PowerBIProvider>
    </PowerBIErrorBoundary>
  );
}
