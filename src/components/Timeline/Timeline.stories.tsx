import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { Timeline, TimelineGroup, TimelineItem } from './Timeline';

const meta: Meta<typeof Timeline> = {
  title: 'Components/Timeline',
  component: Timeline,
  parameters: { layout: 'centered' },
  render: () => (
    <div className="w-80">
      <Timeline aria-label="Estado del pedido">
        <TimelineItem time="09:30" dateTime="2026-11-07T09:30">
          Pedido recibido
        </TimelineItem>
        <TimelineItem time="11:05" dateTime="2026-11-07T11:05">
          En preparación
        </TimelineItem>
        <TimelineItem>
          Entregado al repartidor, con una descripción más larga que ocupa dos líneas
        </TimelineItem>
      </Timeline>
    </div>
  ),
};

export default meta;
type Story = StoryObj<typeof Timeline>;

const classesOf = (element: Element) => element.className.split(/\s+/);

// 1. An ordered list of items. The markers are hidden from assistive tech. time renders a <time>
// with dateTime and tabular figures; without time there is no time element.
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole('list', { name: 'Estado del pedido' });
    await expect(list.tagName).toBe('OL');
    const items = within(list).getAllByRole('listitem');
    await expect(items).toHaveLength(3);

    for (const item of items) {
      const marker = item.firstElementChild!;
      await expect(marker).toHaveAttribute('aria-hidden', 'true');
      await expect(classesOf(marker.lastElementChild!)).toContain(
        'group-last/timeline-item:hidden',
      );
    }

    const time = canvas.getByText('09:30');
    await expect(time.tagName).toBe('TIME');
    await expect(time).toHaveAttribute('datetime', '2026-11-07T09:30');
    await expect(classesOf(time)).toContain('tabular-nums');
    await expect(items[2].querySelector('time')).toBeNull();
    await expect(items[2]).toHaveTextContent(/^Entregado al repartidor/);
  },
};

// 2. Without dateTime, time is plain text in a span, with the same look.
export const TimeWithoutDateTime: Story = {
  render: () => (
    <Timeline>
      <TimelineItem time="Día 1">Llegada</TimelineItem>
    </Timeline>
  ),
  play: async ({ canvasElement }) => {
    const time = within(canvasElement).getByText('Día 1');
    await expect(time.tagName).toBe('SPAN');
    await expect(time).not.toHaveAttribute('datetime');
    await expect(classesOf(time)).toContain('tabular-nums');
  },
};

const itinerary = (headingLevel?: 2 | 3 | 4 | 5 | 6) => (
  <div className="w-80">
    <Timeline>
      <TimelineGroup title="Sábado 7" headingLevel={headingLevel}>
        <TimelineItem time="08:00">Desayuno</TimelineItem>
        <TimelineItem time="10:00">Museo</TimelineItem>
      </TimelineGroup>
      <TimelineGroup title="Domingo 8" headingLevel={headingLevel}>
        <TimelineItem time="09:00">Mercado</TimelineItem>
      </TimelineGroup>
    </Timeline>
  </div>
);

// 3. A group is an <li> with its heading (h3 by default) and a nested <ol> of items.
export const Groups: Story = {
  render: () => itinerary(),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const heading = canvas.getByRole('heading', { name: 'Sábado 7', level: 3 });
    const group = heading.parentElement!;
    await expect(group.tagName).toBe('LI');
    await expect(group.parentElement!.tagName).toBe('OL');
    const nested = group.querySelector(':scope > ol')!;
    await expect(within(nested as HTMLElement).getAllByRole('listitem')).toHaveLength(2);
    await expect(canvas.getAllByRole('heading')).toHaveLength(2);
  },
};

// 4. headingLevel fits the page outline.
export const HeadingLevel: Story = {
  render: () => itinerary(2),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { name: 'Sábado 7', level: 2 })).toBeVisible();
    await expect(canvas.queryByRole('heading', { level: 3 })).toBeNull();
  },
};

const rect = (element: Element) => element.getBoundingClientRect();

// 5. With the real CSS: the line joins each marker with the next one and the last item of each
// list has none, so it breaks between groups. Time sits at the end of the row; without it, the
// text takes the whole width.
export const LineLayout: Story = {
  tags: ['real-css'],
  render: () => (
    <div className="w-80">
      <Timeline>
        <TimelineItem time="09:30">Pedido recibido</TimelineItem>
        <TimelineItem>Entregado</TimelineItem>
      </Timeline>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const items = within(canvasElement).getAllByRole('listitem');
    const line = (item: Element) => item.firstElementChild!.lastElementChild!;
    await expect(getComputedStyle(line(items[0])).display).not.toBe('none');
    await expect(getComputedStyle(line(items[1])).display).toBe('none');
    // The line ends where the next item starts; the next dot is 4px below.
    await expect(rect(line(items[0])).bottom).toBe(rect(items[1]).top);
    const nextDot = items[1].firstElementChild!.firstElementChild!;
    await expect(rect(nextDot).top - rect(items[1]).top).toBe(4);

    const content = (item: Element) => item.lastElementChild!;
    const time = within(items[0]).getByText('09:30');
    await expect(rect(time).right).toBe(rect(content(items[0])).right);
    const text = content(items[1]).firstElementChild!;
    await expect(rect(text).width).toBe(rect(content(items[1])).width);
    // Same marker column in both, so the line stays straight.
    await expect(rect(items[0].firstElementChild!).left).toBe(
      rect(items[1].firstElementChild!).left,
    );
  },
};
