import type { Meta, StoryObj } from '@storybook/react';
import { expect } from 'storybook/test';
import { Skeleton } from './Skeleton';
// We assume these components already exist from Phase 1
import { Card, CardContent, CardFooter, CardHeader } from '../Card';
import { rootTokenIn } from '../../../.storybook/rootTheme';

const meta = {
  title: 'Components/Feedback/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

// 1. Basic use (Primitive)
export const Default: Story = {
  args: {
    className: 'w-[100px] h-[20px] rounded-full',
  },
  play: async ({ canvasElement }) => {
    const skeleton = canvasElement.querySelector('.animate-pulse') as HTMLElement;
    await expect(skeleton).toBeInTheDocument();
    await expect(skeleton.className.split(' ')).toContain('bg-base-300');

    // Regression: dark:bg-slate-200 ended up identical to light mode. bg-base-300 depends on
    // --base-300, which does change between themes. The vitest-browser fixture doesn't expose styles
    // derived from Tailwind utilities through getComputedStyle (same issue documented in
    // Button's Destructive story), so the assertion is on the raw token defined
    // directly on :root / .dark, which is visible.
    const lightValue = rootTokenIn('light', '--base-300');
    const darkValue = rootTokenIn('dark', '--base-300');

    await expect(darkValue.trim()).not.toBe(lightValue.trim());
  },
};

// 2. Loading Card Pattern (Best Practice)
// We use the real Card structure so the layout doesn't jump when the data loads.
export const LoadingCard: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader className="gap-2">
        {/* Simulated title */}
        <Skeleton className="h-6 w-1/2" />
        {/* Simulated description */}
        <Skeleton className="h-4 w-4/5" />
      </CardHeader>

      <CardContent>
        {/* Simulated content or image block */}
        <Skeleton className="h-[150px] w-full rounded-md" />
      </CardContent>

      <CardFooter>
        {/* Simulated button */}
        <Skeleton className="h-11 w-28" />
      </CardFooter>
    </Card>
  ),
};

// 3. Loading List Pattern
export const AvatarList: Story = {
  render: () => (
    <div className="flex flex-col space-y-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      ))}
    </div>
  ),
};
