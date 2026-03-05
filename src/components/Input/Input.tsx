import * as React from 'react';
import { type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { inputVariants } from './inputVariants';

export interface InputProps
  extends
    Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  helperText?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      size,
      label,
      error,
      helperText,
      startIcon,
      endIcon,
      id,
      disabled,
      ...props
    },
    ref,
  ) => {
    // Generate a unique ID if one is not provided, for accessibility
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const descriptionId = `${inputId}-description`;

    // Determine if there is an error to activate the visual variant
    const hasError = !!error;
    const finalVariant = hasError ? 'error' : variant;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {/* 1. Accessible Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
              hasError ? 'text-error' : 'text-base-content',
            )}
          >
            {label}
          </label>
        )}

        {/* 2. Wrapper for Input + Icons */}
        <div className="relative">
          {startIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50 pointer-events-none [&_svg]:size-4">
              {startIcon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            // ARIA binding for screen readers
            aria-invalid={hasError}
            aria-describedby={hasError ? errorId : helperText ? descriptionId : undefined}
            className={cn(
              inputVariants({ variant: finalVariant, size, className }),
              // Adjust padding if there are icons
              startIcon && 'pl-10!',
              endIcon && 'pr-10!',
            )}
            {...props}
          />

          {endIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 pointer-events-none [&_svg]:size-4">
              {endIcon}
            </div>
          )}
        </div>

        {/* 3. Error or Help Messages */}
        {hasError ? (
          <p id={errorId} className="text-xs text-error font-medium animate-pulse">
            {error}
          </p>
        ) : helperText ? (
          <p id={descriptionId} className="text-xs text-base-content/60">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = 'Input';

export { Input };
