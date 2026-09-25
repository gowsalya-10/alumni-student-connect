import React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export interface SkillChipProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  level?: string;
  onRemove?: () => void;
}

export const SkillChip = React.forwardRef<HTMLDivElement, SkillChipProps>(
  ({ className, name, level, onRemove, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full bg-white border border-gray-200 px-3 py-1 text-sm font-medium text-gray-800 shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200",
          className
        )}
        {...props}
      >
        <span>{name}</span>
        {level && (
          <span className="text-xs text-gray-500 dark:text-gray-400 border-l border-gray-200 dark:border-gray-700 pl-1.5">
            {level}
          </span>
        )}
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="ml-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none dark:hover:bg-gray-700 dark:hover:text-gray-300"
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Remove {name}</span>
          </button>
        )}
      </div>
    );
  }
);
SkillChip.displayName = "SkillChip";
