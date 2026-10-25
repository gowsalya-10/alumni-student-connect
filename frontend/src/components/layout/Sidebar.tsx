'use client';

import React from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { User, LogOut } from "lucide-react";

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
    const { user, logout } = useAuth();

    return (
      <aside
        ref={ref}
        className={cn(
          "hidden md:flex flex-col w-64 bg-white dark:bg-gray-900 border-r border-gray-200/80 dark:border-gray-800 h-screen sticky top-0 shadow-sm",
          className
        )}
        {...props}
      >
        {header && (
          <div className="h-16 flex items-center px-6 border-b border-gray-100 dark:border-gray-800">
            {header}
          </div>
        )}
        
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          {items.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group relative flex items-center px-3.5 py-2.5 text-sm font-medium rounded-xl transition-all duration-150",
                item.isActive
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 font-semibold shadow-xs"
                  : "text-gray-600 hover:bg-gray-50/80 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/60 dark:hover:text-white"
              )}
            >
              {item.isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-1 bg-indigo-600 dark:bg-indigo-500 rounded-r-full" />
              )}
              <div
                className={cn(
                  "mr-3 flex-shrink-0 h-5 w-5 transition-colors",
                  item.isActive
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300"
                )}
              >
                {item.icon}
              </div>
              <span className="truncate">{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* User Card & Logout in Footer */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-800 space-y-2">
          {user && (
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-50/80 dark:bg-gray-800/40">
              <div className="h-9 w-9 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                {user.email ? user.email.slice(0, 2) : <User className="h-4 w-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                  {user.email}
                </p>
                <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-indigo-100/70 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
                  {user.role}
                </span>
              </div>
            </div>
          )}

          {footer || (
            <button
              onClick={logout}
              className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-medium text-gray-500 hover:text-red-600 hover:bg-red-50/80 rounded-lg dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-950/20 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          )}
        </div>
      </aside>
    );
  }
);
Sidebar.displayName = "Sidebar";
