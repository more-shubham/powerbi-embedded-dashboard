"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

interface FloatingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
}

const positionClasses = {
  "top-right": "top-4 right-4",
  "top-left": "top-4 left-4",
  "bottom-right": "bottom-4 right-4",
  "bottom-left": "bottom-4 left-4",
};

export const FloatingButton = forwardRef<HTMLButtonElement, FloatingButtonProps>(
  ({ position = "top-right", className = "", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`fixed z-50 flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white shadow-md transition-all duration-200 hover:scale-105 hover:bg-blue-700 hover:shadow-lg active:scale-95 ${positionClasses[position]} ${className} `}
        {...props}
      >
        {children}
      </button>
    );
  }
);

FloatingButton.displayName = "FloatingButton";
