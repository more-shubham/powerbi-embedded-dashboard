import type * as pbi from "powerbi-client";

export interface VisualLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DataField {
  table: string;
  column?: string;
  measure?: string;
  $schema?: string;
}

export type DataFieldTarget = DataField;

export interface PropertyTarget {
  objectName: string;
  propertyName: string;
}

export interface PropertyValue {
  schema: string;
  value: unknown;
}

export interface PowerBIVisual {
  name: string;
  type: string;
  title?: string;
  layout?: VisualLayout;
  getDataFields?(roleName: string): Promise<DataField[]>;
  addDataField?(roleName: string, field: DataFieldTarget): Promise<void>;
  removeDataField?(roleName: string, index: number): Promise<void>;
  changeType?(type: string): Promise<void>;
  setProperty?(target: PropertyTarget, value: PropertyValue): Promise<void>;
  getProperty?(target: PropertyTarget): Promise<{ value: unknown }>;
  delete?(): Promise<void>;
}

export type PowerBIPage = pbi.Page & {
  moveVisual?(name: string, x: number, y: number): Promise<void>;
  resizeVisual?(name: string, width: number, height: number): Promise<void>;
  createVisual?(type: string, layout: object): Promise<{ visual: PowerBIVisual }>;
  deleteVisual?(visualName: string): Promise<void>;
};

export interface CommandDetail {
  command: string;
  visual: {
    name: string;
    type: string;
  };
}

export interface PageChangeDetail {
  newPage: {
    name: string;
  };
}

export interface PageInfo {
  name: string;
  displayName: string;
}

export interface EmbedConfig {
  embedToken: string;
  embedUrl: string;
  reportId: string;
  reportName: string;
  datasetId?: string;
}

export interface CategoryData {
  table: string;
  column: string;
}

export interface ValueData {
  table: string;
  measure: string;
}

export interface EditingVisual {
  visual: PowerBIVisual;
  type: string;
  name: string;
  title?: string;
  position?: VisualLayout;
  dataRoles?: {
    category?: CategoryData;
    values?: ValueData[];
  };
}

export interface DataRoles {
  category: string;
  values: string;
}

declare global {
  interface Window {
    powerbi: pbi.service.Service;
    report: pbi.Report | null;
  }
}
