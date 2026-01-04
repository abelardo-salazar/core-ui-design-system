import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

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
