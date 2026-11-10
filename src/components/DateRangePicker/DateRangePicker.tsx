'use client';

import * as React from 'react';
import { format, type Locale } from 'date-fns';
import type { DateRange, Matcher } from '@daypicker/react';
import { CalendarIcon } from '@radix-ui/react-icons';
import { Popover, PopoverContent, PopoverTrigger } from '../Popover';
import { Button } from '../Button';
import { Calendar } from '../Calendar';
import { cn } from '../../utils/cn';
import { PickerField, type PickerFieldTextProps } from '../PickerField/PickerField';

export type { DateRange };

export interface DateRangePickerProps extends PickerFieldTextProps {
  /** The chosen range. `onRangeChange` only receives complete ranges, with `from` and `to`. */
  range?: DateRange;
  onRangeChange?: (range: DateRange) => void;
  /** Days before it are disabled. */
  minDate?: Date;
  /** Days after it are disabled. */
  maxDate?: Date;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  /** Accessible name of the calendar popover. @default 'Choose dates' */
  dialogLabel?: string;
  /**
   * date-fns locale for the trigger dates and for the Calendar (months and weekdays).
   * Without a locale, everything stays in English.
   */
  locale?: Locale;
}

/**
 * Picks a range of days: a trigger with both dates and a Calendar in `mode="range"` in a Popover,
 * which closes when the range is complete. Controlled, like `DatePicker`.
 */
function DateRangePicker({
  range,
  onRangeChange,
  minDate,
  maxDate,
  placeholder = 'Pick dates',
  className,
  disabled,
  dialogLabel = 'Choose dates',
  locale,
  label,
  error,
  helperText,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  // The range being picked in this opening, until it's complete. Only then it goes to the consumer:
  // closing halfway keeps the previous range instead of leaving it with no end.
  const [draft, setDraft] = React.useState<DateRange>();

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    setDraft(undefined);
  };

  // Each opening starts a new range. The first pick is only the start: DayPicker, with an empty
  // range, would already return a complete one-day range (from = to), and the popover would
  // close on the first click. From the second pick on, DayPicker's own range is used, which keeps
  // to ≥ from (a day before the start becomes the start) and allows a one-day range.
  const handleSelect = (next: DateRange | undefined, triggerDate: Date) => {
    if (!draft) {
      setDraft({ from: triggerDate, to: undefined });
      return;
    }
    if (next?.from && next.to) {
      onRangeChange?.(next);
      handleOpenChange(false);
    } else {
      setDraft(next);
    }
  };

  const disabledDays = [minDate && { before: minDate }, maxDate && { after: maxDate }].filter(
    Boolean,
  ) as Matcher[];

  const text = range?.from
    ? `${format(range.from, 'PP', { locale })} – ${range.to ? format(range.to, 'PP', { locale }) : ''}`.trim()
    : placeholder;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PickerField
        label={label}
        error={error}
        helperText={helperText}
        renderTrigger={(fieldProps) => (
          <PopoverTrigger asChild>
            <Button
              {...fieldProps}
              variant="outline"
              disabled={disabled}
              startIcon={<CalendarIcon className="h-4 w-4" />}
              className={cn(
                // 16px like the other fields of a form; replaces Button's text-sm through cn.
                'w-72 justify-start text-base font-normal',
                !range?.from && 'text-base-content/70',
                // Error from the aria-invalid PickerField sets, as in SelectTrigger: each class is one
                // attribute more specific than the outline variant's, so it wins without tailwind-merge.
                'aria-[invalid=true]:border-error aria-[invalid=true]:focus-visible:ring-error',
                className,
              )}
            >
              {text}
            </Button>
          </PopoverTrigger>
        )}
      />
      <PopoverContent className="w-auto p-0" align="start" aria-label={dialogLabel}>
        {/* defaultMonth: opens on the month of the range (see DatePicker). While picking, the
            calendar shows the draft; before the first pick, the current range. */}
        <Calendar
          mode="range"
          selected={draft ?? range}
          onSelect={handleSelect}
          defaultMonth={range?.from ?? minDate}
          disabled={disabledDays.length > 0 ? disabledDays : undefined}
          locale={locale}
        />
      </PopoverContent>
    </Popover>
  );
}
DateRangePicker.displayName = 'DateRangePicker';

export { DateRangePicker };
