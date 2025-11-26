"use client";

import { useState } from "react";
import { FileText, Check, Trash2, Plus } from "lucide-react";
import type { PageInfo } from "@/types";

interface PagesListProps {
  pages: PageInfo[];
  currentPageIndex: number;
  onPageSelect: (index: number) => void;
  onClose: () => void;
  onDeletePage?: (pageName: string, pageIndex: number) => Promise<boolean>;
  onCreatePage?: (displayName: string) => Promise<boolean>;
}

// Page 9 has index 8 (0-based indexing)
const MIN_DELETABLE_PAGE_INDEX = 8;

export function PagesList({
  pages,
  currentPageIndex,
  onPageSelect,
  onClose,
  onDeletePage,
  onCreatePage,
}: PagesListProps) {
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [newPageName, setNewPageName] = useState("");

  const handleSelect = (index: number) => {
    onPageSelect(index);
    onClose();
  };

  const handleDelete = async (page: PageInfo, index: number) => {
    if (!onDeletePage) return;

    setDeletingIndex(index);
    await onDeletePage(page.name, index);
    setDeletingIndex(null);
  };

  const handleCreate = async () => {
    if (!onCreatePage || !newPageName.trim()) return;

    setIsCreating(true);
    const success = await onCreatePage(newPageName.trim());
    setIsCreating(false);

    if (success) {
      setNewPageName("");
      setShowCreateInput(false);
    }
  };

  const canDeletePage = (index: number) => index >= MIN_DELETABLE_PAGE_INDEX;

  return (
    <div className="space-y-1">
      {/* Create Page Section */}
      {onCreatePage && (
        <div className="mb-3 border-b border-gray-200 pb-3 dark:border-gray-700">
          {showCreateInput ? (
            <div className="space-y-2">
              <input
                type="text"
                value={newPageName}
                onChange={(e) => setNewPageName(e.target.value)}
                placeholder="Enter page name..."
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate();
                  if (e.key === "Escape") {
                    setShowCreateInput(false);
                    setNewPageName("");
                  }
                }}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreate}
                  disabled={isCreating || !newPageName.trim()}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                >
                  {isCreating ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Create
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowCreateInput(false);
                    setNewPageName("");
                  }}
                  className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowCreateInput(true)}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Create New Page
            </button>
          )}
        </div>
      )}

      <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
        {pages.length} pages in this report
      </p>
      <div className="max-h-[60vh] space-y-1 overflow-y-auto">
        {pages.map((page, index) => (
          <div
            key={page.name}
            className={`group flex items-center gap-2 rounded-lg px-3 py-2 transition-colors duration-150 ${
              index === currentPageIndex
                ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            } `}
          >
            <button
              onClick={() => handleSelect(index)}
              className="flex flex-1 items-center gap-3 text-left"
            >
              <FileText className="h-4 w-4 shrink-0" />
              <span className="flex-1 truncate text-sm">{page.displayName}</span>
              {index === currentPageIndex && (
                <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              )}
              <span className="text-xs text-gray-400 group-hover:hidden">{index + 1}</span>
            </button>
            {canDeletePage(index) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(page, index);
                }}
                disabled={deletingIndex === index}
                className="flex items-center justify-center rounded p-1.5 text-red-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
                title="Delete page"
              >
                {deletingIndex === index ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
