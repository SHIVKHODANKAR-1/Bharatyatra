import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      type = 'text',
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || 'inp_' + Math.random().toString(36).substring(2, 9);
    const isPassword = type === 'password';
    const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-stone-400 dark:text-stone-500 pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            type={resolvedType}
            className={`w-full rounded-xl border bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm py-2.5 transition-colors focus:outline-none focus:ring-2 disabled:bg-stone-100 disabled:dark:bg-stone-800 disabled:cursor-not-allowed ${
              leftIcon ? 'pl-10' : 'pl-3.5'
            } ${rightIcon || isPassword ? 'pr-10' : 'pr-3.5'} ${
              error
                ? 'border-red-500 focus:ring-red-500/20 focus:border-red-600'
                : 'border-stone-300 dark:border-stone-700 focus:ring-[#D9531E]/20 focus:border-[#D9531E]'
            } ${className}`}
            {...props}
          />
          {isPassword ? (
            <button
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          ) : (
            rightIcon && (
              <div className="absolute right-3 text-stone-400 dark:text-stone-500 pointer-events-none flex items-center">
                {rightIcon}
              </div>
            )
          )}
        </div>
        {error ? (
          <p className="text-xs text-red-600 dark:text-red-400 font-medium" role="alert">
            {error}
          </p>
        ) : helperText ? (
          <p className="text-xs text-stone-500 dark:text-stone-400">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
