import React from "react";
import { cn } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  initials?: string;
  alt?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeStyles = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-xl",
};

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, initials, alt = "Avatar", size = "md", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative flex shrink-0 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800",
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            className="aspect-square h-full w-full object-cover"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center font-medium text-gray-600 dark:text-gray-300 uppercase">
            {initials || alt.substring(0, 2)}
          </span>
        )}
      </div>
    );
  }
);
Avatar.displayName = "Avatar";
