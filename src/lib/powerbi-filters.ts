import * as pbi from "powerbi-client";
import type { PowerBIVisual } from "@/types";
import { type FilterConfig, type FilterLevel, buildFilter } from "@/types/powerbi-filters";

interface FilterMethods {
  getFilters?: () => Promise<pbi.models.IFilter[]>;
  setFilters?: (filters: pbi.models.IFilter[]) => Promise<void>;
  updateFilters?: (
    operation: pbi.models.FiltersOperations,
    filters: pbi.models.IFilter[]
  ) => Promise<void>;
  removeFilters?: () => Promise<void>;
}

type VisualWithFilters = PowerBIVisual & FilterMethods;
type PageWithFilters = pbi.Page & Required<Pick<FilterMethods, "updateFilters">>;
type ReportWithFilters = pbi.Report & Required<Pick<FilterMethods, "updateFilters">>;

function asFilterable<T>(obj: unknown): T {
  return obj as T;
}

export async function applyVisualFilter(
  visual: PowerBIVisual,
  filterConfig: FilterConfig
): Promise<void> {
  const typedVisual = asFilterable<VisualWithFilters>(visual);
  const filter = buildFilter(filterConfig);

  if (typeof typedVisual.updateFilters === "function") {
    await typedVisual.updateFilters(pbi.models.FiltersOperations.Add, [filter]);
  } else if (typeof typedVisual.setFilters === "function") {
    const existingFilters = await getVisualFilters(visual);
    await typedVisual.setFilters([...existingFilters, filter]);
  } else {
    throw new Error("Visual does not support filters");
  }
}

export async function applyVisualFilters(
  visual: PowerBIVisual,
  filterConfigs: FilterConfig[]
): Promise<void> {
  const typedVisual = asFilterable<VisualWithFilters>(visual);
  const filters = filterConfigs.map(buildFilter);

  if (typeof typedVisual.updateFilters === "function") {
    await typedVisual.updateFilters(pbi.models.FiltersOperations.Replace, filters);
  } else if (typeof typedVisual.setFilters === "function") {
    await typedVisual.setFilters(filters);
  } else {
    throw new Error("Visual does not support filters");
  }
}

export async function getVisualFilters(visual: PowerBIVisual): Promise<pbi.models.IFilter[]> {
  const typedVisual = asFilterable<VisualWithFilters>(visual);

  if (typeof typedVisual.getFilters !== "function") {
    return [];
  }

  return typedVisual.getFilters();
}

export async function clearVisualFilters(visual: PowerBIVisual): Promise<void> {
  const typedVisual = asFilterable<VisualWithFilters>(visual);

  if (typeof typedVisual.updateFilters === "function") {
    await typedVisual.updateFilters(pbi.models.FiltersOperations.RemoveAll, []);
  } else if (typeof typedVisual.removeFilters === "function") {
    await typedVisual.removeFilters();
  } else if (typeof typedVisual.setFilters === "function") {
    await typedVisual.setFilters([]);
  }
}

export async function applyPageFilter(page: pbi.Page, filterConfig: FilterConfig): Promise<void> {
  const typedPage = asFilterable<PageWithFilters>(page);

  if (typeof typedPage.updateFilters !== "function") {
    throw new Error("Page does not support filters. Make sure the report has edit permissions.");
  }

  const filter = buildFilter(filterConfig);
  await typedPage.updateFilters(pbi.models.FiltersOperations.Add, [filter]);
}

export async function applyPageFilters(
  page: pbi.Page,
  filterConfigs: FilterConfig[]
): Promise<void> {
  const typedPage = asFilterable<PageWithFilters>(page);

  if (typeof typedPage.updateFilters !== "function") {
    throw new Error("Page does not support filters");
  }

  const filters = filterConfigs.map(buildFilter);
  await typedPage.updateFilters(pbi.models.FiltersOperations.Replace, filters);
}

export async function getPageFilters(page: pbi.Page): Promise<pbi.models.IFilter[]> {
  if (typeof page.getFilters !== "function") {
    return [];
  }

  return page.getFilters();
}

export async function clearPageFilters(page: pbi.Page): Promise<void> {
  const typedPage = asFilterable<PageWithFilters>(page);

  if (typeof typedPage.updateFilters === "function") {
    await typedPage.updateFilters(pbi.models.FiltersOperations.RemoveAll, []);
  }
}

export async function applyReportFilter(
  report: pbi.Report,
  filterConfig: FilterConfig
): Promise<void> {
  const typedReport = asFilterable<ReportWithFilters>(report);

  if (typeof typedReport.updateFilters !== "function") {
    throw new Error("Report does not support filters");
  }

  const filter = buildFilter(filterConfig);
  await typedReport.updateFilters(pbi.models.FiltersOperations.Add, [filter]);
}

export async function getReportFilters(report: pbi.Report): Promise<pbi.models.IFilter[]> {
  if (typeof report.getFilters !== "function") {
    return [];
  }

  return report.getFilters();
}

export async function clearReportFilters(report: pbi.Report): Promise<void> {
  const typedReport = asFilterable<ReportWithFilters>(report);

  if (typeof typedReport.updateFilters === "function") {
    await typedReport.updateFilters(pbi.models.FiltersOperations.RemoveAll, []);
  }
}

export async function applyFilter(
  target: PowerBIVisual | pbi.Page | pbi.Report,
  level: FilterLevel,
  filterConfig: FilterConfig
): Promise<void> {
  switch (level) {
    case "visual":
      await applyVisualFilter(target as PowerBIVisual, filterConfig);
      break;
    case "page":
      await applyPageFilter(target as pbi.Page, filterConfig);
      break;
    case "report":
      await applyReportFilter(target as pbi.Report, filterConfig);
      break;
  }
}

export async function clearFilters(
  target: PowerBIVisual | pbi.Page | pbi.Report,
  level: FilterLevel
): Promise<void> {
  switch (level) {
    case "visual":
      await clearVisualFilters(target as PowerBIVisual);
      break;
    case "page":
      await clearPageFilters(target as pbi.Page);
      break;
    case "report":
      await clearReportFilters(target as pbi.Report);
      break;
  }
}
