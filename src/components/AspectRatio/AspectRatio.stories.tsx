import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { AspectRatio } from './AspectRatio';
import { Image } from '../Image';

const meta: Meta<typeof AspectRatio> = {
  title: 'Components/AspectRatio',
  component: AspectRatio,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof AspectRatio>;

// Embedded 1x1 PNG: no dependency on an external network (same value already used in
// Image.stories.tsx and Avatar.stories.tsx). Here the risk was more direct than in those two
// cases: Image (the DS's own, not Radix's AvatarImage) unmounts itself if loading
// fails and there's no fallback, and the play below uses getByAltText without find*/waitFor;
// an external network failure would have made that synchronous assert miss the <img>.
const TINY_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

// 1. Pure ratio: checks the real mechanism (the padding-bottom % that the Radix primitive
// itself computes from ratio), not a live layout measurement; getBoundingClientRect in
// vitest-browser's headless runner may not reflect the padding-bottom trick yet when
// play() runs (unlike Storybook's real browser, where it was checked
// visually: the resulting box is 16:9). The inline padding-bottom is what actually
// drives the layout in any standard browser, so it's the most stable check.
export const Default: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <AspectRatio ratio={16 / 9}>
        <div className="h-full w-full bg-primary" data-testid="ratio-content" />
      </AspectRatio>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const content = canvas.getByTestId('ratio-content');

    const wrapper = canvasElement.querySelector<HTMLElement>('[data-radix-aspect-ratio-wrapper]');
    await expect(wrapper).toBeInTheDocument();
    await expect(parseFloat(wrapper!.style.paddingBottom)).toBeCloseTo(100 / (16 / 9), 1);
    await expect(wrapper!.style.width).toBe('100%');

    // The content passed as children lands in the absolute inset-0 div that Radix puts inside
    // the wrapper; confirms the composition wires the child in the right place.
    await expect(wrapper).toContainElement(content);
  },
};

// 2. AspectRatio + Image: two separate components that compose together, not a single API
// with a ratio prop; same criterion as Popover/Calendar and Popover/DatePicker.
export const WithImage: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <AspectRatio ratio={16 / 9}>
        <Image src={TINY_PNG} alt="Cover photo" />
      </AspectRatio>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const img = canvas.getByAltText('Cover photo');

    const wrapper = canvasElement.querySelector<HTMLElement>('[data-radix-aspect-ratio-wrapper]');
    await expect(wrapper).toBeInTheDocument();
    await expect(wrapper).toContainElement(img);
    await expect(parseFloat(wrapper!.style.paddingBottom)).toBeCloseTo(100 / (16 / 9), 1);
  },
};
