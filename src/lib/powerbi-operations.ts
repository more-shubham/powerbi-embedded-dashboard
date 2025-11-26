import * as pbi from "powerbi-client";
import type { PowerBIVisual, PowerBIPage, VisualLayout, DataRoles } from "@/types";
import { POWER_BI_SCHEMAS, getDataRolesForVisualType, normalizeVisualPosition } from "@/constants";
import type { CreateVisualConfig } from "./powerbi-visual-creator";
import {
  hasDeletePageCapability,
  hasVisualDeleteCapability,
  hasPageDeleteVisualCapability,
  asExtendedVisual,
} from "./powerbi-type-guards";

export async function createVisual(
  page: PowerBIPage,
  config: CreateVisualConfig
): Promise<PowerBIVisual> {
  const position = normalizeVisualPosition(config.position);
  const layout = {
    ...position,
    displayState: {
      mode: pbi.models.VisualContainerDisplayMode.Visible,
    },
  };

  const response = await page.createVisual!(config.visualType, layout);
  return response.visual;
}

export async function updateVisualPosition(
  page: PowerBIPage,
  visualName: string,
  position: VisualLayout
): Promise<void> {
  const normalized = normalizeVisualPosition(position);
  await page.moveVisual?.(visualName, normalized.x, normalized.y);
  await page.resizeVisual?.(visualName, normalized.width, normalized.height);
}

export async function removeAllDataFields(visual: PowerBIVisual, roles: DataRoles): Promise<void> {
  try {
    const categoryFields = await visual.getDataFields?.(roles.category);
    if (categoryFields) {
      for (let i = categoryFields.length - 1; i >= 0; i--) {
        await visual.removeDataField?.(roles.category, i);
      }
    }
  } catch {}

  try {
    const valueFields = await visual.getDataFields?.(roles.values);
    if (valueFields) {
      for (let i = valueFields.length - 1; i >= 0; i--) {
        await visual.removeDataField?.(roles.values, i);
      }
    }
  } catch {}
}

export async function addDataFields(
  visual: PowerBIVisual,
  config: CreateVisualConfig,
  roles: DataRoles
): Promise<void> {
  if (config.dataRoles.category?.column) {
    const categoryTarget = {
      table: config.dataRoles.category.table,
      column: config.dataRoles.category.column,
      $schema: POWER_BI_SCHEMAS.column,
    };
    await visual.addDataField?.(roles.category, categoryTarget);
  }

  if (config.dataRoles.values?.length) {
    for (const value of config.dataRoles.values) {
      if (value.measure) {
        const valueTarget = {
          table: value.table,
          measure: value.measure,
          $schema: POWER_BI_SCHEMAS.measure,
        };
        await visual.addDataField?.(roles.values, valueTarget);
      }
    }
  }
}

export async function setVisualTitle(visual: PowerBIVisual, title: string): Promise<void> {
  await visual.setProperty?.(
    { objectName: "title", propertyName: "visible" },
    { schema: POWER_BI_SCHEMAS.property, value: true }
  );
  await visual.setProperty?.(
    { objectName: "title", propertyName: "titleText" },
    { schema: POWER_BI_SCHEMAS.property, value: title }
  );
}

export async function createPage(report: pbi.Report, displayName: string): Promise<pbi.Page> {
  const reportWithAddPage = report as unknown as {
    addPage?: (displayName: string) => Promise<pbi.Page>;
  };

  if (typeof reportWithAddPage.addPage !== "function") {
    throw new Error("Create page is not supported");
  }

  return reportWithAddPage.addPage(displayName);
}

export async function deletePage(report: pbi.Report, pageName: string): Promise<void> {
  if (!hasDeletePageCapability(report)) {
    throw new Error("Delete page is not supported");
  }

  await report.deletePage!(pageName);
}

export async function deleteVisual(page: PowerBIPage, visualName: string): Promise<void> {
  const visuals = await page.getVisuals();
  const visual = visuals.find((v) => v.name === visualName);

  if (!visual) {
    throw new Error(`Visual "${visualName}" not found on page`);
  }

  const typedVisual = asExtendedVisual(visual);

  if (hasVisualDeleteCapability(typedVisual)) {
    await typedVisual.delete();
    return;
  }

  if (hasPageDeleteVisualCapability(page)) {
    await page.deleteVisual(visualName);
    return;
  }

  throw new Error("Delete visual is not supported - no delete method available");
}

export async function createOrUpdateVisual(
  page: PowerBIPage,
  config: CreateVisualConfig,
  existingVisual?: PowerBIVisual
): Promise<void> {
  const roles = getDataRolesForVisualType(config.visualType);
  let visual: PowerBIVisual;

  if (existingVisual) {
    visual = existingVisual;

    if (config.visualType !== existingVisual.type) {
      await visual.changeType?.(config.visualType);
    }

    if (config.position) {
      await updateVisualPosition(page, existingVisual.name, config.position);
    }

    await removeAllDataFields(visual, roles);
  } else {
    visual = await createVisual(page, config);
  }

  await addDataFields(visual, config, roles);

  if (config.title) {
    await setVisualTitle(visual, config.title);
  }
}
