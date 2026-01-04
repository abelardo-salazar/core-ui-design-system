import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'radio',
      options: ['sm', 'md', 'lg'],
    },
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
type Story = StoryObj<typeof Input>;

// 1. Default
export const Default: Story = {
  args: {
    label: 'Email',
    placeholder: 'name@example.com',
    type: 'email',
  },
};

// 2. Con Error
export const WithError: Story = {
  args: {
    label: 'Username',
    defaultValue: 'admin',
    error: 'Este nombre de usuario ya está en uso.',
  },
};

// 3. Con Helper Text
export const WithHelperText: Story = {
  args: {
    label: 'Password',
    type: 'password',
    helperText: 'Debe tener al menos 8 caracteres.',
  },
};

// 4. Con Iconos
export const WithIcons: Story = {
  args: {
    label: 'Search',
    placeholder: 'Search products...',
    // Simulación de icono SVG
    startIcon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
        />
      </svg>
    ),
  },
};

// 5. Disabled
export const Disabled: Story = {
  args: {
    label: 'API Key',
    value: 'sk-123456789',
    disabled: true,
  },
};
