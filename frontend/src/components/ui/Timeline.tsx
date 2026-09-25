import React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  status: "completed" | "current" | "upcoming";
  date?: string;
}

export interface TimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  items: TimelineItem[];
}

export const Timeline = React.forwardRef<HTMLDivElement, TimelineProps>(
  ({ className, items, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-6", className)} {...props}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isCompleted = item.status === "completed";
          const isCurrent = item.status === "current";

          return (
            <div key={item.id} className="relative flex gap-4">
              {/* Vertical line connecting nodes */}
              {!isLast && (
                <div
                  className={cn(
                    "absolute left-4 top-8 bottom-0 -ml-px w-0.5 -mb-6",
                    isCompleted ? "bg-blue-600 dark:bg-blue-500" : "bg-gray-200 dark:bg-gray-800"
                  )}
                />
              )}

              {/* Node indicator */}
              <div
                className={cn(
                  "relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2",
                  isCompleted
                    ? "border-blue-600 bg-blue-600 text-white dark:border-blue-500 dark:bg-blue-500"
                    : isCurrent
                    ? "border-blue-600 bg-white text-blue-600 dark:border-blue-500 dark:bg-gray-900 dark:text-blue-500"
                    : "border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900"
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <div
                    className={cn(
                      "h-2.5 w-2.5 rounded-full",
                      isCurrent ? "bg-blue-600 dark:bg-blue-500" : "bg-transparent"
                    )}
                  />
                )}
              </div>

              {/* Content */}
              <div className="flex flex-col pb-2">
                <h4
                  className={cn(
                    "text-sm font-semibold",
                    isUpcoming(item.status) ? "text-gray-500 dark:text-gray-400" : "text-gray-900 dark:text-gray-100"
                  )}
                >
                  {item.title}
                </h4>
                {item.date && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {item.date}
                  </span>
                )}
                {item.description && (
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
);
Timeline.displayName = "Timeline";

function isUpcoming(status: string) {
  return status === "upcoming";
}
