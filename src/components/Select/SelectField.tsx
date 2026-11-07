'use client';

import * as React from 'react';
import { cn } from '../../utils/cn';
import { Select, SelectContent, SelectTrigger, SelectValue } from './Select';
import { selectFieldTriggerVariants, type SelectFieldSize } from './selectFieldVariants';

// Visible label (`label`) or screen-reader-only label (`aria-label`): one of the two, same
// pattern as ComboboxLabelProps.
export type SelectFieldLabelProps =
  | {
      /** Visible label of the field. */
      label: string;
      'aria-label'?: never;
    }
  | {
      label?: never;
      /** Accessible name without a visible label. */
      'aria-label': string;
    };

export type SelectFieldProps = Omit<React.ComponentPropsWithoutRef<typeof Select>, 'children'> &
  SelectFieldLabelProps & {
    /** The `SelectItem`s, and `SelectGroup`/`SelectLabel`/`SelectSeparator` if needed. */
    children: React.ReactNode;
    /** Id of the trigger. */
    id?: string;
    /** Trigger text with no value. */
    placeholder?: string;
    /** Trigger height (32 / 44 / 48, the Input scale). @default 'md' */
    size?: SelectFieldSize;
    /** Marks the field as invalid and takes the place of `helperText`. */
    error?: string;
    helperText?: string;
    /** On the root container (label + trigger + message). */
    className?: string;
  };

/**
 * `Select` with its trigger, label and error or help message, linked the same way as `Input`.
 * The children are the `SelectItem`s. The `ref` goes to the trigger.
 */
const SelectField = React.forwardRef<React.ElementRef<typeof SelectTrigger>, SelectFieldProps>(
  (
    {
      label,
      'aria-label': ariaLabel,
      children,
      id,
      placeholder,
      size,
      error,
      helperText,
      className,
      ...selectProps
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const triggerId = id || generatedId;
    const errorId = `${triggerId}-error`;
    const descriptionId = `${triggerId}-description`;
    const hasError = !!error;

    return (
      <div className={cn('w-full flex flex-col gap-1.5', className)}>
        {label && (
          <label
            htmlFor={triggerId}
            className={cn(
              'text-sm font-medium leading-none',
              hasError ? 'text-error-focus' : 'text-base-content',
            )}
          >
            {label}
          </label>
        )}

        <Select {...selectProps}>
          <SelectTrigger
            ref={ref}
            id={triggerId}
            aria-label={ariaLabel}
            aria-invalid={hasError}
            aria-describedby={hasError ? errorId : helperText ? descriptionId : undefined}
            className={selectFieldTriggerVariants({ size, error: hasError })}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>{children}</SelectContent>
        </Select>

        {hasError ? (
          <p id={errorId} className="text-xs text-error-focus font-medium">
            {error}
          </p>
        ) : helperText ? (
          <p id={descriptionId} className="text-xs text-base-content/65">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);
SelectField.displayName = 'SelectField';

export { SelectField };
