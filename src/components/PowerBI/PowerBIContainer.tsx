"use client";

import { usePowerBI } from "@/contexts";

export function PowerBIContainer() {
  const { containerRef } = usePowerBI();

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
      style={{ height: "100vh", width: "100vw" }}
      role="application"
      aria-label="Power BI Report"
    />
  );
}
