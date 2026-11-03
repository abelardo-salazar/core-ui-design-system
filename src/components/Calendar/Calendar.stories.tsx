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

// 2. Touch target: the arrows extend their hit area to 44x44 with an ::after and keep their
// 28x28 size; the days stay at 36px with no ::after, the documented exception for contiguous
// grids. This project doesn't apply Tailwind, so the assertions are on classes.
export const TouchTargets: Story = {
  args: {
    mode: 'single',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    for (const name of ['Go to the Previous Month', 'Go to the Next Month']) {
      const classes = canvas.getByRole('button', { name }).className.split(' ');
      await expect(classes).toContain('relative');
      await expect(classes).toContain("after:content-['']");
      await expect(classes).toContain('after:absolute');
      await expect(classes).toContain('after:rounded-btn');
      await expect(classes).toContain('after:-inset-[9px]');
      await expect(classes).toContain('h-7');
      await expect(classes).toContain('w-7');
    }

    const day = canvas.getAllByRole('gridcell')[0].querySelector('button');
    await expect(day?.className.split(' ')).toContain('h-9');
    await expect(day?.className.split(' ')).toContain('w-9');
    await expect(day?.className).not.toContain('after:');
  },
};
