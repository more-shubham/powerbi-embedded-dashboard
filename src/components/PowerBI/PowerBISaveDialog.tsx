"use client";

import { usePowerBI } from "@/contexts";
import { ConfirmDialog } from "../ui/ConfirmDialog";

export function PowerBISaveDialog() {
  const {
    state: { report, showSaveConfirm, isSaving },
    closeSaveConfirm,
    setSaving,
  } = usePowerBI();

  const handleSaveReport = async () => {
    if (!report) return;

    setSaving(true);
    try {
      await report.save();
      closeSaveConfirm();
    } catch {
      // Save failed
    } finally {
      setSaving(false);
    }
  };

  return (
    <ConfirmDialog
      isOpen={showSaveConfirm}
      onClose={closeSaveConfirm}
      onConfirm={handleSaveReport}
      title="Save Report"
      message={
        <>
          <p className="mb-2">This will permanently save all changes to the Power BI report.</p>
          <p className="font-medium text-amber-600 dark:text-amber-400">
            This action will modify the original report and affect all users who access it.
          </p>
        </>
      }
      confirmText="Save Report"
      cancelText="Cancel"
      variant="warning"
      isLoading={isSaving}
    />
  );
}
