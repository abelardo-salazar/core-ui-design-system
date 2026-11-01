import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';
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
