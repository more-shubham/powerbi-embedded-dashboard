export const POWER_BI_SCHEMAS = {
  column: "http://powerbi.com/product/schema#column",
  measure: "http://powerbi.com/product/schema#measure",
  property: "http://powerbi.com/product/schema#property",
} as const;

export { getDataRolesForVisualType } from "./visual-types";

export const COMMON_DATA_ROLES = [
  "Category",
  "Y",
  "Values",
  "Fields",
  "Axis",
  "Legend",
  "Details",
  "Size",
  "Tooltips",
  "Group",
] as const;
