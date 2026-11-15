// Internal module, not exported from any barrel: the month DatePicker and DateRangePicker open
// their Calendar on. A pure function, no directive needed: it runs wherever its caller runs.

/**
 * Month the calendar opens on: the selected date's (DatePicker's `date`, DateRangePicker's
 * `range.from`), even out of range (the consumer flags it with `error`); without one, today
 * clamped to [minDate, maxDate]. Comparing instants is enough: when today and a bound fall on the
 * same day, they are also in the same month. `undefined` lets DayPicker open on today, as without
 * bounds. With minDate after maxDate the result is unspecified: no validation, no throw.
 */
export function getInitialMonth(selected?: Date, minDate?: Date, maxDate?: Date): Date | undefined {
  if (selected) return selected;
  const today = new Date();
  if (minDate && today < minDate) return minDate;
  if (maxDate && today > maxDate) return maxDate;
  return undefined;
}
