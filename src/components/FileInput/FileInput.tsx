'use client';

import * as React from 'react';
import { type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { buttonVariants } from '../Button/buttonVariants';

type ButtonVariantProps = VariantProps<typeof buttonVariants>;

export interface FileInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'value' | 'defaultValue' | 'size' | 'children'
> {
  /** Visible name of the field, associated with the input. */
  label?: string;
  /** Error message: same look and ARIA binding as `Input`. */
  error?: string;
  /** Style of the trigger. @default 'outline' */
  variant?: NonNullable<ButtonVariantProps['variant']>;
  /** Height of the trigger: 32, 44 or 48px, Button's scale. @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  /** Text of the trigger with nothing chosen. Default: "Choose file", or "Choose files" with `multiple`. */
  chooseLabel?: string;
  /** Text of the trigger with something chosen. Default: "Change file", or "Change files" with `multiple`. */
  changeLabel?: string;
  /** The files chosen that pass `accept`. Not called if all of them were rejected. */
  onFilesChange?: (files: File[]) => void;
  /** The files chosen that don't pass `accept`, which the user can reach with "All files". */
  onReject?: (files: File[]) => void;
}

// The same rules as the native attribute, which only filters the dialog: a token is an extension
// (".pdf"), a MIME wildcard ("image/*") or an exact MIME. Everything case-insensitive. A file whose
// type the browser doesn't know has an empty type, so it only passes by extension.
function matchesAccept(file: File, accept: string | undefined) {
  const tokens = accept
    ?.split(',')
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);
  if (!tokens?.length) return true;

  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return tokens.some((token) => {
    if (token.startsWith('.')) return name.endsWith(token);
    if (token.endsWith('/*')) return type.startsWith(token.slice(0, -1));
    return type === token;
  });
}

// So that a form submit only carries the files shown. Setting `files` doesn't fire `change`.
function setNativeFiles(input: HTMLInputElement, files: File[]) {
  const transfer = new DataTransfer();
  files.forEach((file) => transfer.items.add(file));
  input.files = transfer.files;
}

/**
 * File field: a native input, hidden accessibly, and a `<label>` with the look of a Button as its
 * trigger. The native input keeps the focus, the keyboard, `required` and form submission, with no
 * handlers of our own. It doesn't read the files.
 */
const FileInput = React.forwardRef<HTMLInputElement, FileInputProps>(
  (
    {
      className,
      id,
      label,
      error,
      variant = 'outline',
      size = 'md',
      multiple,
      accept,
      disabled,
      chooseLabel = multiple ? 'Choose files' : 'Choose file',
      changeLabel = multiple ? 'Change files' : 'Change file',
      onFilesChange,
      onReject,
      onChange,
      'aria-describedby': describedBy,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const namesId = `${inputId}-names`;
    const hasError = !!error;

    const [files, setFiles] = React.useState<File[]>([]);
    const names = files.map((file) => file.name).join(', ');

    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const setRefs = React.useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    // A form's reset empties the native input without firing `change`, and the name would stay.
    React.useEffect(() => {
      const form = inputRef.current?.form;
      if (!form) return;
      const handleReset = () => setFiles([]);
      form.addEventListener('reset', handleReset);
      return () => form.removeEventListener('reset', handleReset);
    }, []);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const chosen = Array.from(event.target.files ?? []);
      const accepted = chosen.filter((file) => matchesAccept(file, accept));
      const rejected = chosen.filter((file) => !matchesAccept(file, accept));

      if (rejected.length > 0) {
        // With nothing valid, the previous choice stays: a wrong pick shouldn't cost it.
        setNativeFiles(event.target, accepted.length > 0 ? accepted : files);
        onReject?.(rejected);
      }
      if (accepted.length > 0 || rejected.length === 0) {
        setFiles(accepted);
        onFilesChange?.(accepted);
      }
      // Last, so a form library reads the files that were kept.
      onChange?.(event);
    };

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'text-sm font-medium leading-none',
              hasError ? 'text-error-focus' : 'text-base-content',
            )}
          >
            {label}
          </label>
        )}

        {/* relative: sr-only is absolute, and focusing it must not scroll to another place. */}
        <div className="relative flex min-w-0 items-center gap-3">
          <input
            id={inputId}
            ref={setRefs}
            type="file"
            multiple={multiple}
            accept={accept}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={
              [describedBy, names ? namesId : undefined, hasError ? errorId : undefined]
                .filter(Boolean)
                .join(' ') || undefined
            }
            onChange={handleChange}
            className="peer sr-only"
            {...props}
          />
          <label
            htmlFor={inputId}
            className={cn(
              buttonVariants({ variant, size }),
              'shrink-0 peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2',
              hasError
                ? 'border border-error peer-focus-visible:ring-error'
                : 'peer-focus-visible:ring-primary',
              disabled && 'pointer-events-none opacity-50',
              className,
            )}
          >
            {files.length > 0 ? changeLabel : chooseLabel}
          </label>
          {names && (
            <span
              id={namesId}
              title={names}
              className="min-w-0 truncate text-sm text-base-content/70"
            >
              {names}
            </span>
          )}
        </div>

        {hasError && (
          <p id={errorId} className="text-xs text-error-focus font-medium">
            {error}
          </p>
        )}
      </div>
    );
  },
);
FileInput.displayName = 'FileInput';

export { FileInput };
