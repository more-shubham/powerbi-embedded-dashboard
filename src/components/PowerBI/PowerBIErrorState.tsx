"use client";

interface PowerBIErrorStateProps {
  error: string;
  onRetry: () => void;
}

export function PowerBIErrorState({ error, onRetry }: PowerBIErrorStateProps) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-red-50 dark:bg-red-900/20">
      <div className="flex flex-col items-center gap-4 p-8 text-center">
        <div className="text-4xl">⚠️</div>
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={onRetry}
          className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
