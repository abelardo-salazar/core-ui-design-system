'use client';

import { format, type Locale } from 'date-fns';
import { CalendarIcon } from '@radix-ui/react-icons';
import { Popover, PopoverContent, PopoverTrigger } from '../Popover';
import { Button } from '../Button';
import { Calendar } from '../Calendar';
import { cn } from '../../utils/cn';
import { PickerField, type PickerFieldTextProps } from '../PickerField/PickerField';

export interface DatePickerProps extends PickerFieldTextProps {
  date?: Date;
  onDateChange?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  /** Accessible name of the calendar popover. @default 'Choose date' */
  dialogLabel?: string;
  /**
   * date-fns locale for the trigger date and for the Calendar (months and weekdays).
   * Without a locale, everything stays in English.
   */
  locale?: Locale;
  // label, error and helperText come from PickerFieldTextProps: all optional, so a DatePicker
  // without them keeps its DOM and its name (the trigger's text).
}

function DatePicker({
  date,
  onDateChange,
  placeholder = 'Pick a date',
  className,
  disabled,
  dialogLabel = 'Choose date',
  locale,
  label,
  error,
  helperText,
}: DatePickerProps) {
  return (
    <Popover>
      <PickerField
        label={label}
        error={error}
        helperText={helperText}
        renderTrigger={(fieldProps, { hasError }) => (
          <PopoverTrigger asChild>
            <Button
              {...fieldProps}
              variant="outline"
              disabled={disabled}
              startIcon={<CalendarIcon className="h-4 w-4" />}
              className={cn(
                'w-60 justify-start font-normal',
                !date && 'text-base-content/70',
                // Same error look as FileInput's trigger: border and focus ring.
                hasError && 'border-error focus-visible:ring-error',
                className,
              )}
            >
              {date ? format(date, 'PPP', { locale }) : placeholder}
            </Button>
          </PopoverTrigger>
        )}
      />
      <PopoverContent className="w-auto p-0" align="start" aria-label={dialogLabel}>
        {/* DayPickerLocale extends date-fns' Locale (it only adds `labels?`): it's assigned
            without a cast. The navigation labels come from `labels`, which the date-fns locales
            don't have.
            defaultMonth (not month): PopoverContent mounts on each opening, so the
            calendar opens on the month of the chosen date and navigation stays free. */}
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDateChange}
          defaultMonth={date}
          locale={locale}
        />
      </PopoverContent>
    </Popover>
  );
}
DatePicker.displayName = 'DatePicker';

export { DatePicker };
