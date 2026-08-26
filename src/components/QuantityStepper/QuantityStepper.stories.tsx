import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fireEvent, fn, userEvent, within } from 'storybook/test';
import { QuantityStepper, type QuantityStepperProps } from './QuantityStepper';

// QuantityStepper es controlado (sin estado interno propio salvo el fallback no controlado):
// el consumidor maneja value/onChange, igual que se haría en una app real. Mismo patrón que
// ControlledDatePicker en DatePicker.stories.tsx.
function ControlledStepper(props: QuantityStepperProps) {
  const [value, setValue] = React.useState(props.value);
  return (
    <QuantityStepper
      {...props}
      value={value}
      onChange={(next) => {
        setValue(next);
        props.onChange?.(next);
      }}
    />
  );
}

const meta: Meta<typeof QuantityStepper> = {
  title: 'Components/QuantityStepper',
  component: QuantityStepper,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof QuantityStepper>;

// 1. No controlado: solo defaultValue, sin value/onChange — el consumidor no maneja estado.
export const Uncontrolled: Story = {
  args: {
    defaultValue: 3,
    min: 0,
    max: 10,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('spinbutton');
    await expect(input).toHaveValue(3);

    // Touch target: hereda el size="icon" de Button, ahora 44x44 (antes 40x40) — regresión
    // para el único consumidor real de size="icon" en el repo. El input se sube a h-11 acá
    // puntualmente para quedar alineado en altura con los botones. El fixture de
    // vitest-browser no aplica el CSS de utilidades de Tailwind (mismo issue documentado en
    // el story Destructive de Button), así que la aserción va sobre las clases; el tamaño
    // real en píxeles y la alineación visual se verificaron a mano en Storybook.
    const incrementButton = canvas.getByRole('button', { name: 'Increase quantity' });
    await expect(incrementButton.className.split(' ')).toEqual(
      expect.arrayContaining(['h-11', 'w-11']),
    );
    await expect(input.className.split(' ')).toContain('h-11');

    await userEvent.click(canvas.getByRole('button', { name: 'Increase quantity' }));
    await expect(input).toHaveValue(4);

    await userEvent.click(canvas.getByRole('button', { name: 'Decrease quantity' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Decrease quantity' }));
    await expect(input).toHaveValue(2);
  },
};

// 2. Controlado: value + onChange, step distinto de 1. El wrapper realimenta value con lo
// que devuelve onChange, como haría un consumidor real — así se ejercita el ida y vuelta
// completo, no solo que se dispare el callback.
export const ControlledWithStep: Story = {
  args: {
    value: 5,
    min: 0,
    max: 10,
    step: 5,
    onChange: fn(),
  },
  render: (args) => <ControlledStepper {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('spinbutton');
    await expect(input).toHaveValue(5);

    await userEvent.click(canvas.getByRole('button', { name: 'Increase quantity' }));
    await expect(args.onChange).toHaveBeenLastCalledWith(10);
    await expect(input).toHaveValue(10);

    await userEvent.click(canvas.getByRole('button', { name: 'Decrease quantity' }));
    await expect(args.onChange).toHaveBeenLastCalledWith(5);
    await expect(input).toHaveValue(5);
  },
};

// 3. En max: el botón "+" se deshabilita (prop disabled real, no un no-op) y no dispara onChange.
export const AtMax: Story = {
  args: {
    value: 10,
    min: 0,
    max: 10,
    onChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const increment = canvas.getByRole('button', { name: 'Increase quantity' });
    const decrement = canvas.getByRole('button', { name: 'Decrease quantity' });

    await expect(increment).toBeDisabled();
    await expect(decrement).not.toBeDisabled();

    await userEvent.click(increment);
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

// 4. En min: el botón "-" se deshabilita y no dispara onChange.
export const AtMin: Story = {
  args: {
    value: 0,
    min: 0,
    max: 10,
    onChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const increment = canvas.getByRole('button', { name: 'Increase quantity' });
    const decrement = canvas.getByRole('button', { name: 'Decrease quantity' });

    await expect(decrement).toBeDisabled();
    await expect(increment).not.toBeDisabled();

    await userEvent.click(decrement);
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

// 5. Tipear directo en el input un valor fuera de rango lo clampea (no solo los botones).
// No controlado a propósito: el clamping debe reflejarse solo, sin depender de que un padre
// re-alimente `value` desde `onChange` (ver ControlledStepper arriba).
//
// fireEvent.change (no userEvent.clear/type) porque <input type="number"> no soporta
// setSelectionRange/select() en Chromium — userEvent.clear() depende de esa API y falla en
// silencio ahí, dejando el valor previo intacto. fireEvent.change fija el valor completo de
// una vez, ejercitando el mismo onChange que dispararía un tipeo real, sin ese problema.
export const TypedOutOfRangeClamps: Story = {
  args: {
    defaultValue: 5,
    min: 0,
    max: 10,
    onChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('spinbutton');

    fireEvent.change(input, { target: { value: '999' } });
    await expect(input).toHaveValue(10);
    await expect(args.onChange).toHaveBeenLastCalledWith(10);

    fireEvent.change(input, { target: { value: '-50' } });
    await expect(input).toHaveValue(0);
    await expect(args.onChange).toHaveBeenLastCalledWith(0);
  },
};

// 6. disabled: ninguno de los tres controles responde.
export const Disabled: Story = {
  args: {
    defaultValue: 5,
    min: 0,
    max: 10,
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Increase quantity' })).toBeDisabled();
    await expect(canvas.getByRole('button', { name: 'Decrease quantity' })).toBeDisabled();
    await expect(canvas.getByRole('spinbutton')).toBeDisabled();
  },
};
