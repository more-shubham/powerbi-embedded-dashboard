import type { PowerBIVisual, CategoryData, ValueData, VisualLayout } from "@/types";
import { getDataRolesForVisualType } from "@/constants";

export async function extractCategoryData(
  visual: PowerBIVisual,
  roleName: string
): Promise<CategoryData | undefined> {
  try {
    const fields = await visual.getDataFields?.(roleName);
    if (fields && fields.length > 0) {
      const field = fields[0];
      const columnName = field.column;
      const tableName = field.table;
      if (columnName && tableName) {
        return { table: tableName, column: columnName };
      }
    }
  } catch {}
  return undefined;
}

export async function extractValuesData(
  visual: PowerBIVisual,
  roleName: string
): Promise<ValueData[]> {
  const values: ValueData[] = [];
  try {
    const fields = await visual.getDataFields?.(roleName);
    if (fields && fields.length > 0) {
      for (const field of fields) {
        const measureName = field.measure;
        const tableName = field.table;
        if (measureName && tableName) {
          values.push({ table: tableName, measure: measureName });
        }
      }
    }
  } catch {}
  return values;
}

export async function getVisualTitle(visual: PowerBIVisual): Promise<string> {
  try {
    const titleProp = await visual.getProperty?.({
      objectName: "title",
      propertyName: "titleText",
    });
    if (titleProp?.value && typeof titleProp.value === "string") {
      return titleProp.value;
    }
  } catch {}
  return visual.title || "";
}

export function getVisualPosition(visual: PowerBIVisual): VisualLayout {
  const layout = visual.layout;
  return {
    x: layout?.x ?? 0,
    y: layout?.y ?? 0,
    width: layout?.width ?? 400,
    height: layout?.height ?? 300,
  };
}

export interface ExtractedVisualData {
  type: string;
  name: string;
  title: string;
  position: VisualLayout;
  category?: CategoryData;
  values: ValueData[];
}

export async function extractVisualData(visual: PowerBIVisual): Promise<ExtractedVisualData> {
  const roles = getDataRolesForVisualType(visual.type);

  const [title, category, values] = await Promise.all([
    getVisualTitle(visual),
    extractCategoryData(visual, roles.category),
    extractValuesData(visual, roles.values),
  ]);

  return {
    type: visual.type,
    name: visual.name,
    title,
    position: getVisualPosition(visual),
    category,
    values,
  };
}
