import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  position?: 'bottom' | 'right';
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  position = 'bottom',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      <div
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`fixed inset-y-0 right-0 max-w-full flex ${
          position === 'bottom'
            ? 'bottom-0 inset-x-0 top-auto max-h-[85vh] rounded-t-3xl'
            : 'inset-y-0 right-0 w-full sm:max-w-md'
        }`}
      >
        <div className="w-full bg-white dark:bg-stone-900 shadow-2xl border-t sm:border-l border-stone-200 dark:border-stone-800 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-stone-100 dark:border-stone-800 flex items-start justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</div>
        </div>
      </div>
    </div>
  );
};
