import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText('name@example.com');
    // El campo debe usar la superficie "en reposo" del DS, no el tono de hover/estado.
    await expect(input.className.split(' ')).toContain('bg-base-100');
  },
};

// 2. Con Error
export const WithError: Story = {
  args: {
    label: 'Username',
    defaultValue: 'admin',
    error: 'Este nombre de usuario ya está en uso.',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const label = canvas.getByText('Username');
    // text-error (#ef4444) da 3.76:1 sobre blanco, insuficiente para AA (4.5:1).
    // text-error-focus (--palette-red-dark) sí cumple. El fixture de vitest-browser no expone
    // las variables --color-* derivadas por @theme vía getComputedStyle, así que se prueba
    // contra el custom property crudo (--error-focus) más las clases que lo consumen.
    await expect(label.className.split(' ')).toContain('text-error-focus');
    await expect(label.className.split(' ')).not.toContain('text-base-content');
    await expect(getComputedStyle(document.documentElement).getPropertyValue('--error-focus')).toBe(
      '#b91c1c',
    );

    const errorMessage = canvas.getByText('Este nombre de usuario ya está en uso.');
    await expect(errorMessage.className.split(' ')).toContain('text-error-focus');
    await expect(errorMessage.className.split(' ')).not.toContain('animate-pulse');

    const input = canvas.getByDisplayValue('admin');
    await expect(input.className.split(' ')).toContain('text-error-focus');
  },
};

// 3. Con Helper Text
export const WithHelperText: Story = {
  args: {
    label: 'Password',
    type: 'password',
    helperText: 'Debe tener al menos 8 caracteres.',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const helper = canvas.getByText('Debe tener al menos 8 caracteres.');
    // /50 daba 3.09:1 sobre blanco, insuficiente. /65 sí cumple 4.5:1.
    await expect(helper.className.split(' ')).toContain('text-base-content/65');
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
