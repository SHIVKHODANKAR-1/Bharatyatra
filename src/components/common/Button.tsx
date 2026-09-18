import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = '',
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      type = 'button',
      ...props
    },
    ref
  ) => {
    // Base styles: clear focus outline, transitions, touch-friendly min targets
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

    const variants = {
      primary:
        'bg-[#D9531E] hover:bg-[#BF4515] active:bg-[#9E370F] text-white shadow-sm focus-visible:outline-[#D9531E]',
      secondary:
        'bg-[#166534] hover:bg-[#14532D] text-white shadow-sm focus-visible:outline-[#166534]',
      outline:
        'border border-stone-300 dark:border-stone-700 bg-transparent text-stone-800 dark:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 focus-visible:outline-stone-500',
      ghost:
        'bg-transparent text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 focus-visible:outline-stone-500',
      destructive:
        'bg-red-600 hover:bg-red-700 text-white shadow-sm focus-visible:outline-red-600',
      link:
        'bg-transparent text-[#D9531E] hover:underline p-0 h-auto font-normal focus-visible:outline-[#D9531E]',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 h-8 gap-1.5',
      md: 'text-sm px-4 py-2 h-10 gap-2',
      lg: 'text-base px-6 py-3 h-12 gap-2.5',
      icon: 'h-10 w-10 p-2',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
        ) : (
          leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
