import type { FormSchema, SelectOption } from "@/lib/form-schema";
import {
  getVisualTypeSelectOptions,
  VISUALS_WITH_CATEGORY,
  CARD_VISUALS,
  SLICER_VISUALS,
} from "@/constants/visual-types";

export const visualTypeOptions: SelectOption[] = getVisualTypeSelectOptions();

export const tableOptions: SelectOption[] = [
  { label: "Customer", value: "dimCustomer", group: "Dimensions" },
  { label: "Date", value: "DimDate", group: "Dimensions" },
  { label: "Product", value: "dimProduct", group: "Dimensions" },
  { label: "All Measures", value: "All Measures", group: "Measures" },
  { label: "Product Measures", value: "Product measures", group: "Measures" },
  { label: "Sales Trend Measures", value: "Sales Trend Measures", group: "Measures" },
];

export const columnsByTable: Record<string, SelectOption[]> = {
  dimCustomer: [
    { label: "Customer Bill To", value: "Customer Bill To" },
    { label: "Customer Ship To", value: "Customer Ship To" },
    { label: "Customer Code/Name", value: "Customer Code/Name" },
    { label: "Customer To Bill/Ship", value: "Customer To Bill/Ship" },
  ],
  DimDate: [
    { label: "Year", value: "Year Sort" },
    { label: "Quarter", value: "Quarter" },
    { label: "Month", value: "Month Name" },
    { label: "Month-Year", value: "Month-Year" },
    { label: "Week", value: "Weekly" },
    { label: "Day", value: "Day" },
    { label: "Day-Month", value: "Day-Month" },
  ],
  dimProduct: [
    { label: "Principal Name-Code", value: "Principal Name-Code" },
    { label: "Product Name-Code", value: "Product Name-Code" },
  ],
};

export const measuresByTable: Record<string, SelectOption[]> = {
  "All Measures": [
    { label: "Total Sales", value: "Total Sales" },
    { label: "Total Cases", value: "Total Cases" },
    { label: "Gross $", value: "## Gross $" },
    { label: "Net $", value: "## Net $" },
    { label: "Order Count", value: "Order Count" },
    { label: "Calculated Brokerage", value: "Calculated Brokerage" },
    { label: "Paid Brokerage", value: "Paid Brokerage" },
    { label: "Total Sales LY", value: "Total Sales LY" },
    { label: "Total Cases LY", value: "Total Cases LY" },
    { label: "% Growth Total Sales", value: "%G Total sales" },
    { label: "% Growth Total Cases", value: "%G Total cases" },
  ],
  "Product measures": [
    { label: "Gross $", value: "Gross $" },
    { label: "Net $", value: "Net Dollers" },
    { label: "Units Sold", value: "No. of unit sold" },
    { label: "LBs Sold", value: "No. of Lbs sold" },
    { label: "Orders", value: "No. of orders" },
    { label: "Gross Weight", value: "Gross Weight" },
    { label: "Net Weight", value: "Net Weight" },
  ],
  "Sales Trend Measures": [
    { label: "PP Gross $", value: "PP Gross $s" },
    { label: "PP Net $", value: "PP Net $" },
    { label: "PP Units", value: "PP Units" },
    { label: "SPLY Gross $", value: "SPLY Gross $" },
    { label: "SPLY Net $", value: "SPLY Net $" },
    { label: "SPLY Units", value: "SPLY Units" },
  ],
};

export const visualsWithCategory = VISUALS_WITH_CATEGORY;
export const slicerVisuals = SLICER_VISUALS;
export const cardVisuals = CARD_VISUALS;

export const visualBuilderSchema: FormSchema = {
  id: "visual-builder",
  title: "Create Power BI Visual",
  description: "Configure a new visual to add to your report",
  submitLabel: "Create Visual",
  fields: [
    {
      name: "visualType",
      type: "select",
      label: "Visual Type",
      required: true,
      options: visualTypeOptions,
      placeholder: "Select visual type...",
    },
    {
      name: "title",
      type: "text",
      label: "Visual Title",
      placeholder: "Enter a title for this visual",
    },
    {
      name: "categoryGroup",
      type: "group",
      label: "Category (X-Axis)",
      columns: 2,
      conditions: [{ field: "visualType", operator: "in", value: visualsWithCategory }],
      children: [
        {
          name: "categoryTable",
          type: "select",
          label: "Table",
          required: true,
          options: tableOptions.filter((t) => t.group === "Dimensions"),
          placeholder: "Select table...",
        },
        {
          name: "categoryColumn",
          type: "select",
          label: "Column",
          required: true,
          options: [],
          placeholder: "Select column...",
        },
      ],
    },
    {
      name: "valuesGroup",
      type: "group",
      label: "Values",
      columns: 2,
      children: [
        {
          name: "valueTable",
          type: "select",
          label: "Table",
          required: true,
          options: tableOptions.filter((t) => t.group === "Measures"),
          placeholder: "Select table...",
        },
        {
          name: "valueMeasure",
          type: "select",
          label: "Measure",
          required: true,
          options: [],
          placeholder: "Select measure...",
        },
      ],
    },
    {
      name: "addSecondValue",
      type: "checkbox",
      label: "Add second measure",
      placeholder: "Add another measure to compare",
    },
    {
      name: "secondValuesGroup",
      type: "group",
      label: "Second Value",
      columns: 2,
      conditions: [{ field: "addSecondValue", operator: "eq", value: true }],
      children: [
        {
          name: "secondValueTable",
          type: "select",
          label: "Table",
          options: tableOptions.filter((t) => t.group === "Measures"),
          placeholder: "Select table...",
        },
        {
          name: "secondValueMeasure",
          type: "select",
          label: "Measure",
          options: [],
          placeholder: "Select measure...",
        },
      ],
    },
    {
      name: "positionGroup",
      type: "group",
      label: "Position & Size",
      columns: 4,
      children: [
        {
          name: "posX",
          type: "number",
          label: "X",
          defaultValue: 0,
          validation: { min: 0 },
        },
        {
          name: "posY",
          type: "number",
          label: "Y",
          defaultValue: 0,
          validation: { min: 0 },
        },
        {
          name: "width",
          type: "number",
          label: "Width",
          defaultValue: 400,
          validation: { min: 100 },
        },
        {
          name: "height",
          type: "number",
          label: "Height",
          defaultValue: 300,
          validation: { min: 100 },
        },
      ],
    },
  ],
};
