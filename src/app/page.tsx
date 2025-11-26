"use client";

import dynamic from "next/dynamic";

const PowerBIReport = dynamic(() => import("@/components/PowerBI/PowerBIReport"), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="flex flex-col items-center gap-4">
        <div
          className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"
          role="status"
          aria-label="Loading"
        />
        <p className="text-gray-600 dark:text-gray-400">Loading Power BI...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  return (
    <main className="h-screen w-full overflow-hidden">
      <PowerBIReport />
    </main>
  );
}
