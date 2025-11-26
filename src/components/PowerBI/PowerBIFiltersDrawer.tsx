"use client";

import { usePowerBI } from "@/contexts";
import { Drawer } from "../ui/Drawer";
import { FiltersPanel } from "./FiltersPanel";

export function PowerBIFiltersDrawer() {
  const {
    state: { report, activeDrawer },
    closeDrawer,
  } = usePowerBI();

  return (
    <Drawer isOpen={activeDrawer === "filters"} onClose={closeDrawer} title="Filters" width="sm">
      <FiltersPanel report={report} />
    </Drawer>
  );
}
