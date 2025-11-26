import type * as pbi from "powerbi-client";
import type { PowerBIVisual, PowerBIPage } from "@/types";

type ExtendedReport = pbi.Report & {
  deletePage?: (name: string) => Promise<void>;
};

export function hasDeletePageCapability(report: pbi.Report): report is ExtendedReport {
  return typeof (report as ExtendedReport).deletePage === "function";
}

export function asExtendedReport(report: pbi.Report): ExtendedReport {
  return report as ExtendedReport;
}

export function hasVisualDeleteCapability(
  visual: pbi.VisualDescriptor | PowerBIVisual
): visual is PowerBIVisual & { delete: () => Promise<void> } {
  return typeof (visual as PowerBIVisual).delete === "function";
}

export function hasPageDeleteVisualCapability(
  page: pbi.Page | PowerBIPage
): page is PowerBIPage & { deleteVisual: (name: string) => Promise<void> } {
  return typeof (page as PowerBIPage).deleteVisual === "function";
}

export function hasPageCreateVisualCapability(
  page: pbi.Page | PowerBIPage
): page is PowerBIPage & { createVisual: NonNullable<PowerBIPage["createVisual"]> } {
  return typeof (page as PowerBIPage).createVisual === "function";
}

export function asExtendedVisual(visual: pbi.VisualDescriptor): PowerBIVisual {
  return visual as unknown as PowerBIVisual;
}

export function asExtendedPage(page: pbi.Page): PowerBIPage {
  return page as PowerBIPage;
}

export function hasGetDataFieldsCapability(
  visual: pbi.VisualDescriptor | PowerBIVisual
): visual is PowerBIVisual & { getDataFields: NonNullable<PowerBIVisual["getDataFields"]> } {
  return typeof (visual as PowerBIVisual).getDataFields === "function";
}

export function hasAddDataFieldCapability(
  visual: pbi.VisualDescriptor | PowerBIVisual
): visual is PowerBIVisual & { addDataField: NonNullable<PowerBIVisual["addDataField"]> } {
  return typeof (visual as PowerBIVisual).addDataField === "function";
}

export function hasSetPropertyCapability(
  visual: pbi.VisualDescriptor | PowerBIVisual
): visual is PowerBIVisual & { setProperty: NonNullable<PowerBIVisual["setProperty"]> } {
  return typeof (visual as PowerBIVisual).setProperty === "function";
}

export function hasChangeTypeCapability(
  visual: pbi.VisualDescriptor | PowerBIVisual
): visual is PowerBIVisual & { changeType: NonNullable<PowerBIVisual["changeType"]> } {
  return typeof (visual as PowerBIVisual).changeType === "function";
}
