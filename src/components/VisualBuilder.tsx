"use client";

import { useEffect, useRef } from "react";
import { useForm, FormProvider, useWatch, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronDown, Plus, X } from "lucide-react";
import {
  visualTypeOptions,
  tableOptions,
  columnsByTable,
  measuresByTable,
  visualsWithCategory,
} from "@/config/visual-builder-schema";
import type { CreateVisualConfig, DataField } from "@/lib/powerbi-visual-creator";

const valueSchema = z.object({
  table: z.string().min(1, "Required"),
  measure: z.string().min(1, "Required"),
});

const formSchema = z
  .object({
    visualType: z.string().min(1, "Required"),
    title: z.string().optional(),
    categoryTable: z.string().optional(),
    categoryColumn: z.string().optional(),
    values: z.array(valueSchema).min(1, "At least one measure required"),
    posX: z.number().min(0),
    posY: z.number().min(0),
    width: z.number().min(100),
    height: z.number().min(100),
  })
  .superRefine((data, ctx) => {
    if (visualsWithCategory.includes(data.visualType)) {
      if (!data.categoryTable) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required", path: ["categoryTable"] });
      }
      if (!data.categoryColumn) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Required",
          path: ["categoryColumn"],
        });
      }
    }
  });

type FormData = z.infer<typeof formSchema>;

interface InitialData {
  visualType: string;
  title?: string;
  categoryTable?: string;
  categoryColumn?: string;
  values?: Array<{ table: string; measure: string }>;
  posX?: number;
  posY?: number;
  width?: number;
  height?: number;
}

interface VisualBuilderProps {
  onSubmit: (config: CreateVisualConfig) => void;
  onCancel: () => void;
  initialData?: InitialData;
}

export function VisualBuilder({ onSubmit, onCancel, initialData }: VisualBuilderProps) {
  const isEditMode = !!initialData;

  const methods = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      visualType: initialData?.visualType || "",
      title: initialData?.title || "",
      categoryTable: initialData?.categoryTable || "",
      categoryColumn: initialData?.categoryColumn || "",
      values: initialData?.values?.length ? initialData.values : [{ table: "", measure: "" }],
      posX: initialData?.posX ?? 0,
      posY: initialData?.posY ?? 0,
      width: initialData?.width ?? 400,
      height: initialData?.height ?? 300,
    },
    mode: "onBlur",
  });

  const {
    register,
    control,
    setValue,
    handleSubmit,
    formState: { errors },
  } = methods;

  const visualType = useWatch({ control, name: "visualType" });
  const categoryTable = useWatch({ control, name: "categoryTable" });
  const values = useWatch({ control, name: "values" });

  const needsCategory = visualsWithCategory.includes(visualType);
  const dimensionTables = tableOptions.filter((t) => t.group === "Dimensions");
  const measureTables = tableOptions.filter((t) => t.group === "Measures");
  const categoryColumns = categoryTable ? columnsByTable[categoryTable] || [] : [];

  const addValueField = () => setValue("values", [...values, { table: "", measure: "" }]);
  const removeValueField = (index: number) => {
    if (values.length > 1)
      setValue(
        "values",
        values.filter((_, i) => i !== index)
      );
  };

  const onFormSubmit = (data: FormData) => {
    const valueFields: DataField[] = data.values
      .filter((v) => v.table && v.measure)
      .map((v) => ({ table: v.table, measure: v.measure }));

    const config: CreateVisualConfig = {
      visualType: data.visualType,
      title: data.title || undefined,
      dataRoles: { values: valueFields },
      position: { x: data.posX, y: data.posY, width: data.width, height: data.height },
    };

    if (needsCategory && data.categoryTable && data.categoryColumn) {
      config.dataRoles.category = { table: data.categoryTable, column: data.categoryColumn };
    }

    onSubmit(config);
  };

  const inputClass =
    "w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white";
  const selectClass = `${inputClass} appearance-none pr-7`;
  const labelClass = "block text-xs font-medium text-gray-600 dark:text-gray-400 mb-0.5";

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-3">
        {/* Row 1: Visual Type & Title */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>
              Visual Type <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                className={`${selectClass} ${errors.visualType ? "border-red-400" : ""}`}
                {...register("visualType")}
              >
                <option value="">Select...</option>
                {visualTypeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute top-1/2 right-2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            </div>
            {errors.visualType && (
              <p className="mt-0.5 text-xs text-red-500">{errors.visualType.message}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>Title</label>
            <input
              type="text"
              className={inputClass}
              placeholder="Optional title..."
              {...register("title")}
            />
          </div>
        </div>

        {/* Category (X-Axis) */}
        {needsCategory && (
          <div>
            <label className={labelClass}>
              Category (X-Axis) <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <select
                  className={`${selectClass} ${errors.categoryTable ? "border-red-400" : ""}`}
                  {...register("categoryTable")}
                >
                  <option value="">Table...</option>
                  {dimensionTables.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute top-1/2 right-2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              </div>
              <div className="relative">
                <select
                  className={`${selectClass} ${errors.categoryColumn ? "border-red-400" : ""}`}
                  disabled={!categoryTable}
                  {...register("categoryColumn")}
                >
                  <option value="">Column...</option>
                  {categoryColumns.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute top-1/2 right-2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>
        )}

        {/* Values (Measures) */}
        <div>
          <div className="mb-0.5 flex items-center justify-between">
            <label className={labelClass}>
              Values <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={addValueField}
              className="flex items-center gap-0.5 text-xs text-blue-600 hover:text-blue-700"
            >
              <Plus className="h-3 w-3" /> Add
            </button>
          </div>
          <div className="space-y-1.5">
            {values.map((_, index) => (
              <ValueFieldRow
                key={index}
                index={index}
                measureTables={measureTables}
                onRemove={() => removeValueField(index)}
                canRemove={values.length > 1}
              />
            ))}
          </div>
          {errors.values && typeof errors.values.message === "string" && (
            <p className="mt-0.5 text-xs text-red-500">{errors.values.message}</p>
          )}
        </div>

        {/* Position & Size */}
        <div>
          <label className={labelClass}>Position & Size</label>
          <div className="grid grid-cols-4 gap-2">
            <div>
              <input
                type="number"
                placeholder="X"
                className={`${inputClass} ${errors.posX ? "border-red-400" : ""}`}
                {...register("posX", { valueAsNumber: true })}
              />
            </div>
            <div>
              <input
                type="number"
                placeholder="Y"
                className={`${inputClass} ${errors.posY ? "border-red-400" : ""}`}
                {...register("posY", { valueAsNumber: true })}
              />
            </div>
            <div>
              <input
                type="number"
                placeholder="Width"
                className={`${inputClass} ${errors.width ? "border-red-400" : ""}`}
                {...register("width", { valueAsNumber: true })}
              />
            </div>
            <div>
              <input
                type="number"
                placeholder="Height"
                className={`${inputClass} ${errors.height ? "border-red-400" : ""}`}
                {...register("height", { valueAsNumber: true })}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          >
            {isEditMode ? "Update Visual" : "Create Visual"}
          </button>
        </div>
      </form>
    </FormProvider>
  );
}

function ValueFieldRow({
  index,
  measureTables,
  onRemove,
  canRemove,
}: {
  index: number;
  measureTables: typeof tableOptions;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const {
    register,
    control,
    setValue,
    formState: { errors },
  } = useFormContext<FormData>();
  const valueTable = useWatch({ control, name: `values.${index}.table` });
  const measures = valueTable ? measuresByTable[valueTable] || [] : [];

  // Track previous table value to only clear measure when table actually changes
  const prevTableRef = useRef<string | undefined>(valueTable);

  useEffect(() => {
    // Only clear measure if table changed from a previous value (not on initial mount)
    if (prevTableRef.current !== undefined && prevTableRef.current !== valueTable) {
      setValue(`values.${index}.measure`, "");
    }
    prevTableRef.current = valueTable;
  }, [valueTable, index, setValue]);

  const selectClass =
    "w-full rounded border border-gray-300 px-2 py-1.5 text-sm appearance-none pr-7 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white";
  const tableError = errors.values?.[index]?.table;
  const measureError = errors.values?.[index]?.measure;

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <select
          className={`${selectClass} ${tableError ? "border-red-400" : ""}`}
          {...register(`values.${index}.table`)}
        >
          <option value="">Table...</option>
          {measureTables.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
      </div>
      <div className="relative flex-1">
        <select
          className={`${selectClass} ${measureError ? "border-red-400" : ""}`}
          disabled={!valueTable}
          {...register(`values.${index}.measure`)}
        >
          <option value="">Measure...</option>
          {measures.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
      </div>
      {canRemove && (
        <button type="button" onClick={onRemove} className="p-1 text-gray-400 hover:text-red-500">
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
