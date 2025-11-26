"use client";

import { useForm, FormProvider } from "react-hook-form";
import type { FormSchema, FormValues } from "@/lib/form-schema";
import { checkConditions } from "@/lib/form-schema";
import { FormField } from "./FormField";
import { FormGroup } from "./FormGroup";

interface FormBuilderProps {
  schema: FormSchema;
  defaultValues?: FormValues;
  onSubmit: (values: FormValues) => void;
  onCancel?: () => void;
}

export function FormBuilder({ schema, defaultValues = {}, onSubmit, onCancel }: FormBuilderProps) {
  const methods = useForm({
    defaultValues: {
      ...getDefaultValues(schema),
      ...defaultValues,
    },
  });

  const values = methods.watch();

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
        {schema.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400">{schema.description}</p>
        )}

        <div
          className={` ${schema.layout === "grid" ? `grid gap-4 grid-cols-${schema.columns || 2}` : "space-y-4"} `}
        >
          {schema.fields.map((field) => {
            const isVisible = checkConditions(field.conditions, values);
            if (!isVisible || field.hidden) return null;

            if (field.type === "group") {
              return <FormGroup key={field.name} field={field} />;
            }

            return <FormField key={field.name} field={field} />;
          })}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
          >
            {schema.submitLabel || "Submit"}
          </button>
        </div>
      </form>
    </FormProvider>
  );
}

// Extract default values from schema
function getDefaultValues(schema: FormSchema): FormValues {
  const defaults: FormValues = {};

  const processFields = (fields: typeof schema.fields) => {
    for (const field of fields) {
      if (field.defaultValue !== undefined) {
        defaults[field.name] = field.defaultValue;
      } else if (field.type === "multiselect") {
        defaults[field.name] = [];
      }

      if (field.children) {
        processFields(field.children);
      }
    }
  };

  processFields(schema.fields);
  return defaults;
}
