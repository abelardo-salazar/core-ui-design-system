'use client';

import * as React from 'react';
import { type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn'; // Asegúrate que la ruta a utils/cn sea correcta
import { textareaVariants } from './textareaVariants';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>, VariantProps<typeof textareaVariants> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, label, error, helperText, id, disabled, ...props }, ref) => {
    const generatedId = React.useId();
    const textareaId = id || generatedId;
    const errorId = `${textareaId}-error`;
    const descriptionId = `${textareaId}-description`;

    const hasError = !!error;
    const finalVariant = hasError ? 'error' : variant;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </label>
        )}

        <textarea
          id={textareaId}
          ref={ref}
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : helperText ? descriptionId : undefined}
          className={cn(textareaVariants({ variant: finalVariant, className }))}
          {...props}
        />

        {hasError ? (
          <p id={errorId} className="text-xs text-error font-medium animate-pulse">
            {error}
          </p>
        ) : helperText ? (
          <p id={descriptionId} className="text-xs text-base-content/50">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';

export { Textarea };
