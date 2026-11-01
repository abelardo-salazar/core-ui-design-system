import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fireEvent, fn, userEvent, within } from 'storybook/test';
import { QuantityStepper, type QuantityStepperProps } from './QuantityStepper';

// QuantityStepper is controlled (no internal state of its own except the uncontrolled fallback):
// the consumer handles value/onChange, as one would in a real app. Same pattern as
// ControlledDatePicker in DatePicker.stories.tsx.
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

// 1. Uncontrolled: only defaultValue, no value/onChange; the consumer handles no state.
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

    // Touch target: the buttons inherit Button's size="icon" (44x44). The input stays
    // aligned in height because Input md already measures 44px on its own (same family of
    // form controls as Button/Select); there's no longer any need to override it with a one-off
    // className as before that shared scale. The vitest-browser fixture doesn't apply
    // Tailwind's utility CSS (same issue documented in Button's Destructive story), so the
    // assertion is on the classes; the real pixel size and the visual alignment were
    // checked by hand in Storybook, A/B against main.
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

// 2. Controlled: value + onChange, step other than 1. The wrapper feeds value back with what
// onChange returns, as a real consumer would, so the full round trip is exercised, not just
// that the callback fires.
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

// 3. At max: the "+" button is disabled (a real disabled prop, not a no-op) and doesn't fire onChange.
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

// 4. At min: the "-" button is disabled and doesn't fire onChange.
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

// 5. Typing an out-of-range value directly in the input clamps it (not just the buttons).
// Uncontrolled on purpose: the clamping must show on its own, without relying on a parent
// feeding `value` back from `onChange` (see ControlledStepper above).
//
// fireEvent.change (not userEvent.clear/type) because <input type="number"> doesn't support
// setSelectionRange/select() in Chromium; userEvent.clear() depends on that API and silently
// fails there, leaving the previous value intact. fireEvent.change sets the whole value at
// once, exercising the same onChange a real typing would fire, without that problem.
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

// 6. disabled: none of the three controls responds.
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

// 7. Custom labels: decrementLabel/incrementLabel replace the accessible name of the
// buttons and don't reach the input as attributes.
export const CustomLabels: Story = {
  args: {
    defaultValue: 2,
    min: 0,
    max: 10,
    decrementLabel: 'Disminuir cantidad',
    incrementLabel: 'Aumentar cantidad',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Aumentar cantidad' }));
    await expect(canvas.getByRole('spinbutton')).toHaveValue(3);
    await userEvent.click(canvas.getByRole('button', { name: 'Disminuir cantidad' }));
    await expect(canvas.getByRole('spinbutton')).toHaveValue(2);

    const defaultIncrement = canvas.queryByRole('button', { name: 'Increase quantity' });
    await expect(defaultIncrement).not.toBeInTheDocument();
    const input = canvas.getByRole('spinbutton');
    await expect(input).not.toHaveAttribute('decrementlabel');
    await expect(input).not.toHaveAttribute('incrementlabel');
  },
};
