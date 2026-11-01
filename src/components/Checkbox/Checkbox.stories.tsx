import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Checkbox } from './Checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

// 1. Default
export const Default: Story = {
  args: {
    id: 'terms',
    onCheckedChange: fn(),
  },
  render: (args) => (
    <div className="flex items-center gap-2">
      <Checkbox {...args} />
      <label htmlFor="terms">Accept terms and conditions</label>
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    // Radix Checkbox is a <button role="checkbox">: no logic of its own is needed
    // for Space, it inherits it from the native element.
    const checkbox = canvas.getByRole('checkbox');

    // --ring/--color-ring don't exist in the token system: ring-ring didn't resolve to
    // any color and the focus ring was invisible when navigating with the keyboard.
    await expect(checkbox.className.split(' ')).toContain('focus-visible:ring-primary');
    await expect(checkbox.className.split(' ')).not.toContain('focus-visible:ring-ring');

    await expect(checkbox).toHaveAttribute('aria-checked', 'false');

    // Click: toggle a checked.
    await userEvent.click(checkbox);
    await expect(checkbox).toHaveAttribute('aria-checked', 'true');
    await expect(args.onCheckedChange).toHaveBeenLastCalledWith(true);

    // Keyboard (Space) on the control already focused by the previous click: toggles to unchecked.
    await userEvent.keyboard(' ');
    await expect(checkbox).toHaveAttribute('aria-checked', 'false');
    await expect(args.onCheckedChange).toHaveBeenLastCalledWith(false);
  },
};
