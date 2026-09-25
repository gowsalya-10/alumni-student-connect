import React from "react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, icon, title, description, action, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 p-8 text-center dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50",
          className
        )}
        {...props}
      >
        {icon && (
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 mb-4">
            {icon}
          </div>
        )}
        <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h3>
        {description && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-sm">
            {description}
          </p>
        )}
        {action && <div className="mt-6">{action}</div>}
      </div>
    );
  }
);
EmptyState.displayName = "EmptyState";
