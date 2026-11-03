'use client';

import * as React from 'react';
import { Command } from 'cmdk';
import { useControllableState } from '@radix-ui/react-use-controllable-state';
import { CheckIcon, ChevronDownIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { cn } from '../../utils/cn';
import { Chip } from '../Chip';
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from '../Popover';
import {
  comboboxFieldVariants,
  comboboxGroupClass,
  comboboxItemDescriptionVariants,
  comboboxItemDimmedClass,
  comboboxItemVariants,
  comboboxMultipleTriggerVariants,
  comboboxSearchVariants,
  comboboxTriggerVariants,
  type ComboboxSize,
} from './comboboxVariants';

export interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
  /**
   * Second line under the label; above all, why the option is disabled. It's part of the
   * option's accessible name. The filter doesn't search it.
   */
  description?: string;
  /** Heading of the group this option belongs to. Without it, the option goes outside groups. */
  group?: string;
}

/** When the list is visible in `mode="inline"`. */
export type ComboboxListVisibility = 'always' | 'focus' | 'query';

interface ComboboxBaseProps {
  options: ComboboxOption[];
  /** Height of the trigger and the search field (32 / 44 / 48, the Select and Input scale). @default 'md' */
  size?: ComboboxSize;
  /** Id of the button in popover mode; inline, of the container (cmdk sets the search field id). */
  id?: string;
  disabled?: boolean;
  /** Trigger text with no value. @default 'Select...' */
  placeholder?: string;
  /** @default 'Search...' */
  searchPlaceholder?: string;
  /** Text when the filter finds no options. @default 'No results.' */
  emptyLabel?: string;
  /** Accessible name of each Chip's ✕ (multiple mode). @default (label) => `Remove ${label}` */
  removeLabel?: (label: string) => string;
  className?: string;
}

// Union discriminated by `mode`, same pattern as `clearable`/`endIcon` in Input:
// `listVisibility` only exists inline (in the popover the list is visible while it's open).
// The first branch accepts both modes (not just 'popover') so that `mode={dynamic}` without
// `listVisibility` still compiles.
export type ComboboxModeProps =
  | {
      /**
       * `'popover'`: a trigger styled like Select opens the search field and the list.
       * `'inline'`: search field and list in the form flow. Inside a `Sheet` or `Dialog`,
       * use `'inline'`. @default 'popover'
       */
      mode?: 'popover' | 'inline';
      listVisibility?: never;
    }
  | {
      mode: 'inline';
      /**
       * `'always'`: the list is always visible. `'focus'`: while the search field has focus.
       * `'query'`: while it has focus and there is text (ignoring spaces). With `'focus'` and
       * `'query'`, Escape hides the list without closing the `Sheet`/`Dialog` that contains it.
       * @default 'always'
       */
      listVisibility?: ComboboxListVisibility;
    };

// Visible label (`label`) or screen-reader-only label (`aria-label`): one of the two.
// It's a string because cmdk only accepts a text to name the search field and the list.
export type ComboboxLabelProps =
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

export type ComboboxSingleProps = ComboboxBaseProps &
  ComboboxLabelProps &
  ComboboxModeProps & {
    multiple?: false;
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
  };

export type ComboboxMultipleProps = ComboboxBaseProps &
  ComboboxLabelProps &
  ComboboxModeProps & {
    multiple: true;
    value?: string[];
    defaultValue?: string[];
    onValueChange?: (value: string[]) => void;
  };

export type ComboboxProps = ComboboxSingleProps | ComboboxMultipleProps;

// Without case or diacritics: "mexico" finds "México".
const normalize = (text: string) =>
  text.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase();

const defaultRemoveLabel = (label: string) => `Remove ${label}`;

// Each group goes where its first option appears, with all of its options; an option without
// a group keeps its own place.
const groupOptions = (options: ComboboxOption[]) => {
  const entries: { group?: string; options: ComboboxOption[] }[] = [];
  const groups = new Map<string, ComboboxOption[]>();
  for (const option of options) {
    const members = option.group ? groups.get(option.group) : undefined;
    if (members) {
      members.push(option);
      continue;
    }
    const entry = { group: option.group || undefined, options: [option] };
    if (entry.group) groups.set(entry.group, entry.options);
    entries.push(entry);
  }
  return entries;
};

interface ComboboxImplProps extends ComboboxBaseProps {
  mode?: 'popover' | 'inline';
  listVisibility?: ComboboxListVisibility;
  label?: string;
  'aria-label'?: string;
  multiple: boolean;
  selected: string[];
  onToggle: (value: string) => void;
  /** Remove with the Chip's ✕: in single mode it clears the value (`onToggle` doesn't deselect). */
  onRemove: (value: string) => void;
}

const ComboboxImpl = React.forwardRef<HTMLDivElement, ComboboxImplProps>(
  (
    {
      options,
      multiple,
      selected,
      onToggle,
      onRemove,
      mode = 'popover',
      listVisibility = 'always',
      size = 'md',
      id: idProp,
      label,
      'aria-label': ariaLabel,
      disabled,
      placeholder = 'Select...',
      searchPlaceholder = 'Search...',
      emptyLabel = 'No results.',
      removeLabel = defaultRemoveLabel,
      className,
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const id = idProp ?? generatedId;
    const valueId = `${id}-value`;
    const labelId = `${id}-label`;
    // Text that names the search field and the list (cmdk's `label` prop).
    const accessibleLabel = label ?? ariaLabel ?? '';
    const inline = mode === 'inline';

    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState('');
    // List tied to focus (inline with 'focus' or 'query'). `dismissed`: Escape hid it;
    // it comes back on typing or on focusing again.
    const collapsible = inline && listVisibility !== 'always';
    const [focused, setFocused] = React.useState(false);
    const [dismissed, setDismissed] = React.useState(false);
    const listVisible =
      !collapsible ||
      (focused && !dismissed && (listVisibility === 'focus' || search.trim() !== ''));

    const triggerRef = React.useRef<HTMLButtonElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const chipRefs = React.useRef(new Map<string, HTMLSpanElement>());
    // Value of the Chip that gets focus after removing another; '' = the button or the search field.
    const pendingFocus = React.useRef<string | null>(null);

    const filtered = React.useMemo(() => {
      const query = normalize(search.trim());
      return query ? options.filter((option) => normalize(option.label).includes(query)) : options;
    }, [options, search]);

    const selectedOptions = selected
      .map((value) => options.find((option) => option.value === value))
      .filter((option): option is ComboboxOption => option !== undefined);

    // cmdk writes aria-expanded="true" after the props, so it can't be passed as a prop.
    // React doesn't write the attribute again while cmdk doesn't change its value (always true):
    // the one set here stays. In the server HTML, cmdk's "true" remains until hydration.
    React.useLayoutEffect(() => {
      if (collapsible) inputRef.current?.setAttribute('aria-expanded', String(listVisible));
    });

    // Radix (Dialog, Sheet, Popover) listens for Escape on document, in the capture phase: a
    // handler on the search field arrives too late. A listener on window, also in capture, runs
    // first; with preventDefault, Radix doesn't close the layer (DismissableLayer only closes if the
    // event wasn't prevented). It's only active while the list is visible, so the second Escape
    // closes the container.
    React.useEffect(() => {
      if (!collapsible || !listVisible) return;
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key !== 'Escape' || event.isComposing || event.target !== inputRef.current)
          return;
        event.preventDefault();
        setDismissed(true);
      };
      window.addEventListener('keydown', onKeyDown, { capture: true });
      return () => window.removeEventListener('keydown', onKeyDown, { capture: true });
    }, [collapsible, listVisible]);

    React.useEffect(() => {
      const target = pendingFocus.current;
      if (target === null) return;
      pendingFocus.current = null;
      const chipButton = target ? chipRefs.current.get(target)?.querySelector('button') : null;
      (chipButton ?? (inline ? inputRef.current : triggerRef.current))?.focus();
    }, [selected, inline]);

    // Focus moves to the next focusable element in DOM order: the next Chip or, if it was the
    // last one, the button (the search field inline).
    const removeChip = (value: string) => {
      const index = selectedOptions.findIndex((option) => option.value === value);
      pendingFocus.current = selectedOptions[index + 1]?.value ?? '';
      onRemove(value);
    };

    const handleSelect = (value: string) => {
      onToggle(value);
      if (!multiple && !inline) {
        setOpen(false);
        setSearch('');
      }
      // With 'query', clearing the text hides the list; with 'focus' it stays visible. Focus doesn't
      // move: the pointer doesn't take it out of the search field (the list's onMouseDown).
      if (collapsible) setSearch('');
    };

    const chips = selectedOptions.map((option) => (
      <Chip
        key={option.value}
        ref={(node) => {
          if (node) chipRefs.current.set(option.value, node);
          else chipRefs.current.delete(option.value);
        }}
        variant="ghost"
        size={size}
        disabled={disabled || option.disabled}
        onRemove={() => removeChip(option.value)}
        removeLabel={removeLabel(option.label)}
      >
        {option.label}
      </Chip>
    ));

    const renderItem = (option: ComboboxOption) => {
      const isSelected = selected.includes(option.value);
      const described = Boolean(option.description);
      return (
        <Command.Item
          key={option.value}
          value={option.value}
          disabled={disabled || option.disabled}
          onSelect={() => handleSelect(option.value)}
          // cmdk uses aria-selected for the highlighted item (and writes it after the
          // props): the chosen state goes in aria-checked, which ARIA 1.2 allows on option.
          aria-checked={isSelected}
          className={comboboxItemVariants({ size, described })}
        >
          <CheckIcon
            aria-hidden
            className={cn(
              'h-4 w-4 shrink-0',
              !isSelected && 'invisible',
              described && comboboxItemDimmedClass,
            )}
          />
          {described ? (
            // Inside the option's content, not aria-describedby: the highlighted option is exposed
            // through aria-activedescendant, where descriptions are read less reliably than the
            // name. The space keeps the two texts apart in the name computed from the content.
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className={comboboxItemDimmedClass}>{option.label}</span>{' '}
              <span className={comboboxItemDescriptionVariants({ size })}>
                {option.description}
              </span>
            </span>
          ) : (
            option.label
          )}
        </Command.Item>
      );
    };

    const command = (
      <Command
        shouldFilter={false}
        label={accessibleLabel}
        defaultValue={multiple ? undefined : selected[0]}
        className={cn(
          'flex min-h-0 flex-col text-base-content',
          inline &&
            'overflow-hidden rounded-btn border border-base-300 bg-base-100 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2',
        )}
      >
        <div
          className={cn('flex items-center gap-2 px-3', listVisible && 'border-b border-base-300')}
        >
          <MagnifyingGlassIcon aria-hidden className="h-4 w-4 shrink-0 opacity-50" />
          <Command.Input
            ref={inputRef}
            value={search}
            onValueChange={(next) => {
              setSearch(next);
              setDismissed(false);
            }}
            onFocus={() => {
              setFocused(true);
              setDismissed(false);
            }}
            onBlur={() => setFocused(false)}
            placeholder={searchPlaceholder}
            disabled={disabled}
            className={comboboxSearchVariants({ size })}
          />
        </div>
        {/* Hidden (hidden), the list stays in the DOM so the search field's aria-controls points
            to something, but without options: that way Enter and cmdk's arrow keys don't choose
            or highlight anything invisible, and Command.Empty (which cmdk shows when there are no
            options) doesn't appear.
            onMouseDown: focus stays in the search field when using the pointer on the list.
            Without it, focus would move to the list (tabIndex -1) or to the body, in multiple mode
            the text being typed would lose its target, and with 'focus'/'query' the blur would
            hide the list before the click. */}
        <Command.List
          label={accessibleLabel || undefined}
          hidden={!listVisible}
          onMouseDown={(event) => event.preventDefault()}
          className="max-h-72 min-h-0 overflow-y-auto overscroll-contain p-1"
        >
          {listVisible && (
            <Command.Empty className="py-6 text-center text-sm text-base-content/70">
              {emptyLabel}
            </Command.Empty>
          )}
          {groupOptions(listVisible ? filtered : []).map((entry) =>
            entry.group ? (
              <Command.Group
                key={`group:${entry.group}`}
                heading={entry.group}
                className={comboboxGroupClass}
              >
                {entry.options.map(renderItem)}
              </Command.Group>
            ) : (
              entry.options.map(renderItem)
            ),
          )}
        </Command.List>
      </Command>
    );

    // Same style as Input's label.
    const labelClassName = cn(
      'text-sm font-medium leading-none text-base-content',
      disabled && 'cursor-not-allowed opacity-70',
    );

    if (inline) {
      return (
        <div ref={ref} id={id} className={cn('flex w-full flex-col gap-1.5', className)}>
          {label !== undefined && (
            // cmdk sets the id of its input and its aria-labelledby, which points to its own hidden
            // label (with the `label` text): a visible label can't point to it with for.
            // This one is visual only: aria-hidden so the reader doesn't read the label twice,
            // and clicking focuses the search field like a <label for> would. It isn't focusable, so
            // it doesn't need a keyboard equivalent.
            <span aria-hidden className={labelClassName} onClick={() => inputRef.current?.focus()}>
              {label}
            </span>
          )}
          {/* In single mode with a conditional list, the Chip is the only thing showing the
              value while the list is hidden. */}
          {(multiple || collapsible) && chips.length > 0 && (
            <div className="flex flex-wrap gap-1">{chips}</div>
          )}
          {command}
        </div>
      );
    }

    // A <label for> on a button replaces its content in the accessible name: the value would be
    // lost. aria-labelledby joins the label and the value; with aria-label, the button
    // references itself (it contributes its aria-label).
    const triggerLabelledBy = `${label !== undefined ? labelId : id} ${valueId}`;

    const selectedText = selectedOptions.map((option) => option.label).join(', ');
    const chevron = <ChevronDownIcon aria-hidden className="h-4 w-4 shrink-0 opacity-50" />;

    const trigger = (
      <PopoverTrigger asChild>
        <button
          ref={triggerRef}
          type="button"
          id={id}
          disabled={disabled}
          aria-label={label !== undefined ? undefined : ariaLabel}
          aria-labelledby={triggerLabelledBy}
          data-combobox-trigger=""
          className={
            multiple ? comboboxMultipleTriggerVariants({ size }) : comboboxTriggerVariants({ size })
          }
        >
          {multiple && selectedOptions.length > 0 ? (
            <span id={valueId} className="sr-only">
              {selectedText}
            </span>
          ) : (
            <span
              id={valueId}
              className={cn('truncate', !selectedOptions.length && 'text-base-content/50')}
            >
              {selectedText || placeholder}
            </span>
          )}
          {chevron}
        </button>
      </PopoverTrigger>
    );

    return (
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setSearch('');
        }}
      >
        <div ref={ref} className={cn('flex w-full flex-col gap-1.5', className)}>
          {label !== undefined && (
            // A click activates the button (native behavior of a <label> on a button), same
            // as a click on the field.
            <label id={labelId} htmlFor={id} className={labelClassName}>
              {label}
            </label>
          )}
          {multiple ? (
            <PopoverAnchor asChild>
              <div
                data-disabled={disabled ? '' : undefined}
                className={comboboxFieldVariants({ size })}
              >
                {chips}
                {trigger}
              </div>
            </PopoverAnchor>
          ) : (
            trigger
          )}
        </div>
        <PopoverContent
          align="start"
          aria-labelledby={label !== undefined ? labelId : undefined}
          aria-label={label !== undefined ? undefined : ariaLabel}
          className="flex max-h-[var(--radix-popover-content-available-height)] w-[var(--radix-popover-trigger-width)] min-w-48 flex-col p-0"
        >
          {command}
        </PopoverContent>
      </Popover>
    );
  },
);
ComboboxImpl.displayName = 'ComboboxImpl';

const SingleCombobox = React.forwardRef<HTMLDivElement, ComboboxSingleProps>(
  ({ value: valueProp, defaultValue, onValueChange, ...props }, ref) => {
    const [value, setValue] = useControllableState({
      prop: valueProp,
      defaultProp: defaultValue ?? '',
      onChange: onValueChange,
    });
    return (
      <ComboboxImpl
        {...props}
        ref={ref}
        multiple={false}
        selected={value ? [value] : []}
        onToggle={setValue}
        onRemove={() => setValue('')}
      />
    );
  },
);
SingleCombobox.displayName = 'SingleCombobox';

const MultipleCombobox = React.forwardRef<HTMLDivElement, ComboboxMultipleProps>(
  ({ value: valueProp, defaultValue, onValueChange, ...props }, ref) => {
    const [value, setValue] = useControllableState({
      prop: valueProp,
      defaultProp: defaultValue ?? [],
      onChange: onValueChange,
    });
    return (
      <ComboboxImpl
        {...props}
        ref={ref}
        multiple
        selected={value}
        onToggle={(toggled) =>
          setValue(
            value.includes(toggled) ? value.filter((v) => v !== toggled) : [...value, toggled],
          )
        }
        onRemove={(removed) => setValue(value.filter((v) => v !== removed))}
      />
    );
  },
);
MultipleCombobox.displayName = 'MultipleCombobox';

/**
 * Selection field with a search box over a list of options (`options`). The filter looks for
 * the text anywhere in the label, ignoring case and accents, and keeps the order of
 * `options`.
 *
 * - Single mode (default): `value: string` (`''` with no value). Choosing an option closes the
 *   popover and returns focus to the trigger; choosing the current one doesn't deselect it.
 * - `multiple`: `value: string[]`. The popover stays open on choosing; the chosen options are
 *   shown as a `Chip` removed with its ✕ (focus moves to the next Chip, or to the button).
 *
 * `mode="popover"` (default): the search field is a `combobox` inside a popover (`dialog`)
 * that takes its name from the field label; Escape closes it and returns focus.
 * `mode="inline"`: search field and list in the form flow; **inside a `Sheet` or `Dialog`,
 * use `mode="inline"`**. `listVisibility` (`'always'` | `'focus'` | `'query'`) decides when the
 * list is visible inline; with `'focus'`/`'query'`, the single value is also shown as a `Chip`.
 *
 * Requires `label` (visible label, styled like Input's) or `aria-label`, not both.
 * The trigger announces the label and the current value; the popover, the search field and
 * the list are named with the label. Chosen options have `aria-checked="true"`.
 */
const Combobox = React.forwardRef<HTMLDivElement, ComboboxProps>((props, ref) =>
  props.multiple ? (
    <MultipleCombobox {...props} ref={ref} />
  ) : (
    <SingleCombobox {...props} ref={ref} />
  ),
);
Combobox.displayName = 'Combobox';

export { Combobox };
