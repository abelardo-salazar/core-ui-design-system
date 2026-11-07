'use client';

import * as React from 'react';
import { ArrowLeftIcon, ArrowRightIcon, TrashIcon } from '@radix-ui/react-icons';
import { cn } from '../../utils/cn';
import { announce } from '../../utils/announce';
import { sortFiles, useFileDrop, type FileRejectReason } from '../../utils/fileDrop';
import { buttonVariants } from '../Button/buttonVariants';
import { AspectRatio } from '../AspectRatio';
import { Image } from '../Image';
import { Badge } from '../Badge';
import { Skeleton } from '../Skeleton';

/**
 * A photo of the gallery: a file chosen in this session, or one already uploaded (editing a
 * record brings photos that only exist as a URL). `id` is a stable key; the component creates
 * it for new files.
 */
export type ImageUploaderItem =
  | { kind: 'file'; id: string; file: File }
  | { kind: 'remote'; id: string; src: string; alt?: string };

export type ImageUploaderLabels = {
  /** Text of the trigger. */
  add: string;
  /** Text of the drop zone, hidden from assistive tech. */
  drop: string;
  /** Visible badge of the first photo. */
  cover: string;
  /** Name of a photo inside the buttons and announcements; `position` starts at 1. */
  image: (position: number, cover: boolean) => string;
  remove: (image: string) => string;
  moveBefore: (image: string) => string;
  moveAfter: (image: string) => string;
  /** Visible count, only with `max`. */
  count: (count: number, max: number) => string;
  /** Announced after removing; `name` is the photo's alt. */
  removed: (name: string) => string;
  /** Announced after moving. */
  moved: (name: string, position: number, total: number) => string;
};

const DEFAULT_LABELS: ImageUploaderLabels = {
  add: 'Add images',
  drop: 'or drop them here',
  cover: 'Cover',
  image: (position, cover) => (cover ? `image ${position} (cover)` : `image ${position}`),
  remove: (image) => `Remove ${image}`,
  moveBefore: (image) => `Move ${image} before`,
  moveAfter: (image) => `Move ${image} after`,
  count: (count, max) => `${count} of ${max}`,
  removed: (name) => `${name} removed`,
  moved: (name, position, total) => `${name} moved to position ${position} of ${total}`,
};

// Visible label (`label`) or screen-reader-only label (`aria-label`): one of the two, same
// pattern as SelectFieldLabelProps.
export type ImageUploaderLabelProps =
  | {
      /** Visible name of the gallery. */
      label: string;
      'aria-label'?: never;
    }
  | {
      label?: never;
      /** Accessible name without a visible label. */
      'aria-label': string;
    };

export type ImageUploaderProps = ImageUploaderLabelProps & {
  /** The photos, in order; the first one is the cover. */
  value: ImageUploaderItem[];
  onValueChange: (value: ImageUploaderItem[]) => void;
  /** Same tokens as the native attribute, checked again on every file. @default 'image/*' */
  accept?: string;
  /** Most photos in the gallery. Shows the count and disables the trigger when reached. */
  max?: number;
  /** Files not added: `'type'` if they don't pass `accept`, `'count'` if they exceed `max`. */
  onReject?: (files: File[], reason: FileRejectReason) => void;
  /** Error message: takes the place of `helperText`. */
  error?: string;
  helperText?: string;
  disabled?: boolean;
  /** Texts, merged with the defaults in English. */
  labels?: Partial<ImageUploaderLabels>;
  /** Id of the trigger; the other ids derive from it. */
  id?: string;
  /** On the root container. */
  className?: string;
};

type Action = 'move-before' | 'move-after' | 'remove';

// Object URLs are an external resource, so they live in a small store synced by effects and read
// with useSyncExternalStore: render stays pure, and no setState runs inside an effect.
function createObjectUrlStore() {
  let urls = new Map<string, { file: File; url: string }>();
  const listeners = new Set<() => void>();
  const emit = (next: typeof urls) => {
    urls = next;
    listeners.forEach((listener) => listener());
  };

  return {
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => void listeners.delete(listener);
    },
    getSnapshot: () => urls,
    // Creates the URLs of new photos and revokes the ones of photos that left the value (or whose
    // file changed under the same id). A no-op when nothing changed.
    sync: (items: { id: string; file: File }[]) => {
      const next = new Map<string, { file: File; url: string }>();
      let changed = false;
      for (const { id, file } of items) {
        const current = urls.get(id);
        if (current?.file === file) next.set(id, current);
        else {
          next.set(id, { file, url: URL.createObjectURL(file) });
          changed = true;
        }
      }
      for (const [id, entry] of urls) {
        if (next.get(id) !== entry) {
          URL.revokeObjectURL(entry.url);
          changed = true;
        }
      }
      if (changed) emit(next);
    },
    clear: () => {
      urls.forEach(({ url }) => URL.revokeObjectURL(url));
      if (urls.size > 0) emit(new Map());
    },
  };
}

const EMPTY_URLS = new Map<string, { file: File; url: string }>();

// Revoking on unmount and syncing again on mount also covers StrictMode: its simulated unmount
// revokes everything, the remount creates new URLs and re-renders, so no revoked URL stays shown.
function useObjectUrls(value: ImageUploaderItem[]) {
  const [store] = React.useState(createObjectUrlStore);
  const urls = React.useSyncExternalStore(store.subscribe, store.getSnapshot, () => EMPTY_URLS);

  React.useEffect(() => {
    store.sync(value.filter((item) => item.kind === 'file'));
  }, [store, value]);
  React.useEffect(() => () => store.clear(), [store]);

  return urls;
}

// The file name without its extension; a name that is only an extension (".png") stays whole.
const baseName = (name: string) => name.replace(/\.[^.]+$/, '') || name;

const iconButton = cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'shrink-0');

/**
 * Gallery of photos with a cover, order and removal. Controlled: the app keeps the value and
 * uploads the files; nothing is sent with the native form. The whole gallery accepts dropped files.
 */
const ImageUploader = React.forwardRef<HTMLDivElement, ImageUploaderProps>(
  (
    {
      label,
      'aria-label': ariaLabel,
      value,
      onValueChange,
      accept = 'image/*',
      max,
      onReject,
      error,
      helperText,
      disabled,
      labels: labelsProp,
      id,
      className,
    },
    ref,
  ) => {
    const labels = { ...DEFAULT_LABELS, ...labelsProp };
    const generatedId = React.useId();
    const triggerId = id || generatedId;
    const labelId = `${triggerId}-label`;
    const countId = `${triggerId}-count`;
    const errorId = `${triggerId}-error`;
    const descriptionId = `${triggerId}-description`;
    const hasError = !!error;

    const full = max !== undefined && value.length >= max;
    const urls = useObjectUrls(value);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const triggerRef = React.useRef<HTMLButtonElement>(null);
    const nextId = React.useRef(0);

    // Buttons by photo id and action, to put the focus back after the value changes.
    const buttons = React.useRef(new Map<string, HTMLButtonElement>());
    const buttonRef = (itemId: string, action: Action) => (node: HTMLButtonElement | null) => {
      const key = `${itemId}:${action}`;
      if (node) buttons.current.set(key, node);
      else buttons.current.delete(key);
    };

    // Applied once the new value is rendered. If the parent doesn't accept the change, the value
    // doesn't change and the pending focus is dropped on the next value.
    const pendingFocus = React.useRef<{ targets: [string, Action][]; fallback: boolean } | null>(
      null,
    );
    React.useLayoutEffect(() => {
      const pending = pendingFocus.current;
      if (!pending) return;
      pendingFocus.current = null;
      for (const [itemId, action] of pending.targets) {
        const button = buttons.current.get(`${itemId}:${action}`);
        if (button) return button.focus();
      }
      if (pending.fallback) triggerRef.current?.focus();
    }, [value]);

    const nameOf = (item: ImageUploaderItem, index: number) =>
      item.kind === 'file'
        ? baseName(item.file.name)
        : (item.alt ?? labels.image(index + 1, index === 0));

    const addFiles = (files: File[]) => {
      if (disabled || files.length === 0) return;
      const { accepted, rejected } = sortFiles(files, { accept, multiple: true });
      const room = max === undefined ? accepted.length : Math.max(0, max - value.length);
      const added = accepted.slice(0, room);
      const excess = accepted.slice(room);

      if (added.length > 0) {
        onValueChange([
          ...value,
          ...added.map((file) => ({
            kind: 'file' as const,
            id: `${generatedId}-${nextId.current++}`,
            file,
          })),
        ]);
      }
      if (rejected.length > 0) onReject?.(rejected, 'type');
      if (excess.length > 0) onReject?.(excess, 'count');
    };

    const move = (index: number, offset: -1 | 1, action: Action) => {
      const target = index + offset;
      const next = [...value];
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      // At an end its own button disappears: the focus goes to the other move button.
      const other: Action = action === 'move-before' ? 'move-after' : 'move-before';
      pendingFocus.current = {
        targets: [
          [item.id, action],
          [item.id, other],
        ],
        fallback: false,
      };
      onValueChange(next);
      announce(labels.moved(nameOf(item, index), target + 1, value.length));
    };

    const remove = (index: number) => {
      const item = value[index];
      const after = value[index + 1];
      const before = value[index - 1];
      pendingFocus.current = {
        targets: [after, before].filter(Boolean).map(({ id: itemId }) => [itemId, 'remove']),
        fallback: true,
      };
      onValueChange(value.filter((_, i) => i !== index));
      announce(labels.removed(nameOf(item, index)));
    };

    const { dragging, dropZoneProps } = useFileDrop({ disabled, onDrop: addFiles });

    const description = [
      max !== undefined ? countId : undefined,
      hasError ? errorId : helperText ? descriptionId : undefined,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div
        ref={ref}
        role="group"
        aria-labelledby={label ? labelId : undefined}
        aria-label={ariaLabel}
        className={cn('flex w-full flex-col gap-1.5', className)}
      >
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

        {/* The drop zone: no role and not focusable, the buttons are the controls. */}
        <div
          {...dropZoneProps}
          data-dragging={dragging ? '' : undefined}
          className={cn(
            'flex flex-col gap-4 rounded-lg border-2 border-dashed p-4 transition-colors data-dragging:border-primary data-dragging:bg-primary/5',
            hasError ? 'border-error' : 'border-base-300',
          )}
        >
          {value.length > 0 && (
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-3">
              {value.map((item, index) => {
                const cover = index === 0;
                const image = labels.image(index + 1, cover);
                const src = item.kind === 'file' ? urls.get(item.id)?.url : item.src;
                return (
                  <li key={item.id} className="flex min-w-0 flex-col gap-1">
                    <div className="relative overflow-hidden rounded-md bg-base-200">
                      <AspectRatio ratio={1}>
                        {src ? (
                          <Image
                            src={src}
                            alt={nameOf(item, index)}
                            fallback={<div className="h-full w-full bg-base-300" />}
                          />
                        ) : (
                          <Skeleton className="h-full w-full" />
                        )}
                      </AspectRatio>
                      {cover && (
                        <Badge size="sm" className="absolute left-2 top-2">
                          {labels.cover}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {index > 0 && (
                        <button
                          type="button"
                          ref={buttonRef(item.id, 'move-before')}
                          className={iconButton}
                          aria-label={labels.moveBefore(image)}
                          disabled={disabled}
                          onClick={() => move(index, -1, 'move-before')}
                        >
                          <ArrowLeftIcon aria-hidden="true" />
                        </button>
                      )}
                      {index < value.length - 1 && (
                        <button
                          type="button"
                          ref={buttonRef(item.id, 'move-after')}
                          className={iconButton}
                          aria-label={labels.moveAfter(image)}
                          disabled={disabled}
                          onClick={() => move(index, 1, 'move-after')}
                        >
                          <ArrowRightIcon aria-hidden="true" />
                        </button>
                      )}
                      <button
                        type="button"
                        ref={buttonRef(item.id, 'remove')}
                        className={cn(iconButton, 'ml-auto')}
                        aria-label={labels.remove(image)}
                        disabled={disabled}
                        onClick={() => remove(index)}
                      >
                        <TrashIcon aria-hidden="true" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3 text-center">
            {/* No name: nothing goes with the native form, the app uploads the files. */}
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              multiple
              hidden
              tabIndex={-1}
              onChange={(event) => {
                addFiles(Array.from(event.target.files ?? []));
                // Empty, so choosing the same file again fires change.
                event.target.value = '';
              }}
            />
            {/* aria-disabled when full, not disabled: it stays focusable, so the focus isn't
                lost on return from the dialog and removing a photo has somewhere to go. */}
            <button
              ref={triggerRef}
              id={triggerId}
              type="button"
              disabled={disabled}
              aria-disabled={full || undefined}
              aria-describedby={description || undefined}
              className={cn(
                buttonVariants({ variant: 'outline', size: 'md' }),
                full && 'cursor-not-allowed',
              )}
              onClick={() => {
                if (!full) inputRef.current?.click();
              }}
            >
              {labels.add}
            </button>
            <span
              aria-hidden="true"
              className={cn('text-sm text-base-content/70', (disabled || full) && 'opacity-50')}
            >
              {labels.drop}
            </span>
            {max !== undefined && (
              <span id={countId} className="text-sm text-base-content/70">
                {labels.count(value.length, max)}
              </span>
            )}
          </div>
        </div>

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
ImageUploader.displayName = 'ImageUploader';

export { ImageUploader };
