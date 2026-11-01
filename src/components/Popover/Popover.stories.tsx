import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';
import { Popover, PopoverTrigger, PopoverContent } from './Popover';
import { Button } from '../Button';

const meta: Meta<typeof Popover> = {
  title: 'Components/Popover',
  component: Popover,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Popover>;

// 1. Default
export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent aria-label="Popover example">
        <p>This is the popover content.</p>
      </PopoverContent>
    </Popover>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Open popover' });

    // The content lives in a Portal outside canvasElement, so it's searched in document.body.
    const body = within(document.body);
    await expect(body.queryByText('This is the popover content.')).not.toBeInTheDocument();

    await userEvent.click(trigger);

    // PopoverPrimitive.Content renders with role="dialog".
    const contentPanel = await body.findByRole('dialog');
    await expect(contentPanel).toHaveTextContent('This is the popover content.');

    // Must use the same DS surface as the rest of the overlays (Select, Dialog).
    await expect(contentPanel.className.split(' ')).toContain('bg-base-100');
  },
};
