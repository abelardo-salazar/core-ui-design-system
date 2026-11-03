import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';
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
