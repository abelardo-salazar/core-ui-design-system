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
      <label htmlFor="marketing-emails">Marketing emails</label>
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    // Radix Switch es un <button role="switch">: mismo patrón de interacción que Checkbox,
    // solo cambia la primitiva por debajo.
    const switchControl = canvas.getByRole('switch');

    await expect(switchControl).toHaveAttribute('aria-checked', 'false');

    // Click: toggle a checked.
    await userEvent.click(switchControl);
    await expect(switchControl).toHaveAttribute('aria-checked', 'true');
    await expect(args.onCheckedChange).toHaveBeenLastCalledWith(true);

    // Teclado (Space) sobre el control ya enfocado por el click anterior: toggle a unchecked.
    await userEvent.keyboard(' ');
    await expect(switchControl).toHaveAttribute('aria-checked', 'false');
    await expect(args.onCheckedChange).toHaveBeenLastCalledWith(false);
  },
};
