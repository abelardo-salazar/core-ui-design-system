import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { CheckboxField } from './CheckboxField';

const meta: Meta<typeof CheckboxField> = {
  title: 'Components/CheckboxField',
  component: CheckboxField,
  parameters: { layout: 'centered' },
  render: (args) => (
    <div className="w-72">
      <CheckboxField {...args} />
    </div>
  ),
};

export default meta;
type Story = StoryObj<typeof CheckboxField>;

// 1. Row: the control keeps its real role, named only by the label; the description goes through
// aria-describedby. Control first and text last.
export const Default: Story = {
  args: {
    label: 'Acepto los términos',
    description: 'Puedes retirar tu consentimiento cuando quieras',
    onCheckedChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByRole('checkbox', { name: 'Acepto los términos' });
    await expect(control).toHaveAccessibleDescription(
      'Puedes retirar tu consentimiento cuando quieras',
    );

    const row = control.closest('label');
    await expect(row).toHaveAttribute('for', control.id);
    await expect(row?.className.split(' ')).toContain('min-h-12');
    await expect(row?.firstElementChild).toBe(control);

    // Each part of the row toggles once.
    await userEvent.click(canvas.getByText('Acepto los términos'));
    await expect(args.onCheckedChange).toHaveBeenCalledTimes(1);
    await expect(control).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(canvas.getByText('Puedes retirar tu consentimiento cuando quieras'));
    await expect(args.onCheckedChange).toHaveBeenCalledTimes(2);
    await userEvent.click(control);
    await expect(args.onCheckedChange).toHaveBeenCalledTimes(3);
    await expect(control).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(args.onCheckedChange).toHaveBeenCalledTimes(4);
  },
};

// 2. The props of Checkbox pass through, including the indeterminate state.
export const Indeterminate: Story = {
  args: { label: 'Todos', checked: 'indeterminate' },
  play: async ({ canvasElement }) => {
    const control = within(canvasElement).getByRole('checkbox', { name: 'Todos' });
    await expect(control).toHaveAttribute('aria-checked', 'mixed');
    await expect(control).not.toHaveAttribute('aria-describedby');
  },
};

// 3. Disabled: nothing toggles from any part of the row, and the description, which holds the
// reason, isn't dimmed.
export const Disabled: Story = {
  args: {
    label: 'Envío gratis',
    description: 'Disponible en compras desde $50',
    disabled: true,
    onCheckedChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByRole('checkbox', { name: 'Envío gratis' });
    await expect(control).toBeDisabled();
    await expect(control).toHaveAccessibleDescription('Disponible en compras desde $50');

    await userEvent.click(canvas.getByText('Envío gratis'), { pointerEventsCheck: 0 });
    await expect(args.onCheckedChange).not.toHaveBeenCalled();

    await expect(canvas.getByText('Envío gratis')).toHaveClass('opacity-50');
    await expect(canvas.getByText('Disponible en compras desde $50')).not.toHaveClass('opacity-50');
  },
};

function FormDemo() {
  const [count, setCount] = React.useState(0);
  const [submitted, setSubmitted] = React.useState('');
  return (
    <form
      className="w-72"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(String(new FormData(event.currentTarget).get('terminos')));
      }}
    >
      <CheckboxField
        name="terminos"
        value="si"
        label="Términos"
        description="En un formulario"
        onCheckedChange={() => setCount((current) => current + 1)}
      />
      <p>
        Cambios: <output data-testid="count">{count}</output>
      </p>
      <p>
        Enviado: <output data-testid="submitted">{submitted}</output>
      </p>
      <button type="submit">Enviar</button>
    </form>
  );
}

// 4. Inside a <form>, Radix adds a hidden input whose bubbled click reaches the <label>: it must
// not toggle twice. The value reaches FormData.
export const InForm: Story = {
  render: () => <FormDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const count = canvas.getByTestId('count');
    await userEvent.click(canvas.getByText('Términos'));
    await expect(count).toHaveTextContent('1');
    await expect(canvas.getByRole('checkbox', { name: 'Términos' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Términos' }));
    await expect(count).toHaveTextContent('2');
    await userEvent.click(canvas.getByText('Términos'));
    await expect(count).toHaveTextContent('3');

    await userEvent.click(canvas.getByRole('button', { name: 'Enviar' }));
    await expect(canvas.getByTestId('submitted')).toHaveTextContent('si');
  },
};
