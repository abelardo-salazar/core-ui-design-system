'use client';

import * as React from 'react';
import { type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { buttonVariants } from '../Button/buttonVariants';
import {
  setNativeFiles,
  sortFiles,
  useFileDrop,
  type FileRejectReason,
} from '../../utils/fileDrop';

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
  /**
   * The files chosen or dropped that are rejected, and why: `'type'` if they don't pass `accept`
   * (the user can reach them with "All files"), `'count'` if several were dropped without
   * `multiple`.
   */
  onReject?: (files: File[], reason: FileRejectReason) => void;
  /** Wraps the trigger in a zone that also accepts files dropped on it. @default false */
  dropzone?: boolean;
  /** Text of the zone, hidden from assistive tech. Default: "Drop file here", or "Drop files here" with `multiple`. */
  dropLabel?: string;
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
      dropzone = false,
      dropLabel = multiple ? 'Drop files here' : 'Drop file here',
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
      const { accepted, rejected, reason } = sortFiles(chosen, { accept, multiple });

      if (rejected.length > 0) {
        // With nothing valid, the previous choice stays: a wrong pick shouldn't cost it.
        setNativeFiles(event.target, accepted.length > 0 ? accepted : files);
        onReject?.(rejected, reason);
      }
      if (accepted.length > 0 || rejected.length === 0) {
        setFiles(accepted);
        onFilesChange?.(accepted);
      }
      // Last, so a form library reads the files that were kept.
      onChange?.(event);
    };

    // A drop does what the browser does when files are dropped on a native file input: it fills
    // the input and fires `input` and `change`. So dropped files go through handleChange, with the
    // same rules and the same consumer onChange as chosen ones.
    const { dragging, dropZoneProps } = useFileDrop({
      disabled,
      onDrop: (dropped) => {
        const input = inputRef.current;
        if (!input) return;
        setNativeFiles(input, dropped);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      },
    });

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
        {/* With dropzone, this row is the zone: no role and not focusable, the trigger stays the
            control for keyboard and screen readers. */}
        <div
          className={cn(
            'relative flex min-w-0 items-center gap-3',
            dropzone &&
              'flex-col justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors data-dragging:border-primary data-dragging:bg-primary/5',
            dropzone && (hasError ? 'border-error' : 'border-base-300'),
          )}
          data-dragging={dropzone && dragging ? '' : undefined}
          {...(dropzone ? dropZoneProps : {})}
        >
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
          {dropzone && (
            <span
              aria-hidden="true"
              className={cn('text-sm text-base-content/70', disabled && 'opacity-50')}
            >
              {dropLabel}
            </span>
          )}
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
              className={cn(
                'min-w-0 truncate text-sm text-base-content/70',
                dropzone && 'max-w-full',
              )}
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
