import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse rounded-xl bg-stone-200 dark:bg-stone-800 ${className}`}
      aria-hidden="true"
    />
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden bg-white dark:bg-stone-900 p-4 space-y-3">
      <Skeleton className="h-44 w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </div>
  );
};

export const WeatherSkeleton: React.FC = () => {
  return (
    <div className="rounded-2xl border border-stone-200 dark:border-stone-800 p-5 bg-white dark:bg-stone-900 space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-16" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>
    </div>
  );
};
