'use client';

import * as React from 'react';
import { cn } from '../../utils/cn';

export interface PickerFieldTextProps {
  /** Visible name of the field, associated with the trigger. */
  label?: string;
  /** Marks the trigger as invalid and takes the place of `helperText`. */
  error?: string;
  helperText?: string;
}

export interface PickerFieldTriggerProps {
  id?: string;
  'aria-labelledby'?: string;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
}

interface PickerFieldProps extends PickerFieldTextProps {
  /** Receives the attributes for the trigger; spread them on the button. */
  renderTrigger: (props: PickerFieldTriggerProps, state: { hasError: boolean }) => React.ReactNode;
}

// Internal, not exported from the barrel: label + trigger + message of the date pickers
// (DatePicker, and DateRangePicker later on), with the same look and ARIA binding as SelectField.
//
// The trigger is a button whose text is the chosen value. aria-labelledby points to the label and
// then to the trigger itself, so its name keeps that value: "Date November 7th, 2026". The label is
// a <span>, not a <label htmlFor>: for its self-reference the name computation takes the button's
// native label instead of its content, which drops the date again; and a click on a button's
// <label> activates the button, opening the popover.
//
// Without label, error or helperText it renders the trigger alone with no attributes, so the DOM of
// a picker without these props doesn't change.
function PickerField({ label, error, helperText, renderTrigger }: PickerFieldProps) {
  const triggerId = React.useId();
  const labelId = `${triggerId}-label`;
  const errorId = `${triggerId}-error`;
  const descriptionId = `${triggerId}-description`;
  const hasError = !!error;

  if (!label && !hasError && !helperText) return <>{renderTrigger({}, { hasError })}</>;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <span
          id={labelId}
          className={cn(
            'text-sm font-medium leading-none',
            hasError ? 'text-error-focus' : 'text-base-content',
          )}
        >
          {label}
        </span>
      )}

      {renderTrigger(
        {
          id: triggerId,
          'aria-labelledby': label ? `${labelId} ${triggerId}` : undefined,
          'aria-invalid': hasError,
          'aria-describedby': hasError ? errorId : helperText ? descriptionId : undefined,
        },
        { hasError },
      )}

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
}

export { PickerField };
