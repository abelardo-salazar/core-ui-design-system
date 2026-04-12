import type { Meta, StoryObj } from '@storybook/react';
import { Avatar, AvatarImage, AvatarFallback } from './Avatar';
import { Badge } from '../Badge';

const meta: Meta<typeof Avatar> = {
  title: 'Components/DataDisplay',
  component: Avatar,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Avatar>;

// 1. Avatar
export const UserProfile: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="text-sm font-bold">Shadcn</span>
        <span className="text-xs text-base-content">Creator</span>
      </div>
    </div>
  ),
};

// 2. Fallback
export const FallbackState: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar>
        <AvatarImage src="/broken-image.jpg" alt="@user" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
      <span className="text-sm">John Doe (No image)</span>
    </div>
  ),
};

// 3. Badges Showcase
export const Badges: Story = {
  render: () => (
    <div className="flex gap-2">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Removed</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
};

// 4. Integración Real (Card + Avatar + Badge)
import { Card, CardHeader, CardTitle } from '../Card';

export const UserCard: Story = {
  render: () => (
    <Card className="w-75">
      <CardHeader className="flex-row gap-4 items-center space-y-0">
        <Avatar className="h-12 w-12">
          <AvatarImage src="https://github.com/google.png" />
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
};
