import React from "react";
import { cn } from "@/lib/utils";

export interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const SectionHeader = React.forwardRef<HTMLDivElement, SectionHeaderProps>(
  ({ className, title, description, action, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5", className)}
        {...props}
      >
        <div>
          <h3 className="text-xl font-semibold leading-6 text-gray-900 dark:text-white">
            {title}
          </h3>
          {description && (
            <p className="mt-2 max-w-4xl text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    );
  }
);
SectionHeader.displayName = "SectionHeader";
