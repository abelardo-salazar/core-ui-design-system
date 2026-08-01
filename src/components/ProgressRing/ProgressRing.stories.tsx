import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { ProgressRing } from './ProgressRing';

const meta: Meta<typeof ProgressRing> = {
  title: 'Components/ProgressRing',
  component: ProgressRing,
  parameters: {
    layout: 'centered',
  },
  args: {
    value: 50,
  },
};

export default meta;
type Story = StoryObj<typeof ProgressRing>;

// 1. Default (variant primary, sin label)
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const ring = canvas.getByRole('progressbar');

    await expect(ring).toHaveAttribute('aria-valuenow', '50');
    await expect(ring).toHaveAttribute('aria-valuemax', '100');
    // role="progressbar" requiere nombre accesible (axe: aria-progressbar-name).
    await expect(ring).toHaveAttribute('aria-label', 'Progress');
    await expect(canvas.queryByText('50%')).not.toBeInTheDocument();

    const valueCircle = ring.querySelectorAll('circle')[1];
    await expect(valueCircle.getAttribute('class')?.split(' ')).toContain('stroke-primary');
  },
};

// 2. Con label centrado (opt-in)
export const WithLabel: Story = {
  args: { value: 72, showValueLabel: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('72%')).toBeInTheDocument();
  },
};

// 3. Success
export const Success: Story = {
  args: { value: 90, variant: 'success' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const ring = canvas.getByRole('progressbar');
    const valueCircle = ring.querySelectorAll('circle')[1];
    await expect(valueCircle.getAttribute('class')?.split(' ')).toContain('stroke-success');
  },
};

// 4. Warning
export const Warning: Story = {
  args: { value: 55, variant: 'warning' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const ring = canvas.getByRole('progressbar');
    const valueCircle = ring.querySelectorAll('circle')[1];
    await expect(valueCircle.getAttribute('class')?.split(' ')).toContain('stroke-warning');
  },
};

// 5. Error
export const ErrorVariant: Story = {
  args: { value: 20, variant: 'error' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const ring = canvas.getByRole('progressbar');
    const valueCircle = ring.querySelectorAll('circle')[1];
    await expect(valueCircle.getAttribute('class')?.split(' ')).toContain('stroke-error');
  },
};

// 6. Tamaño y grosor personalizados
export const CustomSize: Story = {
  args: { value: 40, size: 120, strokeWidth: 10, showValueLabel: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const ring = canvas.getByRole('progressbar');
    await expect(ring).toHaveStyle({ width: '120px', height: '120px' });
  },
};

// 7. Valor por encima del máximo (clamping)
export const ClampedOverflow: Story = {
  args: { value: 150, max: 100, showValueLabel: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const ring = canvas.getByRole('progressbar');
    await expect(ring).toHaveAttribute('aria-valuenow', '100');
    await expect(canvas.getByText('100%')).toBeInTheDocument();
  },
};
