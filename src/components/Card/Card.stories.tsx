import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './Card';
import { Button } from '../Button';
import { Input } from '../Input';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: {
    // Limits the width for better visualization in docs
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

// 1. Simple Card (Notification style)
export const Simple: Story = {
  render: () => (
    <Card className="w-87.5">
      <CardHeader>
        <CardTitle>Create project</CardTitle>
        <CardDescription>Deploy your new project in one-click.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-base-content/80">
          Your project will be deployed to the edge network instantly.
        </p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="ghost">Cancel</Button>
        <Button>Deploy</Button>
      </CardFooter>
    </Card>
  ),
};

// 2. Interactive Card (Login Form simulation)
export const LoginForm: Story = {
  render: () => (
    <Card className="w-95">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Enter your credentials to access the account.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input id="email" label="Email" placeholder="m@example.com" type="email" />
        </div>
        <div className="space-y-2">
          <Input id="password" label="Password" type="password" />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button fullWidth>Sign In</Button>
        <Button variant="link" size="sm" className="text-xs">
          Forgot password?
        </Button>
      </CardFooter>
    </Card>
  ),
};

// 3. Image Card (Blog Post style)
export const BlogPost: Story = {
  render: () => (
    <Card className="w-87.5 overflow-hidden">
      {/* Custom image directly inside Card (flexibility of compound components) */}
      <div className="h-48 w-full bg-neutral/10 flex items-center justify-center">
        <span className="text-4xl">🖼️</span>
      </div>
      <CardHeader>
        <CardTitle>Design Systems 101</CardTitle>
        <CardDescription>Learn how to build scalable UI libraries.</CardDescription>
      </CardHeader>
      <CardFooter>
        <Button variant="outline" fullWidth>
          Read Article
        </Button>
      </CardFooter>
    </Card>
  ),
};
