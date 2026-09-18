import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Unable to Load Content',
  message = 'We encountered an issue fetching verified data from the service. Please try again.',
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 p-6 text-center flex flex-col items-center justify-center space-y-3 ${className}`}
      role="alert"
    >
      <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400">
        <AlertTriangle className="w-5 h-5" />
      </div>
      <div className="max-w-sm space-y-1">
        <h4 className="text-sm font-semibold text-red-900 dark:text-red-300">{title}</h4>
        <p className="text-xs text-red-700 dark:text-red-400">{message}</p>
      </div>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          className="border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 hover:bg-red-100/60 dark:hover:bg-red-900/40 mt-1"
        >
          Try Again
        </Button>
      )}
    </div>
  );
};
