import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "../ui/Button";

export interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  footer?: React.ReactNode;
}

export const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  ({ className, isOpen, onClose, title, description, children, footer, ...props }, ref) => {
    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "unset";
      }
      return () => {
        document.body.style.overflow = "unset";
      };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Dialog */}
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          className={cn(
            "relative z-50 w-full max-w-lg overflow-hidden rounded-xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full dark:bg-gray-900 border border-gray-200 dark:border-gray-800 animate-scale-in",
            className
          )}
          {...props}
        >
          <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
              {description && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="rounded-md bg-transparent p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:hover:bg-gray-800 dark:hover:text-gray-300"
            >
              <span className="sr-only">Close</span>
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="px-6 py-4">{children}</div>

          {footer && (
            <div className="bg-gray-50 px-6 py-4 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    );
  }
);
Modal.displayName = "Modal";
