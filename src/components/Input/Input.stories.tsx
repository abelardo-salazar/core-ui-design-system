import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
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
    // The field must use the DS "resting" surface, not the hover/state tone.
    await expect(input.className.split(' ')).toContain('bg-base-100');
  },
};

// 2. With Error
export const WithError: Story = {
  args: {
    label: 'Username',
    defaultValue: 'admin',
    error: 'Este nombre de usuario ya está en uso.',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const label = canvas.getByText('Username');
    // text-error (#ef4444) gives 3.76:1 on white, not enough for AA (4.5:1).
    // text-error-focus (--palette-red-dark) does pass. The vitest-browser fixture doesn't expose
    // the --color-* variables derived by @theme through getComputedStyle, so it's tested
    // against the raw custom property (--error-focus) plus the classes that use it.
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

// 3. With Helper Text
export const WithHelperText: Story = {
  args: {
    label: 'Password',
    type: 'password',
    helperText: 'Debe tener al menos 8 caracteres.',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const helper = canvas.getByText('Debe tener al menos 8 caracteres.');
    // /50 gave 3.09:1 on white, not enough. /65 does pass 4.5:1.
    await expect(helper.className.split(' ')).toContain('text-base-content/65');
  },
};

// 4. With Icons
export const WithIcons: Story = {
  args: {
    label: 'Search',
    placeholder: 'Search products...',
    // Simulated SVG icon
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
  play: async ({ canvasElement }) => {
    // The icons are decorative: their container isn't announced.
    const svg = canvasElement.querySelector('svg');
    await expect(svg?.parentElement).toHaveAttribute('aria-hidden', 'true');
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

// 6. Clearable (uncontrolled): the button clears the field through a native event, so the
// consumer's onChange runs just as if the user had deleted by hand.
export const Clearable: Story = {
  args: {
    label: 'Search',
    placeholder: 'Search products...',
    defaultValue: 'zapatillas',
    clearable: true,
    onChange: fn(),
    onClear: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Search') as HTMLInputElement;
    const button = canvas.getByRole('button', { name: 'Clear' });

    // Visibility through CSS only: the input is the peer and the button hides with :placeholder-shown.
    // The headless fixture doesn't apply Tailwind; the real hiding is checked in Storybook.
    await expect(input.className.split(' ')).toContain('peer');
    await expect(button.className.split(' ')).toContain('peer-placeholder-shown:hidden');
    await expect(button).toHaveAttribute('type', 'button');
    // Right padding = button width (md = 44px), not endIcon's pr-10!.
    await expect(input.className.split(' ')).toContain('pr-11');
    await expect(input.className.split(' ')).not.toContain('pr-10!');
    // The component's own props don't reach the DOM.
    await expect(input).not.toHaveAttribute('clearable');
    await expect(input).not.toHaveAttribute('clearlabel');

    await userEvent.click(button);
    await expect(input.value).toBe('');
    await expect(args.onChange).toHaveBeenCalledTimes(1);
    await expect(args.onClear).toHaveBeenCalledTimes(1);
    await expect(document.activeElement).toBe(input);
  },
};

function ControlledClearable({ onChange, onClear }: { onChange: () => void; onClear: () => void }) {
  const [value, setValue] = React.useState('zapatillas');
  return (
    <Input
      label="Search"
      clearable
      clearLabel="Limpiar búsqueda"
      size="sm"
      value={value}
      onChange={(event) => {
        onChange();
        setValue(event.target.value);
      }}
      onClear={onClear}
    />
  );
}

// 7. Controlled clearable: the consumer's state is cleared by its own onChange.
export const ClearableControlled: Story = {
  args: { onChange: fn(), onClear: fn() },
  render: (args) => (
    <ControlledClearable
      onChange={args.onChange as () => void}
      onClear={args.onClear as () => void}
    />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Search') as HTMLInputElement;
    // Without a consumer placeholder, " " is set so :placeholder-shown exists.
    await expect(input).toHaveAttribute('placeholder', ' ');
    await expect(input.className.split(' ')).toContain('pr-8');

    await userEvent.click(canvas.getByRole('button', { name: 'Limpiar búsqueda' }));
    await expect(args.onChange).toHaveBeenCalledTimes(1);
    await expect(args.onClear).toHaveBeenCalledTimes(1);
    await expect(input.value).toBe('');
    await expect(document.activeElement).toBe(input);
  },
};

// 8. Clearable with type="search" in lg: the native ✕ is hidden so it isn't duplicated.
export const ClearableSearch: Story = {
  args: {
    label: 'Search',
    type: 'search',
    size: 'lg',
    defaultValue: 'zapatillas',
    clearable: true,
  },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByLabelText('Search');
    await expect(input.className.split(' ')).toContain(
      '[&::-webkit-search-cancel-button]:appearance-none',
    );
    await expect(input.className.split(' ')).toContain('pr-12');
  },
};

// 9. No button with disabled or readOnly.
export const ClearableDisabledReadOnly: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Input label="Disabled" defaultValue="x" clearable disabled />
      <Input label="Read only" defaultValue="x" clearable readOnly />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button', { name: 'Clear' })).toBeNull();
    for (const label of ['Disabled', 'Read only']) {
      const input = canvas.getByLabelText(label);
      await expect(input.className.split(' ')).not.toContain('pr-11');
      await expect(input.className.split(' ')).not.toContain('peer');
    }
  },
};
