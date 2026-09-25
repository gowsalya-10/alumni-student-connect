import React from "react";
import { cn } from "@/lib/utils";

export interface ProgressRingProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  showValue?: boolean;
}

export const ProgressRing = React.forwardRef<HTMLDivElement, ProgressRingProps>(
  ({ className, value, size = 64, strokeWidth = 6, label, showValue = true, ...props }, ref) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;

    return (
      <div
        ref={ref}
        className={cn("relative inline-flex items-center justify-center", className)}
        {...props}
      >
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
          aria-label={label || `${value}%`}
        >
          {/* Background circle */}
          <circle
            className="text-gray-200 dark:text-gray-800"
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          {/* Progress circle */}
          <circle
            className="text-blue-600 dark:text-blue-500 transition-all duration-500 ease-in-out"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
        </svg>
        {showValue && (
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {Math.round(value)}%
            </span>
          </div>
        )}
      </div>
    );
  }
);
ProgressRing.displayName = "ProgressRing";
