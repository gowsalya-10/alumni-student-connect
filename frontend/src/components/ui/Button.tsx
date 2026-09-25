import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

const variantStyles = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm border border-transparent",
  secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 border border-transparent dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700",
  outline: "border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800",
  ghost: "bg-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 border border-transparent",
  destructive: "bg-red-600 text-white hover:bg-red-700 shadow-sm border border-transparent",
};

const sizeStyles = {
  sm: "h-8 px-3 text-xs rounded-md",
  md: "h-10 px-4 py-2 text-sm rounded-lg",
  lg: "h-12 px-8 text-base rounded-xl",
  icon: "h-10 w-10 flex items-center justify-center rounded-lg",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none dark:focus-visible:ring-offset-gray-900",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
