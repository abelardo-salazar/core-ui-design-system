import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Chip } from './Chip';

const meta: Meta<typeof Chip> = {
  title: 'Components/Chip',
  component: Chip,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Chip>;

// 1. Ninguno: chip estático, sin Toggle ni botón de cierre.
export const Static: Story = {
  args: {
    children: 'Static',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Static')).toBeInTheDocument();
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
  },
};

// 2. Solo pressed/onPressedChange: cuerpo interactivo vía Radix Toggle real.
export const Toggleable: Story = {
  args: {
    children: 'Design',
    defaultPressed: false,
    onPressedChange: fn(),
    variant: 'outline',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: 'Design' });

    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect(toggle).toHaveAttribute('data-state', 'off');

    await userEvent.click(toggle);

    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(toggle).toHaveAttribute('data-state', 'on');
    await expect(args.onPressedChange).toHaveBeenLastCalledWith(true);

    // La raíz declara el override has-[[data-state=on]]:bg-primary — el estado "on" siempre
    // gana sobre la variante de color de base (aquí outline), mismo criterio que Switch/Checkbox.
    const root = toggle.parentElement as HTMLElement;
    await expect(root.className).toContain('has-[[data-state=on]]:bg-primary');
    await expect(root.className).toContain('has-[[data-state=on]]:text-primary-content');
  },
};

// 3. Solo onRemove: un único botón de cierre, sin Toggle.
export const Removable: Story = {
  args: {
    children: 'Design',
    onRemove: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getAllByRole('button')).toHaveLength(1);
    const removeButton = canvas.getByRole('button', { name: 'Remove' });

    // Touch target: 24x24 reales (spec de Material para el ícono de borrar de un Chip),
    // sin que el ícono en sí (12x12) cambie de tamaño. El fixture de vitest-browser no
    // aplica el CSS de utilidades de Tailwind (mismo issue documentado en el story
    // Destructive de Button), así que la aserción va sobre la clase; el tamaño real en
    // píxeles se verificó a mano en Storybook con devtools de un navegador real.
    await expect(removeButton.className.split(' ')).toContain('p-1.5');
    await expect(removeButton.querySelector('svg')).toHaveClass('h-3', 'w-3');

    await userEvent.click(removeButton);
    await expect(args.onRemove).toHaveBeenCalledTimes(1);
  },
};

// 4. Ambos: Toggle + botón de cierre, cada uno con su propio foco (Tab los separa).
export const ToggleableAndRemovable: Story = {
  args: {
    children: 'Design',
    defaultPressed: false,
    onPressedChange: fn(),
    onRemove: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: 'Design' });
    const removeButton = canvas.getByRole('button', { name: 'Remove' });

    await expect(canvas.getAllByRole('button')).toHaveLength(2);

    // Foco independiente: clic en el cuerpo enfoca solo el Toggle, Tab mueve al botón de cierre
    // sin activarlo, y cada uno dispara su propio callback sin interferir con el otro.
    await userEvent.click(toggle);
    await expect(toggle).toHaveFocus();
    await expect(args.onPressedChange).toHaveBeenLastCalledWith(true);
    await expect(args.onRemove).not.toHaveBeenCalled();

    await userEvent.tab();
    await expect(removeButton).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    await expect(args.onRemove).toHaveBeenCalledTimes(1);
    // El Enter sobre el botón de cierre no debe reabrir/cambiar el estado del Toggle.
    await expect(args.onPressedChange).toHaveBeenCalledTimes(1);
  },
};
