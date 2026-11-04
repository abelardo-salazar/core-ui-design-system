import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Switch } from './Switch';

const meta: Meta<typeof Switch> = {
  title: 'Components/Switch',
  component: Switch,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Switch>;

// 1. Default
export const Default: Story = {
  args: {
    id: 'marketing-emails',
    onCheckedChange: fn(),
  },
  render: (args) => (
    <div className="flex items-center gap-2">
      <Switch {...args} />
      <label htmlFor="marketing-emails">Correos de marketing</label>
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    // Radix Switch is a <button role="switch">: same interaction pattern as Checkbox,
    // only the primitive underneath changes.
    const switchControl = canvas.getByRole('switch');

    // --ring/--color-ring don't exist in the token system: ring-ring didn't resolve to
    // any color and the focus ring was invisible when navigating with the keyboard.
    await expect(switchControl.className.split(' ')).toContain('focus-visible:ring-primary');
    await expect(switchControl.className.split(' ')).not.toContain('focus-visible:ring-ring');

    await expect(switchControl).toHaveAttribute('aria-checked', 'false');

    // Click: toggle a checked.
    await userEvent.click(switchControl);
    await expect(switchControl).toHaveAttribute('aria-checked', 'true');
    await expect(args.onCheckedChange).toHaveBeenLastCalledWith(true);

    // Keyboard (Space) on the control already focused by the previous click: toggles to unchecked.
    await userEvent.keyboard(' ');
    await expect(switchControl).toHaveAttribute('aria-checked', 'false');
    await expect(args.onCheckedChange).toHaveBeenLastCalledWith(false);
  },
};
