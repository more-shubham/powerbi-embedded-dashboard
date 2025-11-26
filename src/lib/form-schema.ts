export type FieldType =
  | "text"
  | "number"
  | "select"
  | "multiselect"
  | "checkbox"
  | "radio"
  | "textarea"
  | "group"
  | "repeater";

export interface SelectOption {
  label: string;
  value: string;
  group?: string;
}

export interface FieldCondition {
  field: string;
  operator: "eq" | "neq" | "in" | "notIn" | "exists";
  value: unknown;
}

export interface FormField {
  name: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  help?: string;
  required?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  defaultValue?: unknown;
  options?: SelectOption[];
  optionsFrom?: string;
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    message?: string;
  };
  conditions?: FieldCondition[];
  children?: FormField[];
  columns?: number;
  className?: string;
}

export interface FormSchema {
  id: string;
  title?: string;
  description?: string;
  fields: FormField[];
  submitLabel?: string;
  layout?: "vertical" | "horizontal" | "grid";
  columns?: number;
}

export function checkConditions(
  conditions: FieldCondition[] | undefined,
  values: Record<string, unknown>
): boolean {
  if (!conditions || conditions.length === 0) return true;

  return conditions.every((condition) => {
    const fieldValue = values[condition.field];

    switch (condition.operator) {
      case "eq":
        return fieldValue === condition.value;
      case "neq":
        return fieldValue !== condition.value;
      case "in":
        return Array.isArray(condition.value) && condition.value.includes(fieldValue);
      case "notIn":
        return Array.isArray(condition.value) && !condition.value.includes(fieldValue);
      case "exists":
        return fieldValue !== undefined && fieldValue !== null && fieldValue !== "";
      default:
        return true;
    }
  });
}

export type FormValues = Record<string, unknown>;
