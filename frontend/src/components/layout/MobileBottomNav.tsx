import React from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export interface MobileNavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  isActive?: boolean;
}

export interface MobileBottomNavProps extends React.HTMLAttributes<HTMLElement> {
  items: MobileNavItem[];
}

export const MobileBottomNav = React.forwardRef<HTMLElement, MobileBottomNavProps>(
  ({ className, items, ...props }, ref) => {
    return (
      <nav
        ref={ref}
        className={cn(
          "md:hidden fixed bottom-0 w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pb-safe z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]",
          className
        )}
        {...props}
      >
        <div className="flex justify-around items-center h-16">
          {items.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                item.isActive
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
              )}
            >
              <div className={cn("h-5 w-5", item.isActive ? "text-blue-600 dark:text-blue-400" : "")}>
                {item.icon}
              </div>
              <span className="text-[10px] font-medium leading-none">{item.name}</span>
            </Link>
          ))}
        </div>
      </nav>
    );
  }
);
MobileBottomNav.displayName = "MobileBottomNav";
