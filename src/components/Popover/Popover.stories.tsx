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

    // El content vive en un Portal fuera de canvasElement, así que se busca en document.body.
    const body = within(document.body);
    await expect(body.queryByText('This is the popover content.')).not.toBeInTheDocument();

    await userEvent.click(trigger);

    // PopoverPrimitive.Content se renderiza con role="dialog".
    const contentPanel = await body.findByRole('dialog');
    await expect(contentPanel).toHaveTextContent('This is the popover content.');

    // Debe usar la misma superficie del DS que el resto de los overlays (Select, Dialog).
    await expect(contentPanel.className.split(' ')).toContain('bg-base-100');
  },
};
