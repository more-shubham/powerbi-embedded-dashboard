"use client";

import { useFormContext } from "react-hook-form";
import type { FormField as FormFieldType } from "@/lib/form-schema";
import { checkConditions } from "@/lib/form-schema";
import { FormField } from "./FormField";

interface FormGroupProps {
  field: FormFieldType;
}

export function FormGroup({ field }: FormGroupProps) {
  const { watch } = useFormContext();
  const values = watch();

  if (!field.children) return null;

  const gridCols = field.columns || 1;
  const gridClass =
    {
      1: "grid-cols-1",
      2: "grid-cols-2",
      3: "grid-cols-3",
      4: "grid-cols-4",
    }[gridCols] || "grid-cols-1";

  return (
    <fieldset className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
      {field.label && (
        <legend className="px-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          {field.label}
        </legend>
      )}
      <div className={`grid gap-4 ${gridClass}`}>
        {field.children.map((childField) => {
          const isVisible = checkConditions(childField.conditions, values);
          if (!isVisible || childField.hidden) return null;

          if (childField.type === "group") {
            return <FormGroup key={childField.name} field={childField} />;
          }

          return <FormField key={childField.name} field={childField} />;
        })}
      </div>
    </fieldset>
  );
}
