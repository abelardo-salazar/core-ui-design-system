import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FontBoldIcon, FontItalicIcon, StarIcon } from '@radix-ui/react-icons';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Toggle } from './Toggle';

const meta: Meta<typeof Toggle> = {
  title: 'Components/Toggle',
  component: Toggle,
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof Toggle>;

const classesOf = (element: Element | null) => element?.className.split(/\s+/) ?? [];
const onDisabledChange = fn();
const onFormSubmit = fn((event: React.FormEvent) => event.preventDefault());

// 1. Uncontrolled: aria-pressed follows each click and the keyboard. Outline unpressed and primary
// pressed. Neither size nor iconOnly reach the DOM.
export const Default: Story = {
  args: { children: 'Negrita', onPressedChange: fn() },
  play: async ({ canvasElement, args }) => {
    const toggle = within(canvasElement).getByRole('button', { name: 'Negrita' });
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect(toggle).toHaveAttribute('type', 'button');
    await expect(classesOf(toggle)).toContain('border-base-content/20');
    await expect(classesOf(toggle)).toContain('data-[state=on]:bg-primary');
    await expect(toggle).not.toHaveAttribute('size');
    await expect(toggle).not.toHaveAttribute('iconOnly');
    await expect(toggle).not.toHaveAttribute('icon');

    await userEvent.click(toggle);
    await expect(args.onPressedChange).toHaveBeenLastCalledWith(true);
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(toggle).toHaveAttribute('data-state', 'on');

    await userEvent.keyboard(' ');
    await expect(args.onPressedChange).toHaveBeenLastCalledWith(false);
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await userEvent.keyboard('{Enter}');
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  },
};

function ControlledDemo() {
  const [pressed, setPressed] = React.useState(true);
  return (
    <div className="flex items-center gap-3">
      <Toggle pressed={pressed} onPressedChange={setPressed}>
        Favorito
      </Toggle>
      <button type="button" onClick={() => setPressed(false)}>
        Quitar
      </button>
    </div>
  );
}

// 2. Controlled, and defaultPressed for the uncontrolled start.
export const Controlled: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-3">
      <ControlledDemo />
      <Toggle defaultPressed>Inicia activo</Toggle>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: 'Favorito' });
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(canvas.getByRole('button', { name: 'Quitar' }));
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(canvas.getByRole('button', { name: 'Inicia activo' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  },
};

// 3. Scale of each size in both branches: padding with text, square width with only an icon. Only
// sm carries the hit area.
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-6">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size} className="flex items-center gap-6">
          <Toggle size={size}>Texto {size}</Toggle>
          <Toggle size={size} icon={<StarIcon />} defaultPressed>
            Ícono {size}
          </Toggle>
          <Toggle size={size} icon={<StarIcon />} aria-label={`Solo ícono ${size}`} />
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const scale = {
      sm: { height: 'h-8', padding: 'px-3', width: 'w-8' },
      md: { height: 'h-11', padding: 'px-4', width: 'w-11' },
      lg: { height: 'h-12', padding: 'px-6', width: 'w-12' },
    };
    for (const [size, { height, padding, width }] of Object.entries(scale)) {
      const text = classesOf(canvas.getByRole('button', { name: `Texto ${size}` }));
      await expect(text).toContain(height);
      await expect(text).toContain(padding);
      await expect(text).not.toContain(width);

      const iconOnly = classesOf(canvas.getByRole('button', { name: `Solo ícono ${size}` }));
      await expect(iconOnly).toContain(height);
      await expect(iconOnly).toContain(width);
      await expect(iconOnly).not.toContain(padding);

      await expect(iconOnly.includes('after:min-w-11')).toBe(size === 'sm');
      await expect(text.includes('after:min-w-11')).toBe(size === 'sm');
    }
  },
};

// 4. The icon is decorative next to text; alone, the name comes from aria-label.
export const WithIcon: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Toggle icon={<FontBoldIcon />}>Negrita</Toggle>
      <Toggle icon={<FontItalicIcon />} aria-label="Cursiva" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const withText = canvas.getByRole('button', { name: 'Negrita' });
    await expect(withText.querySelector('svg')?.parentElement).toHaveAttribute(
      'aria-hidden',
      'true',
    );

    const iconOnly = canvas.getByRole('button', { name: 'Cursiva' });
    await expect(iconOnly).toHaveAttribute('aria-pressed', 'false');
    await expect(iconOnly.querySelector('svg')?.parentElement).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    await expect(iconOnly).not.toHaveAttribute('icon');
  },
};

// 5. Disabled: doesn't change, in either state.
export const Disabled: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Toggle disabled onPressedChange={onDisabledChange}>
        Apagado
      </Toggle>
      <Toggle disabled defaultPressed onPressedChange={onDisabledChange}>
        Encendido
      </Toggle>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const off = canvas.getByRole('button', { name: 'Apagado' });
    const on = canvas.getByRole('button', { name: 'Encendido' });
    await expect(off).toBeDisabled();
    await expect(classesOf(off)).toContain('disabled:cursor-not-allowed');
    await userEvent.click(off, { pointerEventsCheck: 0 });
    await userEvent.click(on, { pointerEventsCheck: 0 });
    await expect(onDisabledChange).not.toHaveBeenCalled();
    await expect(off).toHaveAttribute('aria-pressed', 'false');
    await expect(on).toHaveAttribute('aria-pressed', 'true');
  },
};

// 6. Inside a form, toggling doesn't submit it.
export const InForm: Story = {
  render: () => (
    <form onSubmit={onFormSubmit}>
      <Toggle>Dentro de un formulario</Toggle>
    </form>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Dentro de un formulario' }),
    );
    await expect(onFormSubmit).not.toHaveBeenCalled();
  },
};

// Needs applied CSS: the point lands on the control thanks to its ::after, not on its box.
const hits = (element: HTMLElement, x: number, y: number) => {
  const found = document.elementFromPoint(x, y);
  return found === element || element.contains(found);
};

// 7. sm responds in 44x44 around its 32x32 box; a sm wider than 44 extends only vertically, and md
// doesn't extend. Separated by 12px, the documented minimum, two sm don't step on each other.
export const SmHitArea: Story = {
  tags: ['real-css'],
  render: () => (
    <div className="flex flex-col items-start gap-12 p-8">
      <div className="flex items-center gap-3">
        <Toggle size="sm" icon={<FontBoldIcon />} aria-label="Primero" />
        <Toggle size="sm" icon={<FontItalicIcon />} aria-label="Segundo" />
      </div>
      <Toggle size="sm">Un texto bastante más ancho que 44px</Toggle>
      <Toggle size="md" icon={<StarIcon />} aria-label="Mediano" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = canvas.getByRole('button', { name: 'Primero' });
    const second = canvas.getByRole('button', { name: 'Segundo' });
    const box = first.getBoundingClientRect();
    const cx = box.left + box.width / 2;
    const cy = box.top + box.height / 2;
    await expect(box.width).toBe(32);
    await expect(box.height).toBe(32);

    // Inside the 44px square, outside the 32px box.
    await expect(hits(first, cx, cy - 21)).toBe(true);
    await expect(hits(first, cx, cy + 21)).toBe(true);
    await expect(hits(first, cx - 21, cy)).toBe(true);
    await expect(hits(first, cx + 21, cy)).toBe(true);
    // Beyond 44px.
    await expect(hits(first, cx, cy - 24)).toBe(false);
    await expect(hits(first, cx - 24, cy)).toBe(false);

    // With 12px between them, each one keeps its own side of the gap.
    const secondBox = second.getBoundingClientRect();
    const gapCenter = (box.right + secondBox.left) / 2;
    await expect(hits(first, gapCenter - 1, cy)).toBe(true);
    await expect(hits(second, gapCenter + 1, cy)).toBe(true);

    // Wide sm: extends vertically, not sideways.
    const wide = canvas.getByRole('button', { name: /bastante más ancho/ });
    const wideBox = wide.getBoundingClientRect();
    const wideCy = wideBox.top + wideBox.height / 2;
    const wideCx = wideBox.left + wideBox.width / 2;
    await expect(hits(wide, wideCx, wideCy - 21)).toBe(true);
    await expect(hits(wide, wideBox.left - 3, wideCy)).toBe(false);

    // md measures 44 by itself and doesn't extend.
    const md = canvas.getByRole('button', { name: 'Mediano' });
    const mdBox = md.getBoundingClientRect();
    await expect(mdBox.height).toBe(44);
    await expect(mdBox.width).toBe(44);
    await expect(hits(md, mdBox.left + 22, mdBox.top - 2)).toBe(false);
  },
};
