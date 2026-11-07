import * as React from 'react';
import { cn } from '../../utils/cn';

// Server-safe: no hooks, no Context and no handlers. Each item draws its own marker and the line
// down to the next one, so no part needs to know about its parent.

export type TimelineProps = React.OlHTMLAttributes<HTMLOListElement>;

/** Read-only sequence (an itinerary, a history of states). The children are `TimelineItem`s or `TimelineGroup`s. */
const Timeline = React.forwardRef<HTMLOListElement, TimelineProps>(
  ({ className, ...props }, ref) => (
    <ol ref={ref} className={cn('flex flex-col', className)} {...props} />
  ),
);
Timeline.displayName = 'Timeline';

export type TimelineItemProps = React.LiHTMLAttributes<HTMLLIElement> &
  (
    | {
        /** Time or date shown at the end of the row, with tabular figures. */
        time: React.ReactNode;
        /** Machine-readable value of `time` (e.g. "2026-11-07T09:30"): renders it as a `<time>`. */
        dateTime?: string;
      }
    | { time?: undefined; dateTime?: never }
  );

/**
 * A step of the sequence: a marker, the line to the next step and the content. With `time`, the
 * content shares the row with it; without it, the content takes the whole width.
 */
const TimelineItem = React.forwardRef<HTMLLIElement, TimelineItemProps>(
  ({ className, time, dateTime, children, ...props }, ref) => {
    const TimeTag = dateTime ? 'time' : 'span';
    return (
      <li ref={ref} className={cn('group/timeline-item relative flex gap-3', className)} {...props}>
        {/* Marker column. The line runs from under the dot to the bottom of the item, through its
            padding, and stops 4px before the next dot; the last item of each list has none. */}
        <span aria-hidden="true" className="relative flex w-3 shrink-0 justify-center">
          <span className="mt-1 size-3 rounded-full border-2 border-primary bg-base-100" />
          <span className="absolute bottom-0 left-1/2 top-5 w-px -translate-x-1/2 bg-base-content/20 group-last/timeline-item:hidden" />
        </span>
        <div className="flex min-w-0 flex-1 gap-3 pb-6 text-sm leading-5 text-base-content group-last/timeline-item:pb-0">
          <div className="min-w-0 flex-1">{children}</div>
          {time !== undefined && time !== null && (
            <TimeTag dateTime={dateTime} className="shrink-0 text-base-content/70 tabular-nums">
              {time}
            </TimeTag>
          )}
        </div>
      </li>
    );
  },
);
TimelineItem.displayName = 'TimelineItem';

export type TimelineGroupProps = Omit<React.LiHTMLAttributes<HTMLLIElement>, 'title'> & {
  /** Heading of the group (a day, a stage). */
  title: React.ReactNode;
  /** Level of the heading, to fit the page outline. @default 3 */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
};

/**
 * Groups steps under a heading: a `<li>` with the heading and a nested `<ol>` of `TimelineItem`s.
 * The line is drawn per group, so it breaks between groups.
 */
const TimelineGroup = React.forwardRef<HTMLLIElement, TimelineGroupProps>(
  ({ className, title, headingLevel = 3, children, ...props }, ref) => {
    const Heading = `h${headingLevel}` as const;
    return (
      <li ref={ref} className={cn('flex flex-col gap-3 pb-6 last:pb-0', className)} {...props}>
        <Heading className="text-sm font-semibold text-base-content">{title}</Heading>
        <ol className="flex flex-col">{children}</ol>
      </li>
    );
  },
);
TimelineGroup.displayName = 'TimelineGroup';

export { Timeline, TimelineItem, TimelineGroup };
