'use client';

import * as React from 'react';
import {
  DayPicker,
  type ChevronProps,
  type DayButtonProps,
  type DayPickerProps,
  type Modifiers,
  type NextMonthButtonProps,
  type PreviousMonthButtonProps,
} from '@daypicker/react';
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
} from '@radix-ui/react-icons';
import { cn } from '../../utils/cn';
import { buttonVariants } from '../Button/buttonVariants';

type CalendarSize = 'sm' | 'md' | 'lg';

export type CalendarProps = DayPickerProps & {
  /** Size of the day cells: 36, 44 or 56px. @default 'sm' */
  size?: CalendarSize;
  /**
   * Rendered under the number, inside the day's button. The button's name comes from
   * `labels.labelDayButton`, not from this content: put its text equivalent there.
   */
  renderDayContent?: (date: Date, modifiers: Modifiers) => React.ReactNode;
};

const DAY_SIZE: Record<CalendarSize, string> = {
  sm: 'h-9 w-9',
  md: 'h-11 w-11',
  lg: 'h-14 w-14',
};

const WEEKDAY_WIDTH: Record<CalendarSize, string> = {
  sm: 'w-9',
  md: 'w-11',
  lg: 'w-14',
};

const DAY_CONTENT_PADDING: Record<CalendarSize, string> = {
  sm: 'pt-0.5',
  md: 'pt-1',
  lg: 'pt-2',
};

// A context and not a closure in `components`: a new DayButton on each render would remount every
// day, and the focused one would lose its focus.
const CalendarDayContext = React.createContext<Pick<CalendarProps, 'size' | 'renderDayContent'>>({
  size: 'sm',
});

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

// Extends the arrows' hit area to 44x44 without touching their 28x28 look. An absolute ::after
// is placed from the padding box (26x26, inside the 1px border), hence 9px per side, not 8. The
// resulting 8px beyond the visual edge stays within the root's p-3 and the month's gap-y-4.
const NAV_BUTTON_HIT_AREA =
  "relative after:content-[''] after:absolute after:rounded-btn after:-inset-[9px]";

function CalendarPreviousButton({ className, children, ...props }: PreviousMonthButtonProps) {
  return (
    <button
      className={cn(
        buttonVariants({ variant: 'outline' }),
        'h-7 w-7 p-0 text-base-content/60 hover:text-base-content',
        NAV_BUTTON_HIT_AREA,
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
        NAV_BUTTON_HIT_AREA,
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

// Days have no ::after, on purpose: the grid is contiguous, so an extension would land on the
// neighboring day. Only md and lg reach 44px. See ARCHITECTURE.md, "Objetivo táctil de 44px".
function CalendarDayButton({ day, modifiers, className, children, ...props }: DayButtonProps) {
  const { size = 'sm', renderDayContent } = React.useContext(CalendarDayContext);
  const content = renderDayContent?.(day.date, modifiers);

  return (
    <button
      className={cn(
        buttonVariants({ variant: 'ghost', size: 'icon' }),
        DAY_SIZE[size],
        'rounded-btn p-0 font-normal aria-selected:opacity-100',
        // Top-aligned whenever the prop is passed, so the numbers of a row stay in line whether or
        // not each day has content.
        renderDayContent && [
          'flex-col justify-start gap-0 overflow-hidden',
          DAY_CONTENT_PADDING[size],
        ],
        modifiers.today && !modifiers.selected && 'border border-primary text-primary',
        modifiers.outside && 'text-base-content/70',
        modifiers.disabled && 'pointer-events-none opacity-50',
        modifiers.range_middle && 'rounded-none bg-primary/10 hover:bg-primary/10',
        (modifiers.selected || modifiers.range_start || modifiers.range_end) &&
          'bg-primary text-primary-content hover:bg-primary-focus',
        className,
      )}
      {...props}
    >
      {children}
      {content !== undefined && content !== null && content !== false && (
        <span className="max-w-full text-[0.625rem] leading-3">{content}</span>
      )}
    </button>
  );
}

function Calendar({
  className,
  classNames,
  components,
  showOutsideDays = true,
  size = 'sm',
  renderDayContent,
  ...props
}: CalendarProps) {
  const dayContext = React.useMemo(() => ({ size, renderDayContent }), [size, renderDayContent]);

  return (
    <CalendarDayContext.Provider value={dayContext}>
      <DayPicker
        showOutsideDays={showOutsideDays}
        navLayout="around"
        className={cn('p-3', className)}
        classNames={{
          months: 'flex flex-col sm:flex-row gap-4',
          month: 'grid grid-cols-[auto_1fr_auto] items-center gap-y-4',
          month_caption:
            'col-start-2 flex items-center justify-center text-sm font-medium text-base-content',
          month_grid: 'col-span-3 w-full border-collapse',
          weekday: cn(WEEKDAY_WIDTH[size], 'pb-2 text-[0.8rem] font-normal text-base-content/70'),
          day: 'relative p-0 text-center text-sm focus-within:relative focus-within:z-20',
          ...classNames,
        }}
        components={{
          Chevron: CalendarChevron,
          PreviousMonthButton: CalendarPreviousButton,
          NextMonthButton: CalendarNextButton,
          DayButton: CalendarDayButton,
          ...components,
        }}
        {...props}
      />
    </CalendarDayContext.Provider>
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
