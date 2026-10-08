'use client';

import { format, type Locale } from 'date-fns';
import { CalendarIcon } from '@radix-ui/react-icons';
import { Popover, PopoverContent, PopoverTrigger } from '../Popover';
import { Button } from '../Button';
import { Calendar } from '../Calendar';
import { cn } from '../../utils/cn';

export interface DatePickerProps {
  date?: Date;
  onDateChange?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  /** Nombre accesible del popover del calendario. @default 'Choose date' */
  dialogLabel?: string;
  /**
   * Locale de date-fns para la fecha del disparador y para el Calendar (meses y días de la
   * semana). Sin locale, todo queda en inglés.
   */
  locale?: Locale;
}

function DatePicker({
  date,
  onDateChange,
  placeholder = 'Pick a date',
  className,
  disabled,
  dialogLabel = 'Choose date',
  locale,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          startIcon={<CalendarIcon className="h-4 w-4" />}
          className={cn(
            'w-60 justify-start font-normal',
            !date && 'text-base-content/70',
            className,
          )}
        >
          {date ? format(date, 'PPP', { locale }) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start" aria-label={dialogLabel}>
        {/* DayPickerLocale extiende el Locale de date-fns (solo agrega `labels?`): se asigna
            sin cast. Las etiquetas de navegación salen de `labels`, que los locales de date-fns
            no traen.
            defaultMonth (no month): PopoverContent se monta en cada apertura, así que el
            calendario abre en el mes de la fecha elegida y la navegación sigue siendo libre. */}
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
