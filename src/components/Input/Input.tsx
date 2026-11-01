'use client';

import * as React from 'react';
import { type VariantProps } from 'class-variance-authority';
import { Cross2Icon } from '@radix-ui/react-icons';
import { cn } from '../../utils/cn';
import { inputVariants } from './inputVariants';

/** Props shared by both branches. Exported for those who need to extend Input with an interface
 * (an interface can't extend the `InputProps` union). */
export interface InputBaseProps
  extends
    Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    Omit<VariantProps<typeof inputVariants>, 'clearable'> {
  label?: string;
  error?: string;
  helperText?: string;
  startIcon?: React.ReactNode;
}

export interface InputWithEndIconProps extends InputBaseProps {
  clearable?: false;
  endIcon?: React.ReactNode;
  onClear?: never;
  clearLabel?: never;
}

export interface ClearableInputProps extends InputBaseProps {
  /** Shows a button to clear the field while it has a value. */
  clearable: boolean;
  /** Called after clearing the field (and after firing its onChange). */
  onClear?: () => void;
  /** aria-label of the clear button. Default: "Clear". */
  clearLabel?: string;
  endIcon?: never;
}

// Union discriminated by `clearable`: the clear button takes the place of endIcon, so they
// don't coexist. The other branch's props are declared `?: never` instead of being omitted so
// the error comes from assignability and not from the excess property check, which against a
// union relaxes to "does it exist in ANY member?" (the bug that forced Badge to use overloads).
// `clearable: boolean` (not `true`) so that `clearable={dynamic}` compiles without endIcon.
/**
 * `Input` props: union discriminated by `clearable`.
 *
 * `Omit<InputProps, K>` does NOT keep the `clearable`/`endIcon` exclusion: `Omit` doesn't
 * distribute over unions, it collapses both branches into a single object and
 * `{ clearable: true, endIcon }` compiles again. To derive props, distribute the Omit per
 * branch:
 *
 * ```ts
 * type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
 * type MyProps = DistributiveOmit<InputProps, 'size'>;
 * ```
 *
 * or start from `InputBaseProps`, which also works for `interface X extends ...` (an interface
 * can't extend this union).
 */
export type InputProps = InputWithEndIconProps | ClearableInputProps;

// Native `value` setter: React installs a tracker on the instance, so `input.value = ''`
// updates it and the following event is discarded as "no change". Calling the prototype's
// setter gets around it and the bubbling `input` event reaches React's onChange, the same in
// controlled mode, uncontrolled mode and with react-hook-form's `register`.
function clearNativeInput(input: HTMLInputElement) {
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(input, '');
  input.dispatchEvent(new Event('input', { bubbles: true }));
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
      clearable,
      onClear,
      clearLabel = 'Clear',
      id,
      disabled,
      readOnly,
      placeholder,
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

    // No button with disabled/readOnly: the field can't be edited, so it can't be cleared either.
    const showClear = !!clearable && !disabled && !readOnly;

    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const setRefs = React.useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    const handleClear = () => {
      const input = inputRef.current;
      if (!input) return;
      clearNativeInput(input);
      onClear?.();
      input.focus();
    };

    return (
      <div className="w-full flex flex-col gap-1.5">
        {/* 1. Accessible Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
              hasError ? 'text-error-focus' : 'text-base-content',
            )}
          >
            {label}
          </label>
        )}

        {/* 2. Wrapper for Input + Icons */}
        <div className="relative">
          {startIcon && (
            <div
              aria-hidden="true"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50 pointer-events-none [&_svg]:size-4"
            >
              {startIcon}
            </div>
          )}

          <input
            id={inputId}
            ref={setRefs}
            disabled={disabled}
            readOnly={readOnly}
            // The button's visibility comes from :placeholder-shown (no state of its own, so RHF's reset()/
            // setValue(), which change the value without events, don't desync it), and that
            // pseudo-class only exists with a non-empty placeholder.
            placeholder={showClear ? placeholder || ' ' : placeholder}
            // ARIA binding for screen readers
            aria-invalid={hasError}
            aria-describedby={hasError ? errorId : helperText ? descriptionId : undefined}
            className={cn(
              inputVariants({ variant: finalVariant, size, clearable: showClear, className }),
              // Adjust padding if there are icons
              startIcon && 'pl-10!',
              endIcon && 'pr-10!',
              // type="search" brings its own ✕ in WebKit/Blink: it's hidden so it isn't duplicated.
              showClear && 'peer [&::-webkit-search-cancel-button]:appearance-none',
            )}
            {...props}
          />

          {/* No Escape handling of its own: Radix listens for it on document in the capture phase, so
              inside a Dialog/Sheet it would close the modal instead of clearing. */}
          {showClear && (
            <button
              type="button"
              aria-label={clearLabel}
              onClick={handleClear}
              className="absolute right-0 top-0 flex h-full aspect-square items-center justify-center rounded-btn text-base-content/50 transition-colors hover:text-base-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary peer-placeholder-shown:hidden"
            >
              <Cross2Icon aria-hidden="true" className="size-4" />
            </button>
          )}

          {endIcon && (
            <div
              aria-hidden="true"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 pointer-events-none [&_svg]:size-4"
            >
              {endIcon}
            </div>
          )}
        </div>

        {/* 3. Error or Help Messages */}
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

Input.displayName = 'Input';

export { Input };
