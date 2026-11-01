import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Chip } from './Chip';

const meta: Meta<typeof Chip> = {
  title: 'Components/Chip',
  component: Chip,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Chip>;

// 1. Neither: static chip, no Toggle and no close button.
export const Static: Story = {
  args: {
    children: 'Static',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Static')).toBeInTheDocument();
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
  },
};

// 2. Only pressed/onPressedChange: interactive body through a real Radix Toggle.
export const Toggleable: Story = {
  args: {
    children: 'Design',
    defaultPressed: false,
    onPressedChange: fn(),
    variant: 'outline',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: 'Design' });

    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect(toggle).toHaveAttribute('data-state', 'off');

    // Without a close button, the Toggle already reaches exactly the pill's edge through its own
    // padding (pl-2.5/py-0.5); there's no dead strip to fix, so it doesn't generate ::after.
    await expect(toggle.className.split(' ')).not.toContain('relative');
    await expect(toggle.className).not.toContain("after:content-['']");

    await userEvent.click(toggle);

    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(toggle).toHaveAttribute('data-state', 'on');
    await expect(args.onPressedChange).toHaveBeenLastCalledWith(true);

    // The root declares the override has-[[data-state=on]]:bg-primary: the "on" state always
    // wins over the base color variant (outline here), same criterion as Switch/Checkbox.
    const root = toggle.parentElement as HTMLElement;
    await expect(root.className).toContain('has-[[data-state=on]]:bg-primary');
    await expect(root.className).toContain('has-[[data-state=on]]:text-primary-content');
  },
};

// 3. Only onRemove: a single close button, no Toggle.
export const Removable: Story = {
  args: {
    children: 'Design',
    onRemove: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getAllByRole('button')).toHaveLength(1);
    const removeButton = canvas.getByRole('button', { name: 'Remove' });

    // Touch target: the button's VISUAL box is still a real 24x24 (Material spec for a Chip's
    // delete icon), without the icon itself (12x12) changing size; the focus ring is still that
    // same 24x24 circle. The area that DOES respond to touch is larger: the ::after (relative +
    // after:...) extends the hit area into the padding the root re-introduces (pr-2.5/py-0.5 on
    // root, see below) without enlarging the button's box, and rounded-r-full makes that area
    // follow the pill's curve instead of a rectangle (without it, a tap just outside the curve,
    // near the corner, also triggered onRemove). The vitest-browser fixture doesn't apply
    // Tailwind's utility CSS (same issue documented in Button's Destructive story), so the
    // assertion is on the class; the real size, position and shape were checked by hand in
    // Storybook with a real browser (bounding boxes + elementFromPoint), with an A/B against the
    // commit before the PR #30 regression.
    await expect(removeButton.className.split(' ')).toContain('p-1.5');
    await expect(removeButton.className.split(' ')).toContain('relative');
    await expect(removeButton.className).toContain("after:content-['']");
    await expect(removeButton.className).toContain('after:rounded-r-full');
    await expect(removeButton.querySelector('svg')).toHaveClass('h-3', 'w-3');

    // The root re-introduces the padding that PR #30 had removed from it: it's the only way to
    // rebuild the historical height/width (30px tall) without inflating the body again, which
    // already has its own correct padding for the case without a close button.
    const root = removeButton.parentElement as HTMLElement;
    await expect(root.className.split(' ')).toContain('py-0.5');
    await expect(root.className.split(' ')).toContain('pr-2.5');

    await userEvent.click(removeButton);
    await expect(args.onRemove).toHaveBeenCalledTimes(1);
  },
};

// 4. Both: Toggle + close button, each with its own focus (Tab separates them).
export const ToggleableAndRemovable: Story = {
  args: {
    children: 'Design',
    defaultPressed: false,
    onPressedChange: fn(),
    onRemove: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: 'Design' });
    const removeButton = canvas.getByRole('button', { name: 'Remove' });

    await expect(canvas.getAllByRole('button')).toHaveLength(2);

    // Same fix as in Removable: the root re-introduces py-0.5/pr-2.5 (sm with a close button)
    // to rebuild the historical height/width; the close button claims that area as hit area
    // through ::after (rounded-r-full), without enlarging its 24x24 visual box.
    const root = toggle.parentElement as HTMLElement;
    await expect(root.className.split(' ')).toContain('py-0.5');
    await expect(root.className.split(' ')).toContain('pr-2.5');
    await expect(removeButton.className.split(' ')).toContain('relative');
    await expect(removeButton.className).toContain('after:rounded-r-full');

    // The Toggle, unlike the close button, only stretches to the row height (24px); without its
    // own ::after, ~2px above/below that the ✕ does claim would not respond.
    // rounded-l-full because the Toggle lives on the LEFT edge of the pill (the opposite curve
    // to the close button's).
    await expect(toggle.className.split(' ')).toContain('relative');
    await expect(toggle.className).toContain("after:content-['']");
    await expect(toggle.className).toContain('after:rounded-l-full');

    // Independent focus: clicking the body focuses only the Toggle, Tab moves to the close button
    // without activating it, and each one fires its own callback without interfering with the other.
    await userEvent.click(toggle);
    await expect(toggle).toHaveFocus();
    await expect(args.onPressedChange).toHaveBeenLastCalledWith(true);
    await expect(args.onRemove).not.toHaveBeenCalled();

    await userEvent.tab();
    await expect(removeButton).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    await expect(args.onRemove).toHaveBeenCalledTimes(1);
    // Enter on the close button must not reopen/change the Toggle's state.
    await expect(args.onPressedChange).toHaveBeenCalledTimes(1);
  },
};

// 5. size="md": the body padding and the close button size move to the children (not the
// root) so their real hit box fills the 32px pill. The vitest-browser fixture doesn't apply
// Tailwind's utility CSS (same issue documented in Removable), so this checks the classes;
// the real pixel size was checked by hand in Storybook with a real browser.
export const Medium: Story = {
  args: {
    children: 'Design',
    size: 'md',
    defaultPressed: false,
    onPressedChange: fn(),
    onRemove: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: 'Design' });
    const removeButton = canvas.getByRole('button', { name: 'Remove' });

    const root = toggle.parentElement as HTMLElement;
    await expect(root.className.split(' ')).toContain('h-8');
    await expect(root.className.split(' ')).toContain('text-sm');

    // pl-3 always; pr-3 NOT (there's a close button next to it: the gap-1 of the root provides
    // the space, not a padding of the body itself; see the comment in Chip.tsx).
    await expect(toggle.className.split(' ')).toContain('pl-3');
    await expect(toggle.className.split(' ')).not.toContain('pr-3');
    // py-0.5 is exclusive to sm (md/lg set the height on the root and stretch to fill it).
    await expect(toggle.className.split(' ')).not.toContain('py-0.5');
    // The Toggle extends its hit area to the OUTER edge of the root (it covers the 1px border
    // itself, unlike sm), with or without a close button next to it; see Chip.tsx.
    await expect(toggle.className.split(' ')).toContain('relative');
    await expect(toggle.className).toContain("after:content-['']");
    await expect(toggle.className).toContain('after:rounded-l-full');
    await expect(toggle.className).toContain('after:-top-px');

    // Close button: explicit 32px width, but NO explicit height (unlike an earlier version of
    // this file), so it stretches just like the Toggle/body and stays centered, instead of
    // overflowing the root's bottom border by not responding to items-stretch (a fixed h-8
    // doesn't stretch). Its ::after (rounded-r-full) reaches the outer edge just like the
    // Toggle's, but on the right side.
    await expect(removeButton.className.split(' ')).not.toContain('h-8');
    await expect(removeButton.className.split(' ')).toContain('w-8');
    await expect(removeButton.className.split(' ')).not.toContain('p-1.5');
    await expect(removeButton.className.split(' ')).toContain('relative');
    await expect(removeButton.className).toContain('after:rounded-r-full');
    await expect(removeButton.querySelector('svg')).toHaveClass('h-3.5', 'w-3.5');

    await userEvent.click(toggle);
    await expect(args.onPressedChange).toHaveBeenLastCalledWith(true);
  },
};

// 6. size="md", Toggle WITHOUT a close button: a case not covered by Medium (which always has
// onRemove). Here the RIGHT end of the Toggle is also the right end of the pill (unlike
// Medium, where it borders the inner gap-1); it needs a full rounded-full, not rounded-l-full,
// or those two corners stay square and respond outside the pill's visible curve (bug fixed
// here; confirmed with a systematic elementFromPoint sweep in Storybook with a real browser;
// see the PR).
export const MediumToggleable: Story = {
  args: {
    children: 'Design',
    size: 'md',
    defaultPressed: false,
    onPressedChange: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: 'Design' });

    await expect(toggle.className.split(' ')).toContain('relative');
    await expect(toggle.className).toContain("after:content-['']");
    await expect(toggle.className).toContain('after:rounded-full');
    await expect(toggle.className).not.toContain('after:rounded-l-full');
  },
};

// 7. size="lg": touch size (44px). Same criterion as Medium.
export const Large: Story = {
  args: {
    children: 'Design',
    size: 'lg',
    defaultPressed: false,
    onPressedChange: fn(),
    onRemove: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: 'Design' });
    const removeButton = canvas.getByRole('button', { name: 'Remove' });

    const root = toggle.parentElement as HTMLElement;
    await expect(root.className.split(' ')).toContain('h-11');
    await expect(root.className.split(' ')).toContain('text-base');

    await expect(toggle.className.split(' ')).toContain('pl-4');
    await expect(toggle.className.split(' ')).not.toContain('pr-4');
    await expect(toggle.className.split(' ')).not.toContain('py-0.5');
    // Same as in Medium: the Toggle reaches the outer edge of the root, including the 1px border
    // itself; in lg this is what guarantees the real 44px touch target (not just the Toggle's
    // visual box, which by construction is 1px smaller than the root).
    await expect(toggle.className.split(' ')).toContain('relative');
    await expect(toggle.className).toContain('after:rounded-l-full');

    // Close button: NO explicit height (same as in Medium); it stretches inside the root and
    // stays centered; its width (w-11, 44px) does stay fixed. Its own visual box is ~1px shorter
    // than the root (the border-box "eats" the border), but its real hit area (box + ::after)
    // does reach the full 44px, the target touch size of this scale (see README); checked in a
    // real browser by scanning the click area.
    await expect(removeButton.className.split(' ')).not.toContain('h-11');
    await expect(removeButton.className.split(' ')).toContain('w-11');
    await expect(removeButton.className.split(' ')).not.toContain('p-1.5');
    await expect(removeButton.className.split(' ')).toContain('relative');
    await expect(removeButton.className).toContain('after:rounded-r-full');
    await expect(removeButton.querySelector('svg')).toHaveClass('h-4', 'w-4');

    await userEvent.click(toggle);
    await expect(args.onPressedChange).toHaveBeenLastCalledWith(true);
  },
};

// 8. size="lg", Toggle WITHOUT a close button: same case as MediumToggleable, at touch size
// (44px); here the uncorrected square corner left up to ~9px of diagonal gap outside the
// visible curve that still activated the Toggle.
export const LargeToggleable: Story = {
  args: {
    children: 'Design',
    size: 'lg',
    defaultPressed: false,
    onPressedChange: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: 'Design' });

    await expect(toggle.className.split(' ')).toContain('relative');
    await expect(toggle.className).toContain("after:content-['']");
    await expect(toggle.className).toContain('after:rounded-full');
    await expect(toggle.className).not.toContain('after:rounded-l-full');
  },
};
