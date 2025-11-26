"use client";

import { useFormContext, Controller } from "react-hook-form";
import type { FormField as FormFieldType } from "@/lib/form-schema";
import { ChevronDown } from "lucide-react";

interface FormFieldProps {
  field: FormFieldType;
}

export function FormField({ field }: FormFieldProps) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext();
  const error = errors[field.name];

  const baseInputClass = `
    w-full rounded-lg border px-3 py-2 text-sm
    transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    disabled:bg-gray-100 disabled:cursor-not-allowed
    dark:bg-gray-700 dark:border-gray-600 dark:text-white
    ${error ? "border-red-500" : "border-gray-300 dark:border-gray-600"}
  `;

  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

  const renderField = () => {
    switch (field.type) {
      case "text":
      case "number":
        return (
          <input
            type={field.type}
            placeholder={field.placeholder}
            disabled={field.disabled}
            className={baseInputClass}
            {...register(field.name, {
              required: field.required ? `${field.label} is required` : false,
              min: field.validation?.min,
              max: field.validation?.max,
              minLength: field.validation?.minLength,
              maxLength: field.validation?.maxLength,
              pattern: field.validation?.pattern
                ? {
                    value: new RegExp(field.validation.pattern),
                    message: field.validation.message || "Invalid format",
                  }
                : undefined,
            })}
          />
        );

      case "textarea":
        return (
          <textarea
            placeholder={field.placeholder}
            disabled={field.disabled}
            rows={4}
            className={baseInputClass}
            {...register(field.name, {
              required: field.required ? `${field.label} is required` : false,
            })}
          />
        );

      case "select":
        return (
          <div className="relative">
            <select
              disabled={field.disabled}
              className={`${baseInputClass} appearance-none pr-10`}
              {...register(field.name, {
                required: field.required ? `${field.label} is required` : false,
              })}
            >
              <option value="">{field.placeholder || "Select..."}</option>
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-500" />
          </div>
        );

      case "multiselect":
        return (
          <Controller
            name={field.name}
            control={control}
            rules={{ required: field.required ? `${field.label} is required` : false }}
            render={({ field: controllerField }) => (
              <div className="space-y-2">
                {field.options?.map((option) => (
                  <label key={option.value} className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      value={option.value}
                      checked={((controllerField.value as string[]) || []).includes(option.value)}
                      onChange={(e) => {
                        const current = (controllerField.value as string[]) || [];
                        if (e.target.checked) {
                          controllerField.onChange([...current, option.value]);
                        } else {
                          controllerField.onChange(current.filter((v) => v !== option.value));
                        }
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
                  </label>
                ))}
              </div>
            )}
          />
        );

      case "checkbox":
        return (
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              disabled={field.disabled}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              {...register(field.name)}
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {field.placeholder || field.label}
            </span>
          </label>
        );

      case "radio":
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <label key={option.value} className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  value={option.value}
                  disabled={field.disabled}
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                  {...register(field.name, {
                    required: field.required ? `${field.label} is required` : false,
                  })}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
              </label>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  if (field.type === "checkbox") {
    return (
      <div className={`${field.className || ""}`}>
        {renderField()}
        {field.help && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{field.help}</p>
        )}
        {error && <p className="mt-1 text-xs text-red-500">{error.message as string}</p>}
      </div>
    );
  }

  return (
    <div className={`${field.className || ""}`}>
      <label className={labelClass}>
        {field.label}
        {field.required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {renderField()}
      {field.help && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{field.help}</p>}
      {error && <p className="mt-1 text-xs text-red-500">{error.message as string}</p>}
    </div>
  );
}
