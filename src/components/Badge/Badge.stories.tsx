import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

// 1. Default
export const Default: Story = {
  args: {
    children: 'Default',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('Default');
    await expect(badge.tagName).toBe('DIV');
    await expect(badge.className.split(' ')).toContain('bg-primary');
    await expect(badge.className.split(' ')).toContain('text-primary-content');

    // sm (default): px-2.5 py-0.5 text-xs — ver story Sizes para las cuatro escalas y las
    // alturas reales medidas en navegador.
    await expect(badge.className.split(' ')).toContain('px-2.5');
    await expect(badge.className.split(' ')).toContain('py-0.5');
  },
};

// 2. Secondary
export const Secondary: Story = {
  args: {
    children: 'Secondary',
    variant: 'secondary',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('Secondary');
    await expect(badge.className.split(' ')).toContain('bg-secondary');
    await expect(badge.className.split(' ')).toContain('text-secondary-content');
  },
};

// 3. Outline
export const Outline: Story = {
  args: {
    children: 'Outline',
    variant: 'outline',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('Outline');
    await expect(badge.className.split(' ')).toContain('text-base-content');
    await expect(badge.className.split(' ')).toContain('border-base-content/20');
  },
};

// 4. Destructive — interactive: true para poder verificar el hover real (compoundVariants
// solo agrega esas clases cuando interactive=true; sin esto el badge no tiene hover alguno).
export const Destructive: Story = {
  args: {
    children: 'Destructive',
    variant: 'destructive',
    interactive: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('Destructive');

    await expect(badge.className.split(' ')).toContain('text-error-content');
    await expect(
      getComputedStyle(document.documentElement).getPropertyValue('--error-content'),
    ).toBe('#000000');

    // Hover: mismo token que Button destructive (ver Button.stories.tsx) — --error-focus
    // (fondo) es oscuro mientras --error (fondo base) es claro, así que el texto necesita
    // su propio -focus-content en hover, distinto del -content del estado base. Vive en
    // compoundVariants ({variant: 'destructive', interactive: true}), no en la variante de
    // color sola — un Badge no-interactivo nunca debe mostrar hover.
    await expect(badge.className.split(' ')).toContain('hover:bg-error-focus');
    await expect(badge.className.split(' ')).toContain('hover:text-error-focus-content');
    await expect(
      getComputedStyle(document.documentElement).getPropertyValue('--error-focus-content'),
    ).toBe('#ffffff');

    // Dark mode invierte cuál color necesita más contraste.
    document.documentElement.classList.add('dark');
    await expect(
      getComputedStyle(document.documentElement).getPropertyValue('--error-focus-content'),
    ).toBe('#000000');
    document.documentElement.classList.remove('dark');
  },
};

// 5. Sizes — escala propia de Badge (no la de Button): compacta, pensada para una etiqueta de
// estado, no un control. El fixture de vitest-browser no aplica utilidades de Tailwind ni hace
// layout real (no se puede medir alto/ancho acá), así que esto verifica las clases; las alturas
// reales (sm ≈ 22px, md ≈ 26px, lg ≈ 30px, icon = 24px exactos) se verificaron a mano en
// Storybook con un navegador real, con A/B contra el default anterior (32px, ver CHANGELOG).
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Badge size="sm">sm</Badge>
      <Badge size="md">md</Badge>
      <Badge size="lg">lg</Badge>
      <Badge size="icon">9</Badge>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const sm = canvas.getByText('sm');
    await expect(sm.className.split(' ')).toContain('px-2.5');
    await expect(sm.className.split(' ')).toContain('py-0.5');
    await expect(sm.className.split(' ')).toContain('text-xs');

    const md = canvas.getByText('md');
    await expect(md.className.split(' ')).toContain('px-3');
    await expect(md.className.split(' ')).toContain('py-1');
    await expect(md.className.split(' ')).toContain('text-xs');

    const lg = canvas.getByText('lg');
    await expect(lg.className.split(' ')).toContain('px-3.5');
    await expect(lg.className.split(' ')).toContain('py-1');
    await expect(lg.className.split(' ')).toContain('text-sm');

    // icon: cuadrado (size-6 = 24px), sin padding horizontal de texto.
    const icon = canvas.getByText('9');
    await expect(icon.className.split(' ')).toContain('size-6');
    await expect(icon.className.split(' ')).not.toContain('px-2.5');
  },
};

// 6. Interactive: renderiza un <button> real (no un <div> con onClick) — foco por teclado,
// Enter/Space y disabled nativos del navegador, sin que Badge sintetice ningún handler propio
// (por eso sigue siendo server-safe: solo reenvía props, ver scripts/verify-client-directives.mjs).
export const Interactive: Story = {
  args: {
    children: 'Interactive',
    interactive: true,
    onClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByRole('button', { name: 'Interactive' });

    await expect(badge.tagName).toBe('BUTTON');
    await expect(badge).toHaveAttribute('type', 'button');
    await expect(badge.className.split(' ')).toContain('cursor-pointer');
    await expect(badge.className.split(' ')).toContain('focus-visible:ring-primary');
    await expect(badge.className.split(' ')).toContain('hover:bg-primary-focus');

    // Tab lo enfoca (es un <button> real, a diferencia de un <div> con onClick — nunca
    // alcanzable por teclado).
    await userEvent.tab();
    await expect(badge).toHaveFocus();

    // Click, Enter y Space disparan onClick exactamente una vez cada uno — comportamiento
    // nativo del elemento <button>, Badge no agrega ningún handler de teclado propio.
    await userEvent.click(badge);
    await expect(args.onClick).toHaveBeenCalledTimes(1);

    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).toHaveBeenCalledTimes(2);

    await userEvent.keyboard(' ');
    await expect(args.onClick).toHaveBeenCalledTimes(3);
  },
};

// 7. Interactive + disabled: disabled nativo del <button> — el click no debe disparar onClick.
export const InteractiveDisabled: Story = {
  args: {
    children: 'Disabled',
    interactive: true,
    disabled: true,
    onClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByRole('button', { name: 'Disabled' });

    await expect(badge).toBeDisabled();
    await expect(badge.className.split(' ')).toContain('disabled:opacity-50');
    await expect(badge.className.split(' ')).toContain('disabled:cursor-not-allowed');

    await userEvent.click(badge);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

// 8. No interactivo (default): sigue siendo un <div>, sin ninguna clase de hover/cursor/foco —
// antes vivían incondicionalmente en la base de badgeVariants (CSS muerto: un <div> sin
// tabIndex nunca dispara :focus-visible), ahora son exclusivas de interactive=true.
export const NonInteractive: Story = {
  args: {
    children: 'Static',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('Static');

    await expect(badge.tagName).toBe('DIV');
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();

    await expect(badge.className.split(' ')).not.toContain('cursor-pointer');
    await expect(badge.className.split(' ')).not.toContain('hover:bg-primary-focus');
    await expect(badge.className.split(' ')).not.toContain('focus-visible:ring-primary');
    await expect(badge.className.split(' ')).not.toContain('disabled:opacity-50');
  },
};
