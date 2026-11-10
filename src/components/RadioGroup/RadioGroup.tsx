'use client';

import * as React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { CheckIcon } from '@radix-ui/react-icons';
import { cn } from '../../utils/cn';
import { SelectionField, type SelectionFieldTextProps } from '../SelectionField/SelectionField';

// Visible label (`label`) or screen-reader-only label (`aria-label`): one of the two, same
// pattern as SelectFieldLabelProps.
export type RadioGroupLabelProps =
  | {
      /** Visible name of the group. */
      label: string;
      'aria-label'?: never;
    }
  | {
      label?: never;
      /** Accessible name without a visible label. */
      'aria-label': string;
    };

export type RadioGroupProps = Omit<
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>,
  'aria-label' | 'aria-labelledby'
> &
  RadioGroupLabelProps & {
    // Declared as never because JSX doesn't check excess hyphenated attributes: without it,
    // aria-labelledby would be accepted and its spread would replace the label's.
    'aria-labelledby'?: never;
    /** Marks the group as invalid and takes the place of `helperText`. */
    error?: string;
    helperText?: string;
    /** On the radiogroup, where the items are: the place to change their layout. */
    className?: string;
  };

/**
 * Radio group with its label and error or help message, linked the same way as `Input`. The
 * children are `RadioGroupItem`s or `RadioCard`s. The `ref` goes to the radiogroup.
 */
const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  RadioGroupProps
>(
  (
    {
      label,
      'aria-label': ariaLabel,
      error,
      helperText,
      className,
      id,
      orientation,
      'aria-describedby': describedBy,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const groupId = id || generatedId;
    const labelId = `${groupId}-label`;
    const errorId = `${groupId}-error`;
    const descriptionId = `${groupId}-description`;
    const hasError = !!error;

    return (
      <div className="flex w-full flex-col gap-1.5">
        {/* A span, not a <label>: a radiogroup isn't labelable, it's named by aria-labelledby. */}
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

        <RadioGroupPrimitive.Root
          ref={ref}
          id={groupId}
          orientation={orientation}
          aria-labelledby={label ? labelId : undefined}
          aria-label={ariaLabel}
          aria-invalid={hasError || undefined}
          aria-describedby={
            [describedBy, hasError ? errorId : helperText ? descriptionId : undefined]
              .filter(Boolean)
              .join(' ') || undefined
          }
          className={cn(
            'flex gap-2',
            orientation === 'horizontal' ? 'flex-row flex-wrap' : 'flex-col',
            className,
          )}
          {...props}
        />

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
RadioGroup.displayName = 'RadioGroup';

export type RadioGroupItemProps = Omit<
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>,
  'children' | 'asChild'
> &
  SelectionFieldTextProps;

/**
 * Radio in a row that is a touch target as a whole, at least 48px high: control on the left, then
 * `label` and `description`. The `ref` goes to the radio. `className` applies to the row.
 */
const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioGroupItemProps
>(({ id, label, description, className, 'aria-describedby': describedBy, ...props }, ref) => (
  <SelectionField
    id={id}
    label={label}
    description={description}
    disabled={props.disabled}
    className={className}
    aria-describedby={describedBy}
    // Same row as CheckboxField: py-3.5 + the 20px line of the label add up to 48px.
    rowClassName="items-start gap-3 py-3.5"
    controlPosition="start"
    renderControl={(controlProps) => (
      <RadioGroupPrimitive.Item
        {...controlProps}
        {...props}
        ref={ref}
        className={cn(
          'flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-full border border-primary [-webkit-tap-highlight-color:transparent]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
        )}
      >
        {/* A dot, not only a color change, marks the selection. */}
        <RadioGroupPrimitive.Indicator className="h-2.5 w-2.5 rounded-full bg-primary" />
      </RadioGroupPrimitive.Item>
    )}
  />
));
RadioGroupItem.displayName = 'RadioGroupItem';

export type RadioCardProps = Omit<
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>,
  'children' | 'asChild' | 'title'
> & {
  /** Main text: the accessible name of the card. */
  title: React.ReactNode;
  /** Second text, linked with aria-describedby. With `disabled`, the place for the reason. */
  description?: React.ReactNode;
};

/**
 * A card that is the radio as a whole, at least 48px high. Selected, it shows a thicker border and
 * a check icon, so the selection doesn't depend on color alone. The `ref` goes to the card.
 */
const RadioCard = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioCardProps
>(({ id, title, description, className, 'aria-describedby': describedBy, ...props }, ref) => {
  const generatedId = React.useId();
  const cardId = id || generatedId;
  const titleId = `${cardId}-title`;
  const descriptionId = `${cardId}-description`;
  const hasDescription = description !== undefined && description !== null;

  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      id={cardId}
      // Only the title names it: named by its content, the description would be read twice.
      aria-labelledby={titleId}
      aria-describedby={
        [describedBy, hasDescription ? descriptionId : undefined].filter(Boolean).join(' ') ||
        undefined
      }
      className={cn(
        'relative flex min-h-12 w-full cursor-pointer flex-col items-start justify-center gap-0.5 rounded-lg border border-base-300 bg-base-100 py-3 pl-4 pr-10 text-left transition-colors',
        'pointer-fine:enabled:hover:bg-base-200 enabled:active:bg-base-200 [-webkit-tap-highlight-color:transparent]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        // inset-ring adds the second pixel inside: a thicker border without moving the layout.
        'data-[state=checked]:border-primary data-[state=checked]:inset-ring-1 data-[state=checked]:inset-ring-primary',
        'disabled:cursor-not-allowed',
        className,
      )}
      {...props}
    >
      {/* Only the title is dimmed: the description may hold the reason, it must stay legible. */}
      <span
        id={titleId}
        className={cn('text-sm font-medium text-base-content', props.disabled && 'opacity-50')}
      >
        {title}
      </span>
      {hasDescription && (
        <span id={descriptionId} className="text-xs text-base-content/70">
          {description}
        </span>
      )}
      <RadioGroupPrimitive.Indicator className="absolute right-3 top-3 flex text-primary">
        <CheckIcon aria-hidden="true" className="h-4 w-4" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
});
RadioCard.displayName = 'RadioCard';

export { RadioGroup, RadioGroupItem, RadioCard };
