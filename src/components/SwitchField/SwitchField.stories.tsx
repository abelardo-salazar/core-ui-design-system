import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { SwitchField } from './SwitchField';

const meta: Meta<typeof SwitchField> = {
  title: 'Components/SwitchField',
  component: SwitchField,
  parameters: { layout: 'centered' },
  render: (args) => (
    <div className="w-72">
      <SwitchField {...args} />
    </div>
  ),
};

export default meta;
type Story = StoryObj<typeof SwitchField>;

// 1. Row: the control keeps its real role, named only by the label; the description goes through
// aria-describedby. Text first and control last.
export const Default: Story = {
  args: {
    label: 'Notificaciones',
    description: 'Avisos de pedidos y entregas',
    onCheckedChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByRole('switch', { name: 'Notificaciones' });
    await expect(control).toHaveAccessibleDescription('Avisos de pedidos y entregas');
    await expect(control).toHaveAttribute('aria-checked', 'false');

    const row = control.closest('label');
    await expect(row).toHaveAttribute('for', control.id);
    await expect(row?.className.split(' ')).toContain('min-h-12');
    await expect(row?.lastElementChild).toBe(control);

    // Each part of the row toggles once.
    await userEvent.click(canvas.getByText('Notificaciones'));
    await expect(args.onCheckedChange).toHaveBeenCalledTimes(1);
    await expect(control).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(canvas.getByText('Avisos de pedidos y entregas'));
    await expect(args.onCheckedChange).toHaveBeenCalledTimes(2);
    await userEvent.click(control);
    await expect(args.onCheckedChange).toHaveBeenCalledTimes(3);
    await expect(control).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(args.onCheckedChange).toHaveBeenCalledTimes(4);
  },
};

// 2. Without description there is no aria-describedby. id, ref and the consumer's own
// aria-describedby are respected.
const refTarget = React.createRef<HTMLButtonElement>();
export const IdRefAndDescribedBy: Story = {
  render: () => (
    <div className="flex w-72 flex-col">
      <p id="external">Texto externo</p>
      <SwitchField label="Sin descripción" />
      <SwitchField
        id="propio"
        ref={refTarget}
        label="Con todo"
        description="Descripción"
        aria-describedby="external"
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('switch', { name: 'Sin descripción' })).not.toHaveAttribute(
      'aria-describedby',
    );

    const control = canvas.getByRole('switch', { name: 'Con todo' });
    await expect(control).toHaveAttribute('id', 'propio');
    await expect(refTarget.current).toBe(control);
    await expect(control).toHaveAccessibleDescription('Texto externo Descripción');
  },
};

// 3. Disabled: nothing toggles from any part of the row, and the description, which holds the
// reason, isn't dimmed.
export const Disabled: Story = {
  args: {
    label: 'Modo oscuro',
    description: 'No disponible en tu plan',
    disabled: true,
    onCheckedChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByRole('switch', { name: 'Modo oscuro' });
    await expect(control).toBeDisabled();
    await expect(control).toHaveAccessibleDescription('No disponible en tu plan');
    await expect(control.closest('label')?.className.split(' ')).toContain('cursor-not-allowed');

    await userEvent.click(canvas.getByText('Modo oscuro'), { pointerEventsCheck: 0 });
    await expect(args.onCheckedChange).not.toHaveBeenCalled();

    await expect(canvas.getByText('Modo oscuro')).toHaveClass('opacity-50');
    await expect(canvas.getByText('No disponible en tu plan')).not.toHaveClass('opacity-50');
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
        setSubmitted(String(new FormData(event.currentTarget).get('avisos')));
      }}
    >
      <SwitchField
        name="avisos"
        value="si"
        label="Avisos"
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
    await userEvent.click(canvas.getByText('Avisos'));
    await expect(count).toHaveTextContent('1');
    await expect(canvas.getByRole('switch', { name: 'Avisos' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await userEvent.click(canvas.getByRole('switch', { name: 'Avisos' }));
    await expect(count).toHaveTextContent('2');
    await userEvent.click(canvas.getByText('Avisos'));
    await expect(count).toHaveTextContent('3');

    await userEvent.click(canvas.getByRole('button', { name: 'Enviar' }));
    await expect(canvas.getByTestId('submitted')).toHaveTextContent('si');
  },
};
