import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { InFrame } from '../../../.storybook/InFrame';
import { rootTokenIn } from '../../../.storybook/rootTheme';
import { styleIn } from '../../../.storybook/styleIn';
import { Breadcrumb, BreadcrumbItem } from './Breadcrumb';

const meta: Meta<typeof Breadcrumb> = {
  title: 'Components/Breadcrumb',
  component: Breadcrumb,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Breadcrumb>;

// Stands in for next/link and React Router's Link: a component of the consumer that receives
// href + props and renders an <a>.
const RouterLink = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }
>(({ to, children, ...props }, ref) => (
  <a ref={ref} href={to} data-router-link {...props}>
    {children}
  </a>
));
RouterLink.displayName = 'RouterLink';

// Destinos › Tipo › Destino, the hierarchy of a travel site.
const trail = (
  <Breadcrumb aria-label="Ruta">
    <BreadcrumbItem href="#destinos">Destinos</BreadcrumbItem>
    <BreadcrumbItem href="#playa">Playa</BreadcrumbItem>
    <BreadcrumbItem active>Cancún</BreadcrumbItem>
  </Breadcrumb>
);

const classesOf = (element: Element) => element.getAttribute('class')!.split(' ').filter(Boolean);
const rect = (element: Element) => element.getBoundingClientRect();

// 1. Structure: <nav> with its name, an <ol>, one <li> per item. Every item but the current one is
// a link; the current one is text with aria-current="page". The separators are decorative SVGs
// outside the links: not in any link's accessible name, not links themselves.
export const Default: Story = {
  render: () => trail,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nav = canvas.getByRole('navigation', { name: 'Ruta' });
    const list = nav.querySelector('ol')!;
    await expect(nav.children).toHaveLength(1);
    await expect(list.parentElement).toBe(nav);
    const items = within(list).getAllByRole('listitem');
    await expect(items).toHaveLength(3);

    // Exact names: the chevron adds nothing to them.
    const links = within(nav).getAllByRole('link');
    await expect(links.map((link) => link.getAttribute('href'))).toEqual(['#destinos', '#playa']);
    await expect(within(nav).getByRole('link', { name: 'Destinos' })).toBe(links[0]);
    await expect(within(nav).getByRole('link', { name: 'Playa' })).toBe(links[1]);

    const last = items[2];
    await expect(within(last).queryByRole('link')).toBeNull();
    const current = within(last).getByText('Cancún');
    await expect(current.tagName).toBe('SPAN');
    await expect(current).toHaveAttribute('aria-current', 'page');
    // active never reaches the DOM as an attribute.
    await expect(current.getAttributeNames().sort()).toEqual(['aria-current', 'class']);
    for (const link of links) {
      await expect(link.getAttributeNames().sort()).toEqual(['class', 'href']);
    }

    // One separator per item, first in the <li>, hidden from the accessibility tree and outside
    // the link; the first one is hidden with CSS from the <li>'s group (see SeparatorsLayout).
    for (const item of items) {
      const separator = item.firstElementChild!;
      await expect(separator.tagName.toLowerCase()).toBe('svg');
      await expect(separator).toHaveAttribute('aria-hidden', 'true');
      await expect(separator.closest('a')).toBeNull();
      await expect(classesOf(separator)).toEqual(
        expect.arrayContaining(['group-first/breadcrumb-item:hidden', 'rtl:rotate-180']),
      );
      await expect(classesOf(item)).toContain('group/breadcrumb-item');
    }
  },
};

// 2. asChild: the router's Link is the single <a> of each item, with the item's props and classes
// merged into it and the consumer's className kept.
export const AsChild: Story = {
  render: () => (
    <Breadcrumb aria-label="Ruta">
      <BreadcrumbItem asChild>
        <RouterLink to="#destinos" className="clase-del-consumidor">
          Destinos
        </RouterLink>
      </BreadcrumbItem>
      <BreadcrumbItem asChild title="Destinos de playa">
        <RouterLink to="#playa">Playa</RouterLink>
      </BreadcrumbItem>
      <BreadcrumbItem active>Cancún</BreadcrumbItem>
    </Breadcrumb>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const items = canvas.getAllByRole('listitem');
    for (const item of items.slice(0, 2)) {
      await expect(item.querySelectorAll('a')).toHaveLength(1);
    }
    const destinos = canvas.getByRole('link', { name: 'Destinos' });
    await expect(destinos).toHaveAttribute('data-router-link');
    await expect(destinos).toHaveAttribute('href', '#destinos');
    await expect(destinos.parentElement?.tagName).toBe('LI');
    await expect(classesOf(destinos)).toEqual(
      expect.arrayContaining([
        'clase-del-consumidor',
        'relative',
        'focus-visible:ring-primary',
        '[-webkit-tap-highlight-color:transparent]',
        'active:text-base-content',
      ]),
    );
    const playa = canvas.getByRole('link', { name: 'Playa' });
    await expect(playa).toHaveAttribute('data-router-link');
    await expect(playa).toHaveAttribute('title', 'Destinos de playa');
  },
};

// sRGB relative luminance and WCAG contrast ratio.
const channels = (hex: string) => {
  const value = hex.trim().replace('#', '');
  return [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16));
};
const luminance = (rgb: number[]) => {
  const [r, g, b] = rgb.map((c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: number[], b: number[]) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
// The links' color: base-content at 70% over the background.
const blend = (fg: number[], bg: number[], alpha: number) =>
  fg.map((c, i) => c * alpha + bg[i] * (1 - alpha));

// 3. Contrast: the links' text-base-content/70 (inherited from the list) reaches 4.5:1 over
// base-100 and base-200, in light and dark, whatever theme the toolbar has selected.
export const LinkContrast: Story = {
  render: () => trail,
  play: async ({ canvasElement }) => {
    const list = canvasElement.querySelector('ol')!;
    await expect(classesOf(list)).toContain('text-base-content/70');
    for (const theme of ['light', 'dark'] as const) {
      const text = channels(rootTokenIn(theme, '--base-content'));
      for (const background of ['--base-100', '--base-200']) {
        const bg = channels(rootTokenIn(theme, background));
        await expect(contrast(blend(text, bg, 0.7), bg)).toBeGreaterThanOrEqual(4.5);
      }
    }
  },
};

const longTrail = (
  <Breadcrumb aria-label="Ruta">
    <BreadcrumbItem href="#destinos">Destinos</BreadcrumbItem>
    <BreadcrumbItem href="#playa">Playas del Caribe mexicano</BreadcrumbItem>
    <BreadcrumbItem href="#riviera">Riviera Maya y alrededores</BreadcrumbItem>
    <BreadcrumbItem href="#hotel">
      Hotel todo incluido frente al mar en Playa del Carmen
    </BreadcrumbItem>
    {/* A label with no spaces wider than the row, like a booking code in an admin panel. */}
    <BreadcrumbItem active>RSV2026CANCUNTULUMBACALARHOLBOX0012345</BreadcrumbItem>
  </Breadcrumb>
);

// 4. Long labels at 320px, with the CSS applied: the trail wraps onto several lines without
// overflowing sideways (an item starts a new line, and a label wider than the row breaks inside
// its item), and the lines are 24px apart, what the hit areas add (12px + 12px), so
// they touch without overlapping. The first separator is hidden; the others show.
export const LongLabelsAt320: Story = {
  tags: ['real-css'],
  render: () => (
    <InFrame title="Móvil" width={320} height={320}>
      <div className="p-4">{longTrail}</div>
    </InFrame>
  ),
  play: async ({ canvasElement }) => {
    const frame = within(canvasElement).getByTitle('Móvil') as HTMLIFrameElement;
    await waitFor(() => expect(frame.contentDocument!.querySelector('ol')).not.toBeNull());
    const doc = frame.contentDocument!;
    const list = doc.querySelector('ol')!;

    await expect(doc.documentElement.scrollWidth).toBeLessThanOrEqual(320);
    await expect(list.scrollWidth).toBeLessThanOrEqual(list.clientWidth);
    const items = Array.from(list.querySelectorAll('li'));
    for (const item of items) {
      await expect(rect(item).right).toBeLessThanOrEqual(rect(list).right + 0.5);
    }
    // An item starts a new line: it begins to the left of the previous one. Different tops alone
    // would also pass without wrapping, with each item's text broken inside a narrow item.
    await expect(items.some((item, i) => i > 0 && rect(item).left < rect(items[i - 1]).left)).toBe(
      true,
    );
    const code = doc.querySelector('[aria-current="page"]')!;
    await expect(code.scrollWidth).toBeLessThanOrEqual(code.clientWidth);
    await expect(styleIn(list).rowGap).toBe('24px');

    const separators = items.map((item) => item.firstElementChild!);
    await expect(styleIn(separators[0]).display).toBe('none');
    for (const separator of separators.slice(1)) {
      await expect(styleIn(separator).display).not.toBe('none');
    }
  },
};

// 5. Touch target, with the CSS applied: each link answers 11px above and below its 20px line
// (44px in all), not beyond, through an ::after; its look doesn't change.
export const TouchTarget: Story = {
  tags: ['real-css'],
  render: () => <div className="p-8">{trail}</div>,
  play: async ({ canvasElement }) => {
    for (const link of within(canvasElement).getAllByRole('link')) {
      const box = rect(link);
      const x = box.left + box.width / 2;
      await expect(box.height).toBe(20);
      await expect(getComputedStyle(link, '::after').height).toBe('44px');
      await expect(document.elementFromPoint(x, box.top - 11)).toBe(link);
      await expect(document.elementFromPoint(x, box.bottom + 11)).toBe(link);
      await expect(document.elementFromPoint(x, box.top - 13)).not.toBe(link);
      await expect(document.elementFromPoint(x, box.bottom + 13)).not.toBe(link);
    }
  },
};

// 6. Visible focus by keyboard: Tab reaches the links (not the current item) and they show the
// primary ring, compared with a reference element.
export const FocusVisible: Story = {
  tags: ['real-css'],
  render: () => (
    <div className="flex flex-col gap-6 p-8">
      {trail}
      <div data-testid="reference" className="ring-2 ring-primary ring-offset-2" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const reference = getComputedStyle(canvas.getByTestId('reference')).boxShadow;
    const [destinos, playa] = canvas.getAllByRole('link');

    await userEvent.tab();
    await expect(destinos).toHaveFocus();
    await waitFor(() => expect(getComputedStyle(destinos).boxShadow).toBe(reference));
    await userEvent.tab();
    await expect(playa).toHaveFocus();
    await waitFor(() => expect(getComputedStyle(playa).boxShadow).toBe(reference));
    // The current item isn't a link: the focus leaves the trail.
    await userEvent.tab();
    await expect(canvasElement.querySelector('nav')!.contains(document.activeElement)).toBe(false);
  },
};
