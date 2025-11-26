import {
  BarChart3,
  PieChart,
  LineChart,
  Table2,
  CreditCard,
  Gauge,
  Grid3X3,
  LayoutGrid,
  TreeDeciduous,
  GitBranch,
  Circle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { DataRoles } from "@/types";

export interface VisualTypeMetadata {
  label: string;
  icon: LucideIcon;
  iconClassName?: string;
  dataRoles: DataRoles;
  category: "chart" | "card" | "table" | "slicer" | "other";
  needsCategory: boolean;
}

export const VISUAL_TYPES: Record<string, VisualTypeMetadata> = {
  clusteredBarChart: {
    label: "Bar Chart",
    icon: BarChart3,
    dataRoles: { category: "Category", values: "Y" },
    category: "chart",
    needsCategory: true,
  },
  clusteredColumnChart: {
    label: "Column Chart",
    icon: BarChart3,
    iconClassName: "rotate-90",
    dataRoles: { category: "Category", values: "Y" },
    category: "chart",
    needsCategory: true,
  },
  barChart: {
    label: "Bar Chart",
    icon: BarChart3,
    dataRoles: { category: "Category", values: "Y" },
    category: "chart",
    needsCategory: true,
  },
  columnChart: {
    label: "Column Chart",
    icon: BarChart3,
    iconClassName: "rotate-90",
    dataRoles: { category: "Category", values: "Y" },
    category: "chart",
    needsCategory: true,
  },
  lineChart: {
    label: "Line Chart",
    icon: LineChart,
    dataRoles: { category: "Category", values: "Y" },
    category: "chart",
    needsCategory: true,
  },
  areaChart: {
    label: "Area Chart",
    icon: LineChart,
    dataRoles: { category: "Category", values: "Y" },
    category: "chart",
    needsCategory: true,
  },
  pieChart: {
    label: "Pie Chart",
    icon: PieChart,
    dataRoles: { category: "Category", values: "Y" },
    category: "chart",
    needsCategory: true,
  },
  donutChart: {
    label: "Donut Chart",
    icon: PieChart,
    dataRoles: { category: "Category", values: "Y" },
    category: "chart",
    needsCategory: true,
  },
  card: {
    label: "Card",
    icon: CreditCard,
    dataRoles: { category: "Fields", values: "Fields" },
    category: "card",
    needsCategory: false,
  },
  multiRowCard: {
    label: "Multi-Row Card",
    icon: CreditCard,
    dataRoles: { category: "Fields", values: "Fields" },
    category: "card",
    needsCategory: false,
  },
  tableEx: {
    label: "Table",
    icon: Table2,
    dataRoles: { category: "Values", values: "Values" },
    category: "table",
    needsCategory: false,
  },
  matrix: {
    label: "Matrix",
    icon: Grid3X3,
    dataRoles: { category: "Rows", values: "Values" },
    category: "table",
    needsCategory: false,
  },
  gauge: {
    label: "Gauge",
    icon: Gauge,
    dataRoles: { category: "Y", values: "Y" },
    category: "card",
    needsCategory: false,
  },
  slicer: {
    label: "Slicer",
    icon: LayoutGrid,
    dataRoles: { category: "Values", values: "Values" },
    category: "slicer",
    needsCategory: false,
  },
  treemap: {
    label: "Treemap",
    icon: TreeDeciduous,
    dataRoles: { category: "Group", values: "Values" },
    category: "chart",
    needsCategory: true,
  },
  funnel: {
    label: "Funnel",
    icon: GitBranch,
    dataRoles: { category: "Category", values: "Y" },
    category: "chart",
    needsCategory: true,
  },
  scatterChart: {
    label: "Scatter Chart",
    icon: Circle,
    dataRoles: { category: "Category", values: "Y" },
    category: "chart",
    needsCategory: true,
  },
  lineClusteredColumnComboChart: {
    label: "Combo Chart",
    icon: BarChart3,
    dataRoles: { category: "Category", values: "Y" },
    category: "chart",
    needsCategory: true,
  },
};

export function getVisualTypeMetadata(visualType: string): VisualTypeMetadata {
  return (
    VISUAL_TYPES[visualType] || {
      label: visualType,
      icon: LayoutGrid,
      dataRoles: { category: "Category", values: "Y" },
      category: "other" as const,
      needsCategory: false,
    }
  );
}

export function getVisualTypeLabel(visualType: string): string {
  return VISUAL_TYPES[visualType]?.label || visualType;
}

export function getDataRolesForVisualType(visualType: string): DataRoles {
  return VISUAL_TYPES[visualType]?.dataRoles || { category: "Category", values: "Y" };
}

export function getVisualsWithCategory(): string[] {
  return Object.entries(VISUAL_TYPES)
    .filter(([, meta]) => meta.needsCategory)
    .map(([type]) => type);
}

export function getVisualTypesByCategory(category: VisualTypeMetadata["category"]): string[] {
  return Object.entries(VISUAL_TYPES)
    .filter(([, meta]) => meta.category === category)
    .map(([type]) => type);
}

export function getVisualTypeSelectOptions(): Array<{ label: string; value: string }> {
  return Object.entries(VISUAL_TYPES).map(([value, meta]) => ({
    label: meta.label,
    value,
  }));
}

export const VISUALS_WITH_CATEGORY = getVisualsWithCategory();
export const CARD_VISUALS = getVisualTypesByCategory("card");
export const SLICER_VISUALS = getVisualTypesByCategory("slicer");
export const TABLE_VISUALS = getVisualTypesByCategory("table");
export const CHART_VISUALS = getVisualTypesByCategory("chart");
