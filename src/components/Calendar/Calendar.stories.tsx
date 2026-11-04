import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import type { DayButtonProps } from '@daypicker/react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Button } from '../Button';
import { Popover, PopoverContent, PopoverTrigger } from '../Popover';
import { Calendar } from './Calendar';

const meta: Meta<typeof Calendar> = {
  title: 'Components/Calendar',
  component: Calendar,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Calendar>;

// 1. Default
export const Default: Story = {
  args: {
    mode: 'single',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Weekday header present (grid rendered).
    await expect(canvas.getByText('Mo')).toBeInTheDocument();

    const nextButton = canvas.getByRole('button', { name: 'Go to the Next Month' });
    const previousButton = canvas.getByRole('button', { name: 'Go to the Previous Month' });

    // The "next" button must use the same style as the DS's Button (outline).
    await expect(nextButton.className.split(' ')).toContain('border-base-300');

    // CaptionLabel renders with role="status" ("Month Year" format, locale-agnostic).
    const caption = canvas.getByRole('status');
    const captionBefore = caption.textContent;

    await userEvent.click(nextButton);
    await expect(caption.textContent).not.toBe(captionBefore);

    await userEvent.click(previousButton);
    await expect(caption.textContent).toBe(captionBefore);
  },
};

// 2. Touch target: the arrows extend their hit area to 44x44 with an ::after and keep their
// 28x28 size; the days stay at 36px with no ::after, the documented exception for contiguous
// grids. This project doesn't apply Tailwind, so the assertions are on classes.
export const TouchTargets: Story = {
  args: {
    mode: 'single',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    for (const name of ['Go to the Previous Month', 'Go to the Next Month']) {
      const classes = canvas.getByRole('button', { name }).className.split(' ');
      await expect(classes).toContain('relative');
      await expect(classes).toContain("after:content-['']");
      await expect(classes).toContain('after:absolute');
      await expect(classes).toContain('after:rounded-btn');
      await expect(classes).toContain('after:-inset-[9px]');
      await expect(classes).toContain('h-7');
      await expect(classes).toContain('w-7');
    }

    const day = canvas.getAllByRole('gridcell')[0].querySelector('button');
    await expect(day?.className.split(' ')).toContain('h-9');
    await expect(day?.className.split(' ')).toContain('w-9');
    await expect(day?.className).not.toContain('after:');
  },
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- `day` and `modifiers` must be destructured out so they aren't spread onto the DOM button
function CustomDayButton({ day, modifiers, ...props }: DayButtonProps) {
  return <button data-testid="custom-day" {...props} />;
}

// 3. Custom components: the consumer's `components` are merged key by key with the DS's, the
// same criterion as classNames. Passing only DayButton replaces the days and keeps the DS's
// arrows, with their 44px hit area, and its Chevron.
export const CustomComponentsMerge: Story = {
  args: {
    mode: 'single',
    components: { DayButton: CustomDayButton },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getAllByTestId('custom-day').length).toBeGreaterThan(0);

    for (const name of ['Go to the Previous Month', 'Go to the Next Month']) {
      const arrow = canvas.getByRole('button', { name });
      await expect(arrow.className.split(' ')).toContain('after:-inset-[9px]');
      // CalendarChevron: DayPicker's default Chevron has no h-4 class.
      await expect(arrow.querySelector('svg')).toHaveClass('h-4', 'w-4');
    }
  },
};

// Fixed month: the tests look days up by date.
const month = new Date(2026, 10, 1);

const classesOf = (element: Element | null) => element?.className.split(/\s+/) ?? [];
const dayLabel = /November 12th, 2026/;

// Bookings per day of the month, for the content and for its text equivalent.
const bookings: Record<number, number> = { 12: 3, 20: 1 };
const renderBookings = (date: Date) => {
  const count = date.getMonth() === 10 ? bookings[date.getDate()] : undefined;
  return count ? `${count} res.` : null;
};

const renderDayContentSpy = fn(renderBookings);

// 4. The default keeps 36px and renders the same day button as always. Each size also sets the
// width of the weekdays.
export const SizeClasses: Story = {
  args: { mode: 'single', defaultMonth: month },
  render: (args) => (
    <div className="flex flex-col gap-4">
      <Calendar {...args} />
      <Calendar {...args} size="md" />
      <Calendar {...args} size="lg" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const grids = within(canvasElement).getAllByRole('grid');
    const expected = [
      ['h-9', 'w-9'],
      ['h-11', 'w-11'],
      ['h-14', 'w-14'],
    ];
    for (const [index, [height, width]] of expected.entries()) {
      const grid = within(grids[index]);
      const day = classesOf(grid.getByRole('button', { name: dayLabel }));
      await expect(day).toContain(height);
      await expect(day).toContain(width);
      await expect(day).not.toContain('flex-col');
      // DayPicker hides the weekday row from assistive technology, so it has no role to query.
      await expect(classesOf(grids[index].querySelector('th'))).toContain(width);
    }
    // The number is the only content of the default button.
    const defaultDay = within(grids[0]).getByRole('button', { name: dayLabel });
    await expect(defaultDay.childElementCount).toBe(0);
    await expect(defaultDay).toHaveTextContent(/^12$/);
    await expect(defaultDay).not.toHaveAttribute('size');
  },
};

// 5. Content under the number. Its callback gets the date and the modifiers; days without content
// add nothing. Without labelDayButton the name stays the date, so it doesn't reach assistive
// technology.
export const DayContent: Story = {
  args: { mode: 'single', defaultMonth: month, size: 'lg', renderDayContent: renderDayContentSpy },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const day = canvas.getByRole('button', { name: dayLabel });
    await expect(day).toHaveTextContent('123 res.');
    await expect(day.querySelector('span')).toHaveTextContent('3 res.');
    await expect(classesOf(day)).toContain('flex-col');

    const empty = canvas.getByRole('button', { name: /November 13th, 2026/ });
    await expect(empty).toHaveTextContent(/^13$/);
    await expect(empty.querySelector('span')).toBeNull();
    // Same alignment with or without content.
    await expect(classesOf(empty)).toContain('justify-start');

    const call = renderDayContentSpy.mock.calls.find(
      ([date]) => date.getTime() === new Date(2026, 10, 12).getTime(),
    );
    await expect(call).toBeDefined();
    await expect(renderDayContentSpy.mock.calls[0]).toHaveLength(2);
    await expect(renderDayContentSpy.mock.calls[0][1]).toHaveProperty('outside');

    // A day's content still selects it, once.
    await userEvent.click(canvas.getByText('3 res.'));
    await expect(
      canvas.getByRole('button', { name: /November 12th, 2026, selected/ }),
    ).toBeVisible();
  },
};

// 6. labels.labelDayButton is the text equivalent of the content, and modifiers carry today and
// selected, which the default label includes.
export const TextEquivalent: Story = {
  args: {
    mode: 'single',
    defaultMonth: month,
    size: 'lg',
    renderDayContent: renderBookings,
    labels: {
      labelDayButton: (date, modifiers) => {
        const label = date.toLocaleDateString('es', { dateStyle: 'full' });
        const count = date.getMonth() === 10 ? bookings[date.getDate()] : undefined;
        return [label, count && `${count} reservas`, modifiers.selected && 'seleccionado']
          .filter(Boolean)
          .join(', ');
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const day = canvas.getByRole('button', { name: /12 de noviembre de 2026, 3 reservas$/ });
    await userEvent.click(day);
    await expect(
      canvas.getByRole('button', { name: /12 de noviembre de 2026, 3 reservas, seleccionado$/ }),
    ).toBeVisible();
    await expect(canvas.getByRole('button', { name: /13 de noviembre de 2026$/ })).toBeVisible();
  },
};

// Layout values and not getBoundingClientRect: the popover's opening animation scales the rect.
const hasContiguousCells = (grid: HTMLElement, size: number) => {
  const buttons = within(grid).getAllByRole('button');
  const [first, second] = buttons.map((button) => button.closest('td') as HTMLElement);
  return (
    buttons[0].offsetWidth === size &&
    buttons[0].offsetHeight === size &&
    second.offsetLeft - first.offsetLeft === size &&
    (grid.querySelector('tbody tr') as HTMLElement).offsetHeight === size
  );
};

// 7. With CSS applied: real size, no gaps between the cells of a row, same with content, and the
// documented widths including the padding.
export const RealSizes: Story = {
  tags: ['real-css'],
  args: { mode: 'single', defaultMonth: month },
  render: (args) => (
    <div className="flex flex-col items-start gap-4">
      <Calendar {...args} />
      <Calendar {...args} size="md" />
      <Calendar {...args} size="lg" />
      <Calendar {...args} size="lg" renderDayContent={renderBookings} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const grids = within(canvasElement).getAllByRole('grid');
    const sizes = [36, 44, 56, 56];
    const widths = [276, 332, 416, 416];
    for (const [index, size] of sizes.entries()) {
      await expect(hasContiguousCells(grids[index], size)).toBe(true);
      const root = grids[index].closest<HTMLElement>('.rdp-root');
      await expect(root?.offsetWidth).toBe(widths[index]);
    }
  },
};

function PopoverDemo({ size }: { size: 'md' | 'lg' }) {
  const [date, setDate] = React.useState<Date>();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Abrir {size}</Button>
      </PopoverTrigger>
      {/* Same composition as DatePicker. */}
      <PopoverContent className="w-auto p-0" align="start" aria-label={`Calendario ${size}`}>
        <Calendar
          mode="single"
          size={size}
          selected={date}
          onSelect={setDate}
          defaultMonth={month}
        />
      </PopoverContent>
    </Popover>
  );
}

// 8. The popover of DatePicker fits the larger grids: it grows with its content, without
// overflowing it.
export const InPopover: Story = {
  tags: ['real-css'],
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex gap-4">
      <PopoverDemo size="md" />
      <PopoverDemo size="lg" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    for (const [size, width] of [
      ['md', 332],
      ['lg', 416],
    ] as const) {
      await userEvent.click(body.getByRole('button', { name: `Abrir ${size}` }));
      const dialog = await body.findByRole('dialog', { name: `Calendario ${size}` });
      const grid = within(dialog).getByRole('grid');
      await expect(hasContiguousCells(grid, size === 'md' ? 44 : 56)).toBe(true);
      // The border of the popover adds 2px around the calendar.
      await expect(dialog.offsetWidth).toBe(width + 2);
      await expect(dialog.scrollWidth).toBeLessThanOrEqual(dialog.clientWidth);
      await userEvent.keyboard('{Escape}');
    }
  },
};
