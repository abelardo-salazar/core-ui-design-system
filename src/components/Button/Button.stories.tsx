import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Cross2Icon } from '@radix-ui/react-icons';
import { Button } from './Button';
import { readInTheme, rootTokenIn } from '../../../.storybook/rootTheme';

// Main story configuration
const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'link', 'destructive'],
    },
    size: {
      control: 'radio',
      options: ['sm', 'md', 'lg', 'icon'],
    },
    shape: {
      control: 'radio',
      options: ['default', 'pill'],
    },
    isLoading: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
    asChild: { control: 'boolean', description: 'Enables polymorphism (render as a, Link, etc)' },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// 1. Base Story (Playground)
export const Default: Story = {
  args: {
    children: 'Button UI',
    variant: 'primary',
    size: 'md',
    onClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Button UI' });

    // md = 44px, aligned with Input md and the Select trigger (same family of form controls).
    // No explicit shape: it must still resolve to rounded-btn (defaultVariants), not
    // rounded-full; consumers that call buttonVariants({...}) without passing shape
    // (Calendar, SkipToContent, DatePicker) rely on this default.
    await expect(button.className.split(' ')).toContain('h-11');
    await expect(button.className.split(' ')).toContain('rounded-btn');
    await expect(button.className.split(' ')).not.toContain('rounded-full');

    // Enabled native case: the click must fire the consumer's onClick
    // exactly as we pass it (handler composition must not break).
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

// 1b. Native disabled: the click must not fire the consumer's onClick.
export const Disabled: Story = {
  args: {
    children: 'Disabled button',
    disabled: true,
    onClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Disabled button' });

    await expect(button).toBeDisabled();

    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

// 2. Main Variants
export const Secondary: Story = {
  args: {
    children: 'Secondary Action',
    variant: 'secondary',
  },
};

export const Outline: Story = {
  args: {
    children: 'Outline Button',
    variant: 'outline',
  },
};

export const Destructive: Story = {
  args: {
    children: 'Delete Account',
    variant: 'destructive',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Delete Account' });
    // The vitest-browser fixture doesn't expose the --color-* variables derived by
    // @theme through getComputedStyle (not even for pre-existing tokens such as
    // --color-primary-content), so the contrast assertion is on the raw token
    // defined directly on :root, plus the class that uses it.
    await expect(button.className.split(' ')).toContain('text-error-content');
    await expect(rootTokenIn('light', '--error-content')).toBe('#000000');

    // Hover: --error-focus (background) is dark while --error (base background) is light,
    // the opposite of the other variants, so the text needs ITS OWN -focus-content,
    // different from the base state's -content. Without it, black text on the dark hover drops
    // to 3.25:1 (see the commit that introduced --error-focus-content in index.css).
    await expect(button.className.split(' ')).toContain('hover:text-error-focus-content');
    await expect(rootTokenIn('light', '--error-focus-content')).toBe('#ffffff');

    // Dark mode flips which color needs more contrast (--error-focus becomes a light
    // red), so --error-focus-content flips too: black, not white.
    await expect(rootTokenIn('dark', '--error-focus-content')).toBe('#000000');
  },
};

// 3. States (Loading)
export const Loading: Story = {
  args: {
    children: 'Saving...',
    isLoading: true,
  },
};

// 4. With Icons
export const WithIcons: Story = {
  args: {
    children: 'Settings',
    startIcon: <span>⚙️</span>, // We use an emoji for simplicity; an Icon component would go here.
  },
};

// 4b. Touch target: size="icon" must measure a real 44x44 (Apple HIG), without the icon itself
// (forced to size-4 by the base class [&_svg]:size-4, independent of the button size) changing.
// The vitest-browser fixture doesn't apply Tailwind's utility CSS (same issue
// documented in the Destructive story: getComputedStyle doesn't expose what the classes
// generate), so the assertion is on the classes, not on getBoundingClientRect(); the
// real pixel size (44x44 button, 16x16 icon) was checked by hand in Storybook with the
// devtools of a real browser.
export const Icon: Story = {
  args: {
    size: 'icon',
    'aria-label': 'Close',
    children: <Cross2Icon />,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Close' });

    await expect(button.className.split(' ')).toContain('h-11');
    await expect(button.className.split(' ')).toContain('w-11');
    // The icon has no h-4/w-4 of its own: it relies on [&_svg]:size-4 in the button's base
    // class, which is precisely what guarantees the icon doesn't grow with the hit area.
    await expect(button.className.split(' ')).toContain('[&_svg]:size-4');
    await expect(button.querySelector('svg')).toBeInTheDocument();
  },
};

// 4c. shape="pill", native. Known risk (it already happened with Badge.size): if Button.tsx
// didn't destructure `shape` and pass it to buttonVariants(), the value would spread into
// ...props and end up as an invalid HTML attribute `shape="pill"` in the DOM instead of
// applying rounded-full; hence the explicit assertion that the attribute does NOT exist, not
// just that the right class is present.
export const PillShape: Story = {
  args: {
    shape: 'pill',
    children: 'Pill button',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Pill button' });

    await expect(button.className.split(' ')).toContain('rounded-full');
    await expect(button.className.split(' ')).not.toContain('rounded-btn');
    await expect(button).not.toHaveAttribute('shape');
  },
};

// 4d. shape="pill" + asChild: same check as PillShape, but through the Slot branch: `classes`
// is computed once in Button.tsx and feeds both branches, but this story confirms it
// instead of assuming it from reading the code.
export const PillShapeAsChild: Story = {
  args: {
    shape: 'pill',
    asChild: true,
    children: <a href="/">Pill link</a>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Pill link' });

    await expect(link.className.split(' ')).toContain('rounded-full');
    await expect(link.className.split(' ')).not.toContain('rounded-btn');
    await expect(link).not.toHaveAttribute('shape');
  },
};

// 4e. shape="pill" + size="icon": a 44x44 circle (rounded-full on a square box).
// The focus ring follows the shape without any code change (see buttonVariants.ts); that
// is confirmed visually in Storybook with a real browser, not here.
export const PillIcon: Story = {
  args: {
    shape: 'pill',
    size: 'icon',
    'aria-label': 'Add',
    children: <Cross2Icon />,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Add' });

    await expect(button.className.split(' ')).toContain('rounded-full');
    await expect(button.className.split(' ')).not.toContain('rounded-btn');
    await expect(button.className.split(' ')).toContain('h-11');
    await expect(button.className.split(' ')).toContain('w-11');
    await expect(button).not.toHaveAttribute('shape');
  },
};

// 5. Polymorphism (The case you requested)
export const AsLink: Story = {
  args: {
    asChild: true,
    // Notice how we pass an <a> as the direct child.
    // The button will render an <a> tag with button styles.
    children: (
      <a href="https://google.com" target="_blank" rel="noreferrer">
        Go to Google
      </a>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Use `asChild` to render an `<a>` link while keeping the button styles.',
      },
    },
  },
};

// 5b. Minimal polymorphism: asChild + <a href> WITHOUT onClick/disabled/isLoading, the most
// innocent use possible. It's exactly the shape that broke `next build` in 0.4.2 and earlier
// ("Error: Event handlers cannot be passed to Client Component props", pointing to
// onClick: function onClick) because handleClick was built anyway inside the asChild branch
// and attached as onClick={handleClick} to Slot without any prop preventing it. This
// story can't reproduce the RSC boundary itself (it runs client-side through vitest-browser);
// that part is checked in a real `next build` (see CHANGELOG.md [0.4.3]), but it covers that
// adding 'use client' didn't break the normal behavior of this case.
export const AsChildMinimal: Story = {
  args: {
    asChild: true,
    children: <a href="/">Ir</a>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Ir' });

    await expect(link).toHaveAttribute('href', '/');
    await expect(link).not.toHaveAttribute('aria-disabled', 'true');

    // Without its own handler, a normal click must not throw or block anything. We intercept the
    // real navigation at the test level (not the Button's: its props are still exactly
    // asChild + children) because in vitest-browser a real href navigates the runner's page
    // and drops the connection.
    link.addEventListener('click', (event) => event.preventDefault());
    await userEvent.click(link);
  },
};

// 6. Polymorphism + isLoading: covers the 3 fixes from the audit on asChild.
// We use the same real href as AsLink: since the fix is precisely the preventDefault
// before the browser navigates, the test never gets to open the URL.
export const AsLinkLoading: Story = {
  args: {
    asChild: true,
    isLoading: true,
    onClick: fn(),
    children: (
      <a href="https://google.com" target="_blank" rel="noreferrer">
        Go to Google
      </a>
    ),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    // aria-disabled doesn't remove the element's role="link" in the accessibility tree.
    const link = canvas.getByRole('link', { name: 'Go to Google' });

    await expect(link).toHaveAttribute('aria-disabled', 'true');
    await expect(link.className.split(' ')).toContain('pointer-events-none');

    // The vitest-browser fixture doesn't expose styles derived from Tailwind utilities through
    // getComputedStyle (same issue documented in the Destructive story), so the assertion
    // stays on the class; it was checked by hand in Storybook with a real browser that opacity
    // computes to 0.5 when aria-disabled="true".
    await expect(link.className.split(' ')).toContain('aria-disabled:opacity-50');

    // Slottable fix: the spinner must not disappear when the child is an <a> (asChild).
    await expect(link.querySelector('svg.animate-spin')).toBeInTheDocument();

    // preventDefault fix: the click must not fire the consumer's onClick
    // or navigate (pointer-events-none already blocks it at the visual/click level).
    await userEvent.click(link);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

// Focus ring offset: by default it takes the theme background color (base-100, base rule
// in tailwind.css). On another surface, an explicit ring-offset-<color> wins over that
// rule. The real color with keyboard focus in both themes was checked in Storybook with a
// real browser.
export const FocusRingOnSurface: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button>Sobre la página</Button>
      <div className="rounded-box bg-base-200 p-4">
        <Button className="focus-visible:ring-offset-base-200">Sobre base-200</Button>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Sobre la página' });
    const offsetColor = () =>
      getComputedStyle(button).getPropertyValue('--tw-ring-offset-color').trim();

    // Dark mode (without a .dark container in the render: :root:has(.dark) would darken the whole
    // story). Without the base rule, the value would be Tailwind's initial-value (#fff).
    await expect(readInTheme('dark', offsetColor)).toBe('#141414');
    await expect(readInTheme('light', offsetColor)).toBe('#ffffff');

    await expect(canvas.getByRole('button', { name: 'Sobre base-200' })).toHaveClass(
      'focus-visible:ring-offset-base-200',
    );
  },
};
