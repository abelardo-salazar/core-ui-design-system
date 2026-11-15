import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { es } from 'date-fns/locale';
// From the DS ./locale subpath (src/locale.ts), the way the consumer imports it.
import { es as dayPickerEs } from '../../locale';
import { DatePicker } from './DatePicker';

const meta: Meta<typeof DatePicker> = {
  title: 'Components/DatePicker',
  component: DatePicker,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof DatePicker>;

// DatePicker is controlled (no internal state): the consumer handles `date`/`onDateChange`,
// as one would in a real app.
function ControlledDatePicker() {
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  return <DatePicker date={date} onDateChange={setDate} />;
}

// 1. Default
export const Default: Story = {
  render: () => <ControlledDatePicker />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Pick a date' });

    const body = within(document.body);
    await expect(body.queryByRole('dialog')).not.toBeInTheDocument();

    await userEvent.click(trigger);

    const content = await body.findByRole('dialog', { name: 'Choose date' });

    // We pick a visible day within the current month (we avoid "outside" days
    // so we don't depend on which day is "today" when running the test).
    const dayButtons = within(content)
      .getAllByRole('button')
      .filter(
        (el) =>
          /^\d{1,2}$/.test(el.textContent ?? '') && el.closest('td')?.dataset.outside !== 'true',
      );
    const targetDay = dayButtons[Math.min(10, dayButtons.length - 1)];
    await userEvent.click(targetDay);

    // On selecting, the trigger must show the formatted date (no longer the placeholder).
    await expect(trigger).not.toHaveTextContent('Pick a date');
    // Without a locale, date-fns formats in English (PPP: "October 11th, 2026").
    await expect(trigger).toHaveTextContent(/^[A-Z][a-z]+ \d{1,2}(st|nd|rd|th), \d{4}$/);

    // The Popover doesn't reimplement its own open/close handling: it stays open after selecting.
    await expect(body.getByRole('dialog')).toBeInTheDocument();
  },
};

// 2. date-fns Spanish locale: the trigger date, the month and the weekdays
// come out in Spanish; dialogLabel changes the popover's accessible name. The calendar's
// navigation labels stay in English: DayPicker takes them from `locale.labels`, which the
// date-fns locales don't have (see the next story).
export const SpanishLocale: Story = {
  render: () => <DatePicker date={new Date(2026, 0, 15)} locale={es} dialogLabel="Elegir fecha" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '15 de enero de 2026' }));

    const content = await within(document.body).findByRole('dialog', { name: 'Elegir fecha' });
    const caption = within(content).getByRole('grid').getAttribute('aria-label');
    // Opens on the month of the chosen date, not the current one.
    await expect(caption).toBe('enero 2026');
    // DayPicker hides the weekday row from the accessibility tree: query the DOM.
    const weekdays = Array.from(content.querySelectorAll('th'), (th) => th.textContent);
    await expect(weekdays).toEqual(['lu', 'ma', 'mi', 'ju', 'vi', 'sá', 'do']);

    await expect(
      within(content).getByRole('button', { name: 'Go to the Next Month' }),
    ).toBeInTheDocument();
    await expect(
      within(content).getByRole('button', { name: 'Go to the Previous Month' }),
    ).toBeInTheDocument();
  },
};

// 3. DayPicker Spanish locale: it's a date-fns Locale with `labels` added, so
// DatePicker accepts it the same way and also translates the navigation labels.
export const SpanishLocaleWithDayPickerLabels: Story = {
  render: () => <DatePicker date={new Date(2026, 0, 15)} locale={dayPickerEs} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '15 de enero de 2026' }));

    const content = await within(document.body).findByRole('dialog', { name: 'Choose date' });
    await expect(
      within(content).getByRole('button', { name: 'Ir al mes siguiente' }),
    ).toBeInTheDocument();
    await expect(
      within(content).getByRole('button', { name: 'Ir al mes anterior' }),
    ).toBeInTheDocument();
  },
};

// 4. Touch target: the popover's arrows inherit Calendar's 44x44 hit area. PopoverContent must
// not clip the ::after, which only overflows the arrow, not the popover (see Calendar).
export const InheritsCalendarTouchTargets: Story = {
  render: () => <ControlledDatePicker />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Pick a date' }));

    const content = await within(document.body).findByRole('dialog', { name: 'Choose date' });
    await expect(content.className).not.toContain('overflow-');
    for (const name of ['Go to the Previous Month', 'Go to the Next Month']) {
      const arrow = within(content).getByRole('button', { name });
      await expect(arrow.className.split(' ')).toContain('after:-inset-[9px]');
    }
  },
};

// 5. Keyboard: inside the popover, the arrow keys move the focus between days.
export const KeyboardNavigation: Story = {
  render: () => <DatePicker date={new Date(2026, 0, 15)} />,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button'));

    const content = await within(document.body).findByRole('dialog', { name: 'Choose date' });
    within(content)
      .getByRole('button', { name: /January 15th, 2026, selected/ })
      .focus();
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() =>
      expect(within(content).getByRole('button', { name: /January 16th, 2026/ })).toHaveFocus(),
    );
    await userEvent.keyboard('{Escape}');
  },
};

// 6. Without label, error or helperText: the trigger, named by its text, with no field attributes,
// inside a wrapper with display: contents (always rendered, so the trigger isn't remounted when an
// error appears; see ErrorKeepsFocus).
export const WithoutField: Story = {
  render: () => <DatePicker />,
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'Pick a date' });
    const wrapper = trigger.parentElement!;
    await expect(wrapper.parentElement).toBe(canvasElement);
    await expect(wrapper.className).toBe('contents');
    await expect(wrapper.children).toHaveLength(1);
    for (const attribute of ['id', 'aria-labelledby', 'aria-invalid', 'aria-describedby']) {
      await expect(trigger).not.toHaveAttribute(attribute);
    }
    await expect(canvasElement.querySelector('label')).toBeNull();
  },
};

function LabeledDatePicker() {
  const [date, setDate] = React.useState<Date | undefined>(new Date(2026, 0, 15));
  return (
    <DatePicker
      label="Fecha de entrega"
      helperText="De lunes a sábado"
      date={date}
      onDateChange={setDate}
    />
  );
}

// 7. The label names the trigger together with its text, so the chosen date stays in the name;
// helperText describes it.
export const WithLabel: Story = {
  render: () => <LabeledDatePicker />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Fecha de entrega January 15th, 2026' });
    await expect(trigger).toHaveAttribute('aria-invalid', 'false');
    await expect(trigger).toHaveAccessibleDescription('De lunes a sábado');
    await expect(canvas.getByText('Fecha de entrega')).toHaveClass('text-base-content');

    // A span, not a <label>: a click on it doesn't open the popover.
    await expect(canvas.getByText('Fecha de entrega').tagName).toBe('SPAN');
  },
};

// 8. Same pattern as SelectField: aria-invalid and aria-describedby to the error, which takes the
// place of helperText, and the error look on the label and the trigger.
export const WithError: Story = {
  render: () => (
    <DatePicker label="Fecha de entrega" error="Elige una fecha" helperText="De lunes a sábado" />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Fecha de entrega Pick a date' });
    await expect(trigger).toHaveAttribute('aria-invalid', 'true');
    await expect(trigger).toHaveAccessibleDescription('Elige una fecha');
    await expect(canvas.queryByText('De lunes a sábado')).toBeNull();
    await expect(canvas.getByText('Elige una fecha').className).toBe(
      'text-xs text-error-focus font-medium',
    );
    await expect(canvas.getByText('Fecha de entrega')).toHaveClass('text-error-focus');
    const classes = trigger.className.split(/\s+/);
    // From aria-invalid, as in SelectTrigger; ErrorLook checks the computed style.
    await expect(classes).toEqual(
      expect.arrayContaining([
        'aria-[invalid=true]:border-error',
        'aria-[invalid=true]:focus-visible:ring-error',
      ]),
    );
  },
};

// 9. helperText alone, without a label: the trigger keeps its text as its name.
export const HelperTextOnly: Story = {
  render: () => <DatePicker helperText="De lunes a sábado" />,
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'Pick a date' });
    await expect(trigger).not.toHaveAttribute('aria-labelledby');
    await expect(trigger).toHaveAccessibleDescription('De lunes a sábado');
  },
};

function ErrorAppears() {
  const [error, setError] = React.useState<string>();
  return (
    <div className="flex flex-col gap-2">
      <DatePicker error={error} />
      <button type="button" onClick={() => setError('Elige una fecha')}>
        Validar
      </button>
    </div>
  );
}

// 10. When the error appears, the trigger is the same node and keeps the focus: the field's root
// doesn't change type, so React doesn't remount the trigger.
export const ErrorKeepsFocus: Story = {
  render: () => <ErrorAppears />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Pick a date' });
    trigger.focus();
    // click() without userEvent: it doesn't move the focus off the trigger.
    canvas.getByRole('button', { name: 'Validar' }).click();
    await canvas.findByText('Elige una fecha');
    await expect(document.activeElement).toBe(trigger);
    await expect(trigger.isConnected).toBe(true);
    await expect(trigger).toHaveAttribute('aria-invalid', 'true');
    await expect(trigger).toHaveAccessibleDescription('Elige una fecha');
  },
};

// 11. With the real CSS: the error look comes from aria-invalid and is the same as before, the
// error border and focus ring, compared with a reference element. Without the field, the wrapper
// doesn't take part in the layout.
export const ErrorLook: Story = {
  tags: ['real-css'],
  render: () => (
    <div className="flex flex-col gap-4">
      <DatePicker label="Con error" error="Elige una fecha" />
      <DatePicker label="Sin error" />
      <DatePicker />
      <div
        data-testid="reference"
        className="border border-error ring-2 ring-error ring-offset-2"
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const reference = getComputedStyle(canvas.getByTestId('reference'));
    const invalid = canvas.getByRole('button', { name: /Con error/ });
    const valid = canvas.getByRole('button', { name: /Sin error/ });

    await expect(getComputedStyle(invalid).borderTopColor).toBe(reference.borderTopColor);
    await expect(getComputedStyle(valid).borderTopColor).not.toBe(reference.borderTopColor);

    // Keyboard focus, so :focus-visible applies.
    invalid.focus();
    await userEvent.tab({ shift: true });
    await userEvent.tab();
    await expect(invalid).toHaveFocus();
    // The ring layer of the reference (color and 4px spread). The trigger also has Button's own
    // shadow-sm, and transition-all animates the ring: wait until it ends.
    const ring = reference.boxShadow.match(/rgba?\([^)]*\) 0px 0px 0px 4px/)![0];
    await waitFor(() => expect(getComputedStyle(invalid).boxShadow).toContain(ring));

    const bare = canvas.getByRole('button', { name: 'Pick a date' });
    await expect(getComputedStyle(bare.parentElement!).display).toBe('contents');
  },
};

// --- minDate / maxDate -------------------------------------------------------------------------
// Fixed dates so no test depends on today: the cases without `date` use bounds in 2000 and 2099.

const JAN = (day: number, hours = 0, minutes = 0) => new Date(2026, 0, day, hours, minutes);

async function openCalendar(canvasElement: HTMLElement) {
  await userEvent.click(within(canvasElement).getByRole('button'));
  return within(document.body).findByRole('dialog', { name: 'Choose date' });
}

const dayButton = (content: HTMLElement, name: RegExp) =>
  within(content).getByRole('button', { name });

const caption = (content: HTMLElement) =>
  within(content).getByRole('grid').getAttribute('aria-label');

// 12. Bounds inclusive: minDate and maxDate can be picked, the days outside them are disabled and
// a click on one does nothing.
export const MinAndMaxDate: Story = {
  args: { date: JAN(15), minDate: JAN(5), maxDate: JAN(25), onDateChange: fn() },
  play: async ({ canvasElement, args }) => {
    const content = await openCalendar(canvasElement);
    await expect(dayButton(content, /January 4th, 2026/)).toBeDisabled();
    await expect(dayButton(content, /January 5th, 2026/)).toBeEnabled();
    await expect(dayButton(content, /January 25th, 2026/)).toBeEnabled();
    await expect(dayButton(content, /January 26th, 2026/)).toBeDisabled();

    await userEvent.click(dayButton(content, /January 4th, 2026/), { pointerEventsCheck: 0 });
    await userEvent.click(dayButton(content, /January 26th, 2026/), { pointerEventsCheck: 0 });
    await expect(args.onDateChange).not.toHaveBeenCalled();

    await userEvent.click(dayButton(content, /January 5th, 2026/));
    // Calendar forwards DayPicker's onSelect, which also passes the trigger day, modifiers and event.
    await expect(args.onDateChange).toHaveBeenCalledWith(
      JAN(5),
      expect.anything(),
      expect.anything(),
      expect.anything(),
    );
    await userEvent.keyboard('{Escape}');
  },
};

// 13. The arrow keys never land on a disabled day: at the edge of the range the focus stays. Each
// check presses the opposite arrow next: from the bound it reaches the day inside the range, which
// it wouldn't if the focus had moved to the disabled day.
export const KeyboardSkipsDisabledDays: Story = {
  args: { date: JAN(15), minDate: JAN(5), maxDate: JAN(25) },
  play: async ({ canvasElement }) => {
    const content = await openCalendar(canvasElement);
    const expectFocus = (name: RegExp) =>
      waitFor(() => expect(dayButton(content, name)).toHaveFocus());

    dayButton(content, /January 5th, 2026/).focus();
    await userEvent.keyboard('{ArrowLeft}{ArrowRight}');
    await expectFocus(/January 6th, 2026/);

    dayButton(content, /January 5th, 2026/).focus();
    await userEvent.keyboard('{ArrowUp}{ArrowDown}');
    await expectFocus(/January 12th, 2026/);

    dayButton(content, /January 25th, 2026/).focus();
    await userEvent.keyboard('{ArrowRight}{ArrowLeft}');
    await expectFocus(/January 24th, 2026/);

    dayButton(content, /January 25th, 2026/).focus();
    await userEvent.keyboard('{ArrowDown}{ArrowUp}');
    await expectFocus(/January 18th, 2026/);
    await userEvent.keyboard('{Escape}');
  },
};

// 14. With a date, the calendar opens on its month, not on minDate (unlike DateRangePicker).
export const InitialMonthWithDate: Story = {
  args: { date: new Date(2026, 1, 10), minDate: JAN(5), maxDate: new Date(2026, 2, 31) },
  play: async ({ canvasElement }) => {
    const content = await openCalendar(canvasElement);
    await expect(caption(content)).toBe('February 2026');
  },
};

// 15. Without a date and with today before minDate, it opens on minDate's month.
export const InitialMonthTodayBeforeMin: Story = {
  args: { minDate: new Date(2099, 5, 15) },
  play: async ({ canvasElement }) => {
    const content = await openCalendar(canvasElement);
    await expect(caption(content)).toBe('June 2099');
    await expect(dayButton(content, /June 14th, 2099/)).toBeDisabled();
    await expect(dayButton(content, /June 15th, 2099/)).toBeEnabled();
  },
};

// 16. Without a date and with today after maxDate, it opens on maxDate's month.
export const InitialMonthTodayAfterMax: Story = {
  args: { maxDate: new Date(2000, 2, 15) },
  play: async ({ canvasElement }) => {
    const content = await openCalendar(canvasElement);
    await expect(caption(content)).toBe('March 2000');
    await expect(dayButton(content, /March 15th, 2000/)).toBeEnabled();
    await expect(dayButton(content, /March 16th, 2000/)).toBeDisabled();
  },
};

// 17. Compared by day: a minDate at 23:59 (e.g. "from tomorrow" built from a timestamp) still lets
// its own day be picked.
export const MinDateWithTime: Story = {
  args: {
    label: 'Fecha de salida',
    date: JAN(10),
    minDate: JAN(5, 23, 59),
    onDateChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const content = await openCalendar(canvasElement);
    await expect(dayButton(content, /January 4th, 2026/)).toBeDisabled();
    await expect(dayButton(content, /January 5th, 2026/)).toBeEnabled();
    await userEvent.click(dayButton(content, /January 5th, 2026/));
    // Calendar forwards DayPicker's onSelect, which also passes the trigger day, modifiers and event.
    await expect(args.onDateChange).toHaveBeenCalledWith(
      JAN(5),
      expect.anything(),
      expect.anything(),
      expect.anything(),
    );
    await userEvent.keyboard('{Escape}');
  },
};

// 18. A date out of range isn't corrected: the trigger shows it, the calendar opens on its month
// with it selected (and disabled), and onDateChange isn't called. The consumer flags it with error.
export const OutOfRangeDate: Story = {
  args: {
    date: new Date(2026, 2, 10),
    minDate: JAN(5),
    maxDate: JAN(25),
    error: 'La fecha debe ser entre el 5 y el 25 de enero',
    onDateChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'March 10th, 2026' });
    await expect(trigger).toHaveAttribute('aria-invalid', 'true');

    const content = await openCalendar(canvasElement);
    await expect(caption(content)).toBe('March 2026');
    const selected = dayButton(content, /March 10th, 2026, selected/);
    await expect(selected).toBeDisabled();
    await expect(args.onDateChange).not.toHaveBeenCalled();
    await expect(trigger).toHaveTextContent('March 10th, 2026');
    await userEvent.keyboard('{Escape}');
  },
};
