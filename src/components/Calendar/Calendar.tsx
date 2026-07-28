'use client';

import {
  DayPicker,
  type ChevronProps,
  type DayButtonProps,
  type DayPickerProps,
  type NextMonthButtonProps,
  type PreviousMonthButtonProps,
} from '@daypicker/react';
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon } from '@radix-ui/react-icons';
import { cn } from '../../utils/cn';
import { buttonVariants } from '../Button/buttonVariants';

export type CalendarProps = DayPickerProps;

function CalendarChevron({ orientation, className }: ChevronProps) {
  const classes = cn('h-4 w-4', className);
  switch (orientation) {
    case 'up':
      return <ChevronUpIcon className={classes} />;
    case 'down':
      return <ChevronDownIcon className={classes} />;
    case 'right':
      return <ChevronRightIcon className={classes} />;
    case 'left':
    default:
      return <ChevronLeftIcon className={classes} />;
  }
}

function CalendarPreviousButton({ className, children, ...props }: PreviousMonthButtonProps) {
  return (
    <button
      className={cn(
        buttonVariants({ variant: 'outline' }),
        'h-7 w-7 p-0 text-base-content/60 hover:text-base-content',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function CalendarNextButton({ className, children, ...props }: NextMonthButtonProps) {
  return (
    <button
      className={cn(
        buttonVariants({ variant: 'outline' }),
        'h-7 w-7 p-0 text-base-content/60 hover:text-base-content',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- `day` must be destructured out so it isn't spread onto the DOM button
function CalendarDayButton({ day, modifiers, className, ...props }: DayButtonProps) {
  return (
    <button
      className={cn(
        buttonVariants({ variant: 'ghost', size: 'icon' }),
        'h-9 w-9 rounded-btn p-0 font-normal aria-selected:opacity-100',
        modifiers.today && !modifiers.selected && 'border border-primary text-primary',
        modifiers.outside && 'text-base-content/70',
        modifiers.disabled && 'pointer-events-none opacity-50',
        modifiers.range_middle && 'rounded-none bg-primary/10 hover:bg-primary/10',
        (modifiers.selected || modifiers.range_start || modifiers.range_end) &&
          'bg-primary text-primary-content hover:bg-primary-focus',
        className,
      )}
      {...props}
    />
  );
}

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      navLayout="around"
      className={cn('p-3', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row gap-4',
        month: 'grid grid-cols-[auto_1fr_auto] items-center gap-y-4',
        month_caption: 'col-start-2 flex items-center justify-center text-sm font-medium text-base-content',
        month_grid: 'col-span-3 w-full border-collapse',
        weekday: 'w-9 pb-2 text-[0.8rem] font-normal text-base-content/70',
        day: 'relative p-0 text-center text-sm focus-within:relative focus-within:z-20',
        ...classNames,
      }}
      components={{
        Chevron: CalendarChevron,
        PreviousMonthButton: CalendarPreviousButton,
        NextMonthButton: CalendarNextButton,
        DayButton: CalendarDayButton,
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
