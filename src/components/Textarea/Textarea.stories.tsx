import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { Textarea } from './Textarea';
import { rootTokenIn } from '../../../.storybook/rootTheme';

const meta: Meta<typeof Textarea> = {
  title: 'Components/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
  },
  // Decorator to give the container a fixed width in Storybook
  decorators: [
    (Story) => (
      <div className="w-87.5">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Textarea>;

// 1. Default
export const Default: Story = {
  args: {
    label: 'Bio',
    placeholder: 'Tell us about yourself...',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByPlaceholderText('Tell us about yourself...');
    // Same "resting" surface as Input, for visual consistency between both fields.
    await expect(textarea.className.split(' ')).toContain('bg-base-100');
  },
};

// 2. With Error
export const WithError: Story = {
  args: {
    label: 'Comment',
    defaultValue: 'Too short',
    error: 'El comentario debe tener al menos 20 caracteres.',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const label = canvas.getByText('Comment');
    // text-error (#ef4444) gives 3.76:1 on white, not enough for AA (4.5:1).
    // text-error-focus (--palette-red-dark) does pass. The vitest-browser fixture doesn't expose
    // the --color-* variables derived by @theme through getComputedStyle, so it's tested
    // against the raw custom property (--error-focus) plus the classes that use it.
    await expect(label.className.split(' ')).toContain('text-error-focus');
    await expect(label.className.split(' ')).not.toContain('text-base-content');
    await expect(rootTokenIn('light', '--error-focus')).toBe('#b91c1c');

    const errorMessage = canvas.getByText('El comentario debe tener al menos 20 caracteres.');
    await expect(errorMessage.className.split(' ')).toContain('text-error-focus');
    await expect(errorMessage.className.split(' ')).not.toContain('animate-pulse');
  },
};

// 3. With Helper Text
export const WithHelperText: Story = {
  args: {
    label: 'Description',
    helperText: 'Máximo 500 caracteres.',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const helper = canvas.getByText('Máximo 500 caracteres.');
    // /50 gave 3.09:1 on white, not enough. /65 does pass 4.5:1.
    await expect(helper.className.split(' ')).toContain('text-base-content/65');
  },
};

// 4. Disabled
export const Disabled: Story = {
  args: {
    label: 'Notes',
    value: 'No editable',
    disabled: true,
  },
};
