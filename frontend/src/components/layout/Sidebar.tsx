import React from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export interface SidebarItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  isActive?: boolean;
}

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  items: SidebarItem[];
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(
  ({ className, items, header, footer, ...props }, ref) => {
    return (
      <aside
        ref={ref}
        className={cn(
          "hidden md:flex flex-col w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-screen sticky top-0",
          className
        )}
        {...props}
      >
        {header && <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800">{header}</div>}
        
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {items.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                item.isActive
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
              )}
            >
              <div
                className={cn(
                  "mr-3 flex-shrink-0 h-5 w-5",
                  item.isActive
                    ? "text-blue-700 dark:text-blue-400"
                    : "text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400"
                )}
              >
                {item.icon}
              </div>
              {item.name}
            </Link>
          ))}
        </nav>

        {footer && <div className="p-4 border-t border-gray-200 dark:border-gray-800">{footer}</div>}
      </aside>
    );
  }
);
Sidebar.displayName = "Sidebar";
