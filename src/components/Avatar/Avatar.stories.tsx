import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, waitFor, within } from 'storybook/test';
import { Avatar, AvatarImage, AvatarFallback } from './Avatar';
import { Badge } from '../Badge';
import { rootTokenIn } from '../../../.storybook/rootTheme';

const meta: Meta<typeof Avatar> = {
  title: 'Components/DataDisplay',
  component: Avatar,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Avatar>;

// Embedded 1x1 PNG: no dependency on an external network or on Storybook serving a
// local file correctly (same criterion applied in Image.stories.tsx). UserProfile and
// UserCard used https://github.com/shadcn.png and https://github.com/google.png respectively,
// the cause of the flake reported during the Tabs task.
const TINY_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

// 1. Avatar
export const UserProfile: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar>
        <AvatarImage src={TINY_PNG} alt="@shadcn" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="text-sm font-bold">Shadcn</span>
        <span className="text-xs text-base-content">Creator</span>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Fix from commit 8dd5b87 (axe: image-alt). Radix AvatarImage only mounts the <img> once
    // the load resolves, hence the async find* (see UserCard below for the same pattern).
    await expect(await canvas.findByAltText('@shadcn')).toBeInTheDocument();
  },
};

// 2. Fallback after a load error. The src is a data URI that can't be decoded: it fails
// in the browser, without requesting anything from the server (in vitest, a missing path
// doesn't give a 404 but the server's fallback HTML, with a timing that depends on how busy
// it is).
export const FallbackState: StoryObj<typeof AvatarImage> = {
  args: { onLoadingStatusChange: fn() },
  render: (args) => (
    <div className="flex items-center gap-4">
      <Avatar>
        <AvatarImage
          src="data:image/png;base64,AAAA"
          alt="@user"
          onLoadingStatusChange={args.onLoadingStatusChange}
        />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
      <span className="text-sm">John Doe (No image)</span>
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // AvatarFallback also shows while the image loads, so seeing it proves nothing on
    // its own: first we wait for Radix to report the error.
    await waitFor(() => expect(args.onLoadingStatusChange).toHaveBeenLastCalledWith('error'));
    await expect(canvas.queryByAltText('@user')).not.toBeInTheDocument();
    await expect(canvas.getByText('JD')).toBeInTheDocument();
  },
};

// 3. Badges Showcase
export const Badges: Story = {
  render: () => (
    <div className="flex gap-2">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      {/* interactive: true; the hover (compoundVariants) only exists when the badge is
          interactive; without it there would be no hover: class to check below. */}
      <Badge variant="destructive" interactive>
        Removed
      </Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const destructiveBadge = canvas.getByText('Removed');
    // Same error-content token as Button destructive (see Button.stories.tsx for why
    // we check the raw custom property instead of getComputedStyle().color here).
    await expect(destructiveBadge.className.split(' ')).toContain('text-error-content');
    await expect(rootTokenIn('light', '--error-content')).toBe('#000000');

    // Hover: same case as Button destructive; --error-focus (background) is dark while
    // --error (base background) is light, so the text needs its own -focus-content.
    await expect(destructiveBadge.className.split(' ')).toContain('hover:text-error-focus-content');
    await expect(rootTokenIn('light', '--error-focus-content')).toBe('#ffffff');

    // Dark mode flips which color needs more contrast (--error-focus becomes a light
    // red), so --error-focus-content flips too: black, not white.
    await expect(rootTokenIn('dark', '--error-focus-content')).toBe('#000000');
  },
};

// 4. Real integration (Card + Avatar + Badge)
import { Card, CardHeader, CardTitle } from '../Card';

export const UserCard: Story = {
  render: () => (
    <Card className="w-75">
      <CardHeader className="flex-row gap-4 items-center space-y-0">
        <Avatar className="h-12 w-12">
          <AvatarImage src={TINY_PNG} alt="Google Team logo" />
          <AvatarFallback>GL</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1">
          <CardTitle className="text-base">Google Team</CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-[10px] px-1 py-0 h-5">
              Enterprise
            </Badge>
            <Badge className="text-[10px] px-1 py-0 h-5">Pro</Badge>
          </div>
        </div>
      </CardHeader>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // axe: image-alt; AvatarImage was rendered without alt (the other two Avatar stories do pass it).
    // AvatarImage (Radix) only mounts the <img> once the network load resolves, hence the async find*.
    await expect(await canvas.findByAltText('Google Team logo')).toBeInTheDocument();
  },
};
