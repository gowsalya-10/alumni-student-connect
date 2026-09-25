import React from "react";
import { cn } from "@/lib/utils";

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ className, title, value, icon, trend, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900",
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          {icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
              {icon}
            </div>
          )}
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <p className="text-3xl font-semibold text-gray-900 dark:text-white">{value}</p>
          {trend && (
            <span
              className={cn(
                "text-sm font-medium",
                trend.isPositive ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"
              )}
            >
              {trend.isPositive ? "+" : ""}
              {trend.value}
            </span>
          )}
        </div>
      </div>
    );
  }
);
StatCard.displayName = "StatCard";
