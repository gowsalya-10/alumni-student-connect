import React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Info, XCircle } from "lucide-react";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "success" | "warning" | "error";
  title?: string;
}

const variantStyles = {
  info: "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/50",
  success: "bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/50",
  warning: "bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-900/50",
  error: "bg-red-50 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50",
};

const icons = {
  info: Info,
  success: CheckCircle2,
  warning: AlertCircle,
  error: XCircle,
};

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "info", title, children, ...props }, ref) => {
    const Icon = icons[variant];

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "relative w-full rounded-lg border p-4 flex gap-3",
          variantStyles[variant],
          className
        )}
        {...props}
      >
        <Icon className="h-5 w-5 shrink-0 mt-0.5" />
        <div className="flex-1 flex flex-col gap-1 text-sm">
          {title && <h5 className="font-semibold leading-none tracking-tight">{title}</h5>}
          {children && <div className="text-sm opacity-90 leading-relaxed">{children}</div>}
        </div>
      </div>
    );
  }
);
Alert.displayName = "Alert";
