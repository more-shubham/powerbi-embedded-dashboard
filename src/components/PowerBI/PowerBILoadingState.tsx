"use client";

export function PowerBILoadingState() {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
        <p className="text-gray-600 dark:text-gray-400">Loading report...</p>
      </div>
    </div>
  );
}
