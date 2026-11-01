import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './Tooltip';
import { Button } from '../Button';

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

// 1. Default: closed by default, appears with a delay on hover, disappears when the
// mouse leaves. TooltipProvider is required: Tooltip (Root) has no default context
// and throws if mounted without a TooltipProvider ancestor (verified in the source of
// @radix-ui/react-tooltip, createTooltipContext('TooltipProvider') without defaultContext).
export const Default: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Hover me</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Saved to your library</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Hover me' });

    // The content lives in a Portal outside canvasElement (same pattern as Popover/Select).
    const body = within(document.body);
    await expect(body.queryByRole('tooltip')).not.toBeInTheDocument();

    // The hover goes through Radix's default delay (delayDuration = 700ms) before opening.
    await userEvent.hover(trigger);
    const tooltipPanel = await body.findByRole('tooltip', {}, { timeout: 2000 });
    await expect(tooltipPanel).toHaveTextContent('Saved to your library');

    // Defensive CSS layer: the content is hidden on coarse-pointer (touch) devices via
    // the `pointer: coarse` media feature, independent of whether anything tried to open it.
    await expect(tooltipPanel.className.split(' ')).toContain('pointer-coarse:hidden');

    await userEvent.unhover(trigger);
    await waitFor(() => expect(body.queryByRole('tooltip')).not.toBeInTheDocument(), {
      timeout: 2000,
    });
  },
};

// 2. KeyboardFocus: focusing with the keyboard opens immediately, without the hover delay (verified
// in TooltipTrigger: onFocus calls context.onOpen() directly, without going through the
// onTriggerEnter timer the hover uses). Losing focus closes it.
export const KeyboardFocus: Story = {
  render: () => (
    <TooltipProvider>
      <div className="flex items-center gap-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Hover me</Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Saved to your library</p>
          </TooltipContent>
        </Tooltip>
        <Button variant="ghost">Next</Button>
      </div>
    </TooltipProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Hover me' });

    const body = within(document.body);
    await expect(body.queryByRole('tooltip')).not.toBeInTheDocument();

    await userEvent.tab();
    await expect(trigger).toHaveFocus();

    // No long delay to wait for: unlike Default (hover), focus opens immediately.
    const tooltipPanel = await body.findByRole('tooltip', {}, { timeout: 500 });
    await expect(tooltipPanel).toHaveTextContent('Saved to your library');

    // Moves focus to the next element -> blur on the trigger -> it closes.
    await userEvent.tab();
    await waitFor(() => expect(body.queryByRole('tooltip')).not.toBeInTheDocument(), {
      timeout: 2000,
    });
  },
};
