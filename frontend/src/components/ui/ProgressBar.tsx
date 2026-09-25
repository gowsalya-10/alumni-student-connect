import React from "react";
import { cn } from "@/lib/utils";

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  label?: string;
  showValue?: boolean;
}

export const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ className, value, label, showValue = false, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        {(label || showValue) && (
          <div className="flex justify-between items-center mb-1.5 text-sm">
            {label && <span className="font-medium text-gray-700 dark:text-gray-300">{label}</span>}
            {showValue && <span className="text-gray-500 dark:text-gray-400">{Math.round(value)}%</span>}
          </div>
        )}
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
          <div
            className="h-full bg-blue-600 transition-all duration-500 ease-in-out dark:bg-blue-500"
            style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
          />
        </div>
      </div>
    );
  }
);
ProgressBar.displayName = "ProgressBar";
