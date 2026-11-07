import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, spyOn, userEvent, waitFor, within } from 'storybook/test';
import { ScrollRow, ScrollRowItem } from './ScrollRow';

const cards = (count = 8) =>
  Array.from({ length: count }, (_, index) => (
    <ScrollRowItem key={index} className="w-40">
      <button
        type="button"
        className="flex h-24 w-full items-center justify-center rounded-box border border-base-300 bg-base-200 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        Receta {index + 1}
      </button>
    </ScrollRowItem>
  ));

const meta: Meta<typeof ScrollRow> = {
  title: 'Components/ScrollRow',
  component: ScrollRow,
  parameters: { layout: 'centered' },
  args: { 'aria-label': 'Recetas recientes' },
  render: (args) => (
    <div className="w-96">
      <ScrollRow {...args}>{cards()}</ScrollRow>
    </div>
  ),
};

export default meta;
type Story = StoryObj<typeof ScrollRow>;

const classesOf = (element: Element) => element.className.split(/\s+/);
const rect = (element: Element) => element.getBoundingClientRect();
const style = (element: Element) => getComputedStyle(element);

// 1. A named region with a list; the items are its <li>. Snap, the padding that keeps the focus
// ring from being clipped, and the scrollbar hidden only with a coarse pointer. No buttons
// without controls.
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const region = canvas.getByRole('region', { name: 'Recetas recientes' });
    await expect(region).not.toHaveAttribute('tabindex');
    const list = within(region).getByRole('list');
    await expect(within(list).getAllByRole('listitem')).toHaveLength(8);
    await expect(classesOf(list)).toEqual(
      expect.arrayContaining([
        'overflow-x-auto',
        'snap-x',
        'snap-mandatory',
        'p-1',
        'scroll-px-1',
        'pointer-coarse:[scrollbar-width:none]',
      ]),
    );
    await expect(classesOf(list)).not.toContain('[scrollbar-width:none]');
    await expect(classesOf(canvas.getAllByRole('listitem')[0])).toEqual(
      expect.arrayContaining(['shrink-0', 'snap-start', 'w-40']),
    );
    await expect(canvas.queryByRole('button', { name: /items/ })).toBeNull();
  },
};

// 2. Custom texts, and with reduced motion the buttons scroll without animation. Real CSS: the
// button only exists when the items overflow.
export const ReducedMotion: Story = {
  tags: ['real-css'],
  args: { controls: true, labels: { next: 'Ver más recetas' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const scrollBy = spyOn(Element.prototype, 'scrollBy').mockImplementation(() => {});
    const matchMedia = spyOn(window, 'matchMedia').mockImplementation(
      (query: string) =>
        ({ matches: query.includes('prefers-reduced-motion'), media: query }) as MediaQueryList,
    );
    try {
      const next = await canvas.findByRole('button', { name: 'Ver más recetas' });
      await expect(classesOf(next)).toEqual(
        expect.arrayContaining(['hidden', 'pointer-fine:inline-flex', 'h-11', 'w-11']),
      );
      await userEvent.click(next);
      await expect(scrollBy).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'auto' }));

      matchMedia.mockImplementation(
        (query: string) => ({ matches: false, media: query }) as MediaQueryList,
      );
      await userEvent.click(next);
      await expect(scrollBy).toHaveBeenLastCalledWith(
        expect.objectContaining({ behavior: 'smooth' }),
      );
    } finally {
      scrollBy.mockRestore();
      matchMedia.mockRestore();
    }
  },
};

// 3. With the real CSS: the snap aligns an item's start, the focus ring of the first item isn't
// clipped, and Tab brings a hidden item into view. With a fine pointer, the scrollbar shows.
export const SnapLayout: Story = {
  tags: ['real-css'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole('list');
    const items = canvas.getAllByRole('listitem');
    await expect(style(list).scrollSnapType).toBe('x mandatory');
    await expect(style(items[0]).scrollSnapAlign).toBe('start');
    await expect(style(list).scrollbarWidth).toBe('auto');
    await expect(list.scrollWidth).toBeGreaterThan(list.clientWidth);

    // 4px of padding around the items: the ring (2px + 2px of offset) fits inside the list.
    const first = within(items[0]).getByRole('button');
    await expect(rect(first).left - rect(list).left).toBe(4);
    await expect(rect(first).top - rect(list).top).toBe(4);

    // A scroll that stops between two items ends on an item's start.
    list.scrollTo({ left: 100, behavior: 'auto' });
    await waitFor(() => {
      const aligned = items.some((item) => Math.abs(rect(item).left - rect(list).left - 4) < 1);
      expect(aligned).toBe(true);
    });

    list.scrollTo({ left: 0, behavior: 'auto' });
    await waitFor(() => expect(list.scrollLeft).toBe(0));
    for (let i = 0; i < 4; i++) await userEvent.tab();
    await expect(within(items[3]).getByRole('button')).toHaveFocus();
    await expect(list.scrollLeft).toBeGreaterThan(0);
  },
};

// 4. With the real CSS: the buttons are 44px and show only away from their end. Each scrolls one
// visible width. When the focused one disappears at an end, the focus goes to the other.
export const ControlsLayout: Story = {
  tags: ['real-css'],
  args: { controls: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole('list');
    const next = await canvas.findByRole('button', { name: 'Next items' });
    await expect(canvas.queryByRole('button', { name: 'Previous items' })).toBeNull();
    await expect(rect(next).width).toBe(44);
    await expect(rect(next).height).toBe(44);
    // Shown with a fine pointer (absolute blockifies inline-flex into flex).
    await expect(style(next).display).toBe('flex');

    await userEvent.click(next);
    await waitFor(() => expect(list.scrollLeft).toBeGreaterThan(list.clientWidth / 2));
    const previous = await canvas.findByRole('button', { name: 'Previous items' });

    // Forward to the end: "next" disappears and its focus goes to "previous".
    while (canvas.queryByRole('button', { name: 'Next items' })) {
      const before = list.scrollLeft;
      await userEvent.click(canvas.getByRole('button', { name: 'Next items' }));
      await waitFor(() => expect(list.scrollLeft).not.toBe(before));
    }
    await expect(list.scrollLeft + list.clientWidth).toBeGreaterThanOrEqual(list.scrollWidth - 1);
    await waitFor(() => expect(previous).toHaveFocus());

    // Back to the start: "previous" disappears and its focus goes to "next".
    while (canvas.queryByRole('button', { name: 'Previous items' })) {
      const before = list.scrollLeft;
      await userEvent.click(canvas.getByRole('button', { name: 'Previous items' }));
      await waitFor(() => expect(list.scrollLeft).not.toBe(before));
    }
    // The button goes within the 1px of slack; the smooth scroll still ends at 0.
    await waitFor(() => expect(list.scrollLeft).toBe(0));
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Next items' })).toHaveFocus());
  },
};

function Shrinking() {
  const [count, setCount] = React.useState(8);
  return (
    <div className="w-96">
      <button type="button" onClick={() => setCount(2)}>
        Quitar recetas
      </button>
      <ScrollRow aria-label="Recetas recientes" controls>
        {cards(count)}
      </ScrollRow>
    </div>
  );
}

// 5. With the real CSS: if the items come to fit while a button has the focus, both buttons go
// and the focus goes to the region, not to the body.
export const FocusFallbackLayout: Story = {
  tags: ['real-css'],
  render: () => <Shrinking />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const next = await canvas.findByRole('button', { name: 'Next items' });
    next.focus();
    // click() without userEvent: it doesn't move the focus off the button.
    canvas.getByRole('button', { name: 'Quitar recetas' }).click();
    await waitFor(() => expect(canvas.queryByRole('button', { name: 'Next items' })).toBeNull());
    await expect(canvas.getByRole('region', { name: 'Recetas recientes' })).toHaveFocus();
  },
};
