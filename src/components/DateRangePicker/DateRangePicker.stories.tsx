import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { es } from 'date-fns/locale';
import { DateRangePicker, type DateRange, type DateRangePickerProps } from './DateRangePicker';

// Fixed dates (January 2026) so no test depends on today. minDate opens the calendar there.
const JAN = (day: number) => new Date(2026, 0, day);

// Controlled, as in an app.
function Controlled(props: DateRangePickerProps) {
  const [range, setRange] = React.useState<DateRange | undefined>(props.range);
  return (
    <DateRangePicker
      {...props}
      range={range}
      onRangeChange={(next) => {
        setRange(next);
        props.onRangeChange?.(next);
      }}
    />
  );
}

const meta: Meta<typeof DateRangePicker> = {
  title: 'Components/DateRangePicker',
  component: DateRangePicker,
  parameters: { layout: 'centered' },
  args: { minDate: JAN(5), maxDate: JAN(25), onRangeChange: fn() },
  render: (args) => <Controlled {...args} />,
};

export default meta;
type Story = StoryObj<typeof DateRangePicker>;

const body = within(document.body);
const openCalendar = async (canvasElement: HTMLElement) => {
  await userEvent.click(within(canvasElement).getByRole('button'));
  return body.findByRole('dialog', { name: 'Choose dates' });
};
const day = (content: HTMLElement, name: RegExp) => within(content).getByRole('button', { name });

// 1. With the keyboard: Enter on a day is the start, the arrows move, Enter again is the end. The
// popover closes with the complete range, the trigger shows both dates and gets the focus back.
export const Keyboard: Story = {
  play: async ({ canvasElement, args }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'Pick dates' });
    trigger.focus();
    await userEvent.keyboard('{Enter}');
    const content = await body.findByRole('dialog', { name: 'Choose dates' });

    day(content, /January 12th, 2026/).focus();
    await userEvent.keyboard('{Enter}');
    // Only the start: the popover stays open and nothing reaches the consumer yet.
    await expect(body.getByRole('dialog')).toBeInTheDocument();
    await expect(args.onRangeChange).not.toHaveBeenCalled();

    await userEvent.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}');
    await waitFor(() => expect(day(content, /January 15th, 2026/)).toHaveFocus());
    await userEvent.keyboard('{Enter}');

    await waitFor(() => expect(body.queryByRole('dialog')).toBeNull());
    await expect(args.onRangeChange).toHaveBeenCalledWith({ from: JAN(12), to: JAN(15) });
    await expect(trigger).toHaveTextContent('Jan 12, 2026 – Jan 15, 2026');
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

// 2. A second pick before the start becomes the start (DayPicker keeps to ≥ from), and the same
// day twice is a one-day range.
export const OrderAndOneDay: Story = {
  play: async ({ canvasElement, args }) => {
    let content = await openCalendar(canvasElement);
    await userEvent.click(day(content, /January 15th, 2026/));
    await userEvent.click(day(content, /January 12th, 2026/));
    await waitFor(() => expect(body.queryByRole('dialog')).toBeNull());
    await expect(args.onRangeChange).toHaveBeenLastCalledWith({ from: JAN(12), to: JAN(15) });

    // A new opening starts a new range, even with one already chosen.
    content = await openCalendar(canvasElement);
    await userEvent.click(day(content, /January 20th, 2026/));
    await userEvent.click(day(content, /January 20th, 2026/));
    await waitFor(() => expect(body.queryByRole('dialog')).toBeNull());
    await expect(args.onRangeChange).toHaveBeenLastCalledWith({ from: JAN(20), to: JAN(20) });
  },
};

// 3. minDate and maxDate disable the days outside them; a click on one does nothing.
export const MinAndMaxDate: Story = {
  play: async ({ canvasElement, args }) => {
    const content = await openCalendar(canvasElement);
    await expect(day(content, /January 4th, 2026/)).toBeDisabled();
    await expect(day(content, /January 5th, 2026/)).toBeEnabled();
    await expect(day(content, /January 25th, 2026/)).toBeEnabled();
    await expect(day(content, /January 26th, 2026/)).toBeDisabled();

    await userEvent.click(day(content, /January 4th, 2026/), { pointerEventsCheck: 0 });
    await userEvent.click(day(content, /January 26th, 2026/), { pointerEventsCheck: 0 });
    await expect(body.getByRole('dialog')).toBeInTheDocument();
    await expect(args.onRangeChange).not.toHaveBeenCalled();
    await userEvent.keyboard('{Escape}');
  },
};

// 4. Closing halfway keeps the previous range: the consumer never gets a range with no end.
export const CloseHalfway: Story = {
  args: { range: { from: JAN(6), to: JAN(8) } },
  play: async ({ canvasElement, args }) => {
    const trigger = within(canvasElement).getByRole('button');
    await expect(trigger).toHaveTextContent('Jan 6, 2026 – Jan 8, 2026');
    const content = await openCalendar(canvasElement);
    await userEvent.click(day(content, /January 20th, 2026/));
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('dialog')).toBeNull());
    await expect(args.onRangeChange).not.toHaveBeenCalled();
    await expect(trigger).toHaveTextContent('Jan 6, 2026 – Jan 8, 2026');
  },
};

// 5. The locale formats both dates of the trigger.
export const SpanishLocale: Story = {
  args: { locale: es, range: { from: JAN(12), to: JAN(15) }, placeholder: 'Elegir fechas' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('button')).toHaveTextContent(
      '12 ene 2026 – 15 ene 2026',
    );
  },
};

// 6. Same field as DatePicker: the label names the trigger with its text, and the error sets
// aria-invalid and aria-describedby and takes the place of helperText.
export const WithError: Story = {
  args: {
    label: 'Fechas del viaje',
    error: 'Elige las fechas',
    helperText: 'Hasta 20 noches',
    range: { from: JAN(12), to: JAN(15) },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', {
      name: 'Fechas del viaje Jan 12, 2026 – Jan 15, 2026',
    });
    await expect(trigger).toHaveAttribute('aria-invalid', 'true');
    await expect(trigger).toHaveAccessibleDescription('Elige las fechas');
    await expect(canvas.queryByText('Hasta 20 noches')).toBeNull();
    await expect(canvas.getByText('Fechas del viaje')).toHaveClass('text-error-focus');
    await expect(trigger.className.split(/\s+/)).toEqual(
      expect.arrayContaining([
        'aria-[invalid=true]:border-error',
        'aria-[invalid=true]:focus-visible:ring-error',
      ]),
    );
  },
};

// 7. Without label, error or helperText: the trigger, named by its text, in a display: contents
// wrapper.
export const WithoutField: Story = {
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'Pick dates' });
    await expect(trigger.parentElement!.className).toBe('contents');
    await expect(trigger.parentElement!.parentElement).toBe(canvasElement);
    await expect(trigger).not.toHaveAttribute('aria-describedby');
  },
};
