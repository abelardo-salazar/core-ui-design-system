import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { Progress } from './Progress';

const meta: Meta<typeof Progress> = {
  title: 'Components/Progress',
  component: Progress,
  parameters: {
    layout: 'centered',
  },
  args: {
    value: 50,
  },
  render: (args) => (
    <div className="w-64">
      <Progress {...args} />
    </div>
  ),
};

export default meta;
type Story = StoryObj<typeof Progress>;

// 1. Default (variant primary)
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bar = canvas.getByRole('progressbar');

    await expect(bar).toHaveAttribute('aria-valuenow', '50');
    await expect(bar).toHaveAttribute('aria-valuemax', '100');
    // role="progressbar" requiere nombre accesible (axe: aria-progressbar-name).
    await expect(bar).toHaveAttribute('aria-label', 'Progress');

    const indicator = bar.firstElementChild as HTMLElement;
    await expect(indicator.className.split(' ')).toContain('bg-primary');
    await expect(indicator.style.transform).toBe('translateX(-50%)');
  },
};

// 2. Success
export const Success: Story = {
  args: { value: 80, variant: 'success' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bar = canvas.getByRole('progressbar');
    const indicator = bar.firstElementChild as HTMLElement;
    await expect(indicator.className.split(' ')).toContain('bg-success');
  },
};

// 3. Warning
export const Warning: Story = {
  args: { value: 60, variant: 'warning' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bar = canvas.getByRole('progressbar');
    const indicator = bar.firstElementChild as HTMLElement;
    await expect(indicator.className.split(' ')).toContain('bg-warning');
  },
};

// 4. Error
export const ErrorVariant: Story = {
  args: { value: 30, variant: 'error' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bar = canvas.getByRole('progressbar');
    const indicator = bar.firstElementChild as HTMLElement;
    await expect(indicator.className.split(' ')).toContain('bg-error');
  },
};

// 5. Empty (value 0)
export const Empty: Story = {
  args: { value: 0 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bar = canvas.getByRole('progressbar');
    const indicator = bar.firstElementChild as HTMLElement;
    await expect(indicator.style.transform).toBe('translateX(-100%)');
  },
};

// 6. Full (value at max)
export const Full: Story = {
  args: { value: 100 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bar = canvas.getByRole('progressbar');
    await expect(bar).toHaveAttribute('data-state', 'complete');
    const indicator = bar.firstElementChild as HTMLElement;
    await expect(indicator.style.transform).toBe('translateX(0%)');
  },
};
