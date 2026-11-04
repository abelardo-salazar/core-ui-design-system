import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Badge } from './Badge';
import { rootTokenIn } from '../../../.storybook/rootTheme';

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

// 1. Default
export const Default: Story = {
  args: {
    children: 'Predeterminado',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('Predeterminado');
    await expect(badge.tagName).toBe('DIV');
    await expect(badge.className.split(' ')).toContain('bg-primary');
    await expect(badge.className.split(' ')).toContain('text-primary-content');

    // sm (default): px-2.5 py-0.5 text-xs; see the Sizes story for the four scales and the
    // real heights measured in the browser.
    await expect(badge.className.split(' ')).toContain('px-2.5');
    await expect(badge.className.split(' ')).toContain('py-0.5');
  },
};

// 2. Secondary
export const Secondary: Story = {
  args: {
    children: 'Secundario',
    variant: 'secondary',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('Secundario');
    await expect(badge.className.split(' ')).toContain('bg-secondary');
    await expect(badge.className.split(' ')).toContain('text-secondary-content');
  },
};

// 3. Outline
export const Outline: Story = {
  args: {
    children: 'Contorno',
    variant: 'outline',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('Contorno');
    await expect(badge.className.split(' ')).toContain('text-base-content');
    await expect(badge.className.split(' ')).toContain('border-base-content/20');
  },
};

// 4. Destructive, interactive: true so the real hover can be checked (compoundVariants
// only adds those classes when interactive=true; without it the badge has no hover at all).
export const Destructive: Story = {
  args: {
    children: 'Destructivo',
    variant: 'destructive',
    interactive: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('Destructivo');

    await expect(badge.className.split(' ')).toContain('text-error-content');
    await expect(rootTokenIn('light', '--error-content')).toBe('#000000');

    // Hover: same token as Button destructive (see Button.stories.tsx); --error-focus
    // (background) is dark while --error (base background) is light, so the text needs
    // its own -focus-content on hover, different from the base state's -content. It lives in
    // compoundVariants ({variant: 'destructive', interactive: true}), not in the color variant
    // alone: a non-interactive Badge must never show a hover.
    await expect(badge.className.split(' ')).toContain('hover:bg-error-focus');
    await expect(badge.className.split(' ')).toContain('hover:text-error-focus-content');
    await expect(rootTokenIn('light', '--error-focus-content')).toBe('#ffffff');

    // Dark mode flips which color needs more contrast.
    await expect(rootTokenIn('dark', '--error-focus-content')).toBe('#000000');
  },
};

// 5. Sizes: Badge's own scale (not Button's): compact, meant for a status label, not a
// control. The vitest-browser fixture doesn't apply Tailwind utilities or do real layout
// (height/width can't be measured here), so this checks the classes; the real heights
// (sm ≈ 22px, md ≈ 26px, lg ≈ 30px, icon = exactly 24px) were checked by hand in
// Storybook with a real browser, with an A/B against the previous default (32px, see CHANGELOG).
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Badge size="sm">sm</Badge>
      <Badge size="md">md</Badge>
      <Badge size="lg">lg</Badge>
      <Badge size="icon">9</Badge>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const sm = canvas.getByText('sm');
    await expect(sm.className.split(' ')).toContain('px-2.5');
    await expect(sm.className.split(' ')).toContain('py-0.5');
    await expect(sm.className.split(' ')).toContain('text-xs');

    const md = canvas.getByText('md');
    await expect(md.className.split(' ')).toContain('px-3');
    await expect(md.className.split(' ')).toContain('py-1');
    await expect(md.className.split(' ')).toContain('text-xs');

    const lg = canvas.getByText('lg');
    await expect(lg.className.split(' ')).toContain('px-3.5');
    await expect(lg.className.split(' ')).toContain('py-1');
    await expect(lg.className.split(' ')).toContain('text-sm');

    // icon: square (size-6 = 24px), no horizontal text padding.
    const icon = canvas.getByText('9');
    await expect(icon.className.split(' ')).toContain('size-6');
    await expect(icon.className.split(' ')).not.toContain('px-2.5');
  },
};

// 6. Interactive: renders a real <button> (not a <div> with onClick); keyboard focus,
// Enter/Space and disabled native to the browser, without Badge synthesizing any handler of
// its own (that's why it stays server-safe: it only forwards props, see
// scripts/verify-client-directives.mjs).
export const Interactive: Story = {
  args: {
    children: 'Interactivo',
    interactive: true,
    onClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByRole('button', { name: 'Interactivo' });

    await expect(badge.tagName).toBe('BUTTON');
    await expect(badge).toHaveAttribute('type', 'button');
    await expect(badge.className.split(' ')).toContain('cursor-pointer');
    await expect(badge.className.split(' ')).toContain('focus-visible:ring-primary');
    await expect(badge.className.split(' ')).toContain('hover:bg-primary-focus');

    // Tab focuses it (it's a real <button>, unlike a <div> with onClick, which is never
    // reachable by keyboard).
    await userEvent.tab();
    await expect(badge).toHaveFocus();

    // Click, Enter and Space fire onClick exactly once each: native behavior of the
    // <button> element; Badge adds no keyboard handler of its own.
    await userEvent.click(badge);
    await expect(args.onClick).toHaveBeenCalledTimes(1);

    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).toHaveBeenCalledTimes(2);

    await userEvent.keyboard(' ');
    await expect(args.onClick).toHaveBeenCalledTimes(3);
  },
};

// 7. Interactive + disabled: native disabled of the <button>; the click must not fire onClick.
export const InteractiveDisabled: Story = {
  args: {
    children: 'Deshabilitado',
    interactive: true,
    disabled: true,
    onClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByRole('button', { name: 'Deshabilitado' });

    await expect(badge).toBeDisabled();
    await expect(badge.className.split(' ')).toContain('disabled:opacity-50');
    await expect(badge.className.split(' ')).toContain('disabled:cursor-not-allowed');

    await userEvent.click(badge);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

// 8. Non-interactive (default): still a <div>, without any hover/cursor/focus class;
// they used to live unconditionally in the badgeVariants base (dead CSS: a <div> without
// tabIndex never fires :focus-visible), now they're exclusive to interactive=true.
export const NonInteractive: Story = {
  args: {
    children: 'Estático',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('Estático');

    await expect(badge.tagName).toBe('DIV');
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();

    await expect(badge.className.split(' ')).not.toContain('cursor-pointer');
    await expect(badge.className.split(' ')).not.toContain('hover:bg-primary-focus');
    await expect(badge.className.split(' ')).not.toContain('focus-visible:ring-primary');
    await expect(badge.className.split(' ')).not.toContain('disabled:opacity-50');
  },
};
