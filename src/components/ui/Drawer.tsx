"use client";

import { ReactNode, useEffect, useCallback, useId, useRef } from "react";
import { X } from "lucide-react";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  width?: "sm" | "md" | "lg";
}

const widthClasses = {
  sm: "w-72",
  md: "w-96",
  lg: "w-[480px]",
};

export function Drawer({ isOpen, onClose, title, children, width = "sm" }: DrawerProps) {
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
      // Focus the close button when drawer opens
      closeButtonRef.current?.focus();
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, handleEscape]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[100] bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"} `}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-hidden={!isOpen}
        className={`fixed top-0 right-0 z-[101] h-full ${widthClasses[width]} transform bg-white shadow-2xl transition-transform duration-300 ease-out dark:bg-gray-800 ${isOpen ? "translate-x-0" : "translate-x-full"} `}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
            <h2 id={titleId} className="text-sm font-semibold text-gray-900 dark:text-white">
              {title}
            </h2>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:hover:bg-gray-700 dark:hover:text-gray-300"
              aria-label="Close drawer"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Body */}
        <div
          className="overflow-y-auto p-4"
          style={{ maxHeight: title ? "calc(100vh - 52px)" : "100vh" }}
        >
          {children}
        </div>
      </aside>
    </>
  );
}
