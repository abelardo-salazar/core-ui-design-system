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
    // Radix Checkbox es un <button role="checkbox">: no hace falta lógica propia
    // para Space, la hereda del elemento nativo.
    const checkbox = canvas.getByRole('checkbox');

    await expect(checkbox).toHaveAttribute('aria-checked', 'false');

    // Click: toggle a checked.
    await userEvent.click(checkbox);
    await expect(checkbox).toHaveAttribute('aria-checked', 'true');
    await expect(args.onCheckedChange).toHaveBeenLastCalledWith(true);

    // Teclado (Space) sobre el control ya enfocado por el click anterior: toggle a unchecked.
    await userEvent.keyboard(' ');
    await expect(checkbox).toHaveAttribute('aria-checked', 'false');
    await expect(args.onCheckedChange).toHaveBeenLastCalledWith(false);
  },
};
