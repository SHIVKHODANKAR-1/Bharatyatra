import React from 'react';
import { Compass, Bookmark, MapPin, Calendar, SunMedium } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: 'compass' | 'bookmark' | 'mapPin' | 'calendar' | 'weather';
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'compass',
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  const iconMap = {
    compass: Compass,
    bookmark: Bookmark,
    mapPin: MapPin,
    calendar: Calendar,
    weather: SunMedium,
  };

  const IconComponent = iconMap[icon] || Compass;

  return (
    <div
      className={`rounded-2xl border border-dashed border-stone-300 dark:border-stone-800 p-8 text-center flex flex-col items-center justify-center space-y-3 bg-stone-50/50 dark:bg-stone-900/40 ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400 dark:text-stone-500">
        <IconComponent className="w-6 h-6" />
      </div>
      <div className="max-w-sm space-y-1">
        <h4 className="text-sm sm:text-base font-semibold text-stone-800 dark:text-stone-200">
          {title}
        </h4>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
          {description}
        </p>
      </div>
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction} className="mt-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
