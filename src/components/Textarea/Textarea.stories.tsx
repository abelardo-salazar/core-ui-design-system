import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { Textarea } from './Textarea';

const meta: Meta<typeof Textarea> = {
  title: 'Components/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
  },
  // Decorador para darle un ancho fijo al contenedor en Storybook
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
    // Misma superficie "en reposo" que Input, para consistencia visual entre ambos campos.
    await expect(textarea.className.split(' ')).toContain('bg-base-100');
  },
};

// 2. Con Error
export const WithError: Story = {
  args: {
    label: 'Comment',
    defaultValue: 'Too short',
    error: 'El comentario debe tener al menos 20 caracteres.',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const label = canvas.getByText('Comment');
    await expect(label.className.split(' ')).toContain('text-error');
    await expect(label.className.split(' ')).not.toContain('text-base-content');
  },
};

// 3. Con Helper Text
export const WithHelperText: Story = {
  args: {
    label: 'Description',
    helperText: 'Máximo 500 caracteres.',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const helper = canvas.getByText('Máximo 500 caracteres.');
    await expect(helper.className.split(' ')).toContain('text-base-content/50');
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
