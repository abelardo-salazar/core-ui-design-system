import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
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
    await expect(badge.className.split(' ')).toContain('bg-primary');
    await expect(badge.className.split(' ')).toContain('text-primary-content');
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

// 4. Destructive
export const Destructive: Story = {
  args: {
    children: 'Destructive',
    variant: 'destructive',
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
    // su propio -focus-content en hover, distinto del -content del estado base.
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
