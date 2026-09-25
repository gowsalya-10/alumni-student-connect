import React from "react";
import { cn } from "@/lib/utils";

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {}

export const PageContainer = React.forwardRef<HTMLDivElement, PageContainerProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
PageContainer.displayName = "PageContainer";
