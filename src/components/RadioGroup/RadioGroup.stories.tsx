import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { RadioCard, RadioGroup, RadioGroupItem } from './RadioGroup';

const meta: Meta<typeof RadioGroup> = {
  title: 'Components/RadioGroup',
  component: RadioGroup,
  parameters: { layout: 'centered' },
  args: { label: 'Envío', onValueChange: fn() },
  render: (args) => (
    <div className="w-80">
      <RadioGroup {...args}>
        <RadioGroupItem value="normal" label="Normal" description="De 3 a 5 días" />
        <RadioGroupItem value="express" label="Express" disabled description="No disponible hoy" />
        <RadioGroupItem value="retiro" label="Retiro en tienda" />
      </RadioGroup>
    </div>
  ),
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

const classesOf = (element: Element) => element.className.split(/\s+/);

// Radix moves the focus in a setTimeout and selects on focus only while the arrow is still down.
// A person holds the key that long; userEvent releases it at once, so hold it until focus moves.
const pressArrow = async (key: string, target: HTMLElement) => {
  await userEvent.keyboard(`{${key}>}`);
  await waitFor(() => expect(target).toHaveFocus());
  await userEvent.keyboard(`{/${key}}`);
};

// 1. Named by its label through aria-labelledby. Arrows move and select within the group, skip
// the disabled item and loop. Clicking the checked radio doesn't deselect it.
export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('radiogroup', { name: 'Envío' });
    await expect(group).toHaveAttribute('aria-labelledby');
    await expect(group).not.toHaveAttribute('aria-invalid');
    const normal = canvas.getByRole('radio', { name: 'Normal' });
    const express = canvas.getByRole('radio', { name: 'Express' });
    const retiro = canvas.getByRole('radio', { name: 'Retiro en tienda' });
    await expect(normal).toHaveAccessibleDescription('De 3 a 5 días');
    await expect(express).toBeDisabled();
    await expect(express).toHaveAccessibleDescription('No disponible hoy');
    await expect(classesOf(normal)).toContain('focus-visible:ring-primary');

    await userEvent.tab();
    await expect(normal).toHaveFocus();
    await pressArrow('ArrowDown', retiro);
    await expect(retiro).toBeChecked();
    await expect(args.onValueChange).toHaveBeenLastCalledWith('retiro');
    await pressArrow('ArrowDown', normal);
    await expect(normal).toBeChecked();
    await pressArrow('ArrowUp', retiro);
    await expect(retiro).toBeChecked();
    await expect(express).not.toBeChecked();

    // No deselection: neither the radio nor its row's label.
    const calls = (args.onValueChange as ReturnType<typeof fn>).mock.calls.length;
    await userEvent.click(retiro);
    await userEvent.click(canvas.getByText('Retiro en tienda'));
    await expect(retiro).toBeChecked();
    await expect(args.onValueChange).toHaveBeenCalledTimes(calls);

    // The row selects through its label.
    await userEvent.click(canvas.getByText('Normal'));
    await expect(normal).toBeChecked();
    // A click on the disabled one does nothing.
    await userEvent.click(canvas.getByText('Express'));
    await expect(normal).toBeChecked();
  },
};

// 2. Same pattern as Input: aria-invalid and aria-describedby to the error, which takes the
// place of helperText. The consumer's own description is kept.
export const WithError: Story = {
  args: {
    error: 'Elige un método de envío',
    helperText: 'Se cobra al confirmar',
    'aria-describedby': 'external',
  },
  render: (args) => (
    <div className="w-80">
      <p id="external">Solo en Lima</p>
      <RadioGroup {...args}>
        <RadioGroupItem value="normal" label="Normal" />
        <RadioGroupItem value="retiro" label="Retiro en tienda" />
      </RadioGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('radiogroup', { name: 'Envío' });
    await expect(group).toHaveAttribute('aria-invalid', 'true');
    await expect(group).toHaveAccessibleDescription('Solo en Lima Elige un método de envío');
    await expect(canvas.queryByText('Se cobra al confirmar')).toBeNull();
    await expect(canvas.getByText('Elige un método de envío').className).toBe(
      'text-xs text-error-focus font-medium',
    );
    await expect(canvas.getByText('Envío')).toHaveClass('text-error-focus');
  },
};

// 3. helperText describes the group; aria-label instead of a visible label.
export const WithHelperText: Story = {
  args: { label: undefined, 'aria-label': 'Envío', helperText: 'Se cobra al confirmar' },
  play: async ({ canvasElement }) => {
    const group = within(canvasElement).getByRole('radiogroup', { name: 'Envío' });
    await expect(group).not.toHaveAttribute('aria-labelledby');
    await expect(group).toHaveAccessibleDescription('Se cobra al confirmar');
  },
};

// 4. orientation goes to Radix: horizontal layout, and the horizontal arrows navigate.
export const Horizontal: Story = {
  args: { orientation: 'horizontal', defaultValue: 'normal' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('radiogroup');
    await expect(group).toHaveAttribute('aria-orientation', 'horizontal');
    await expect(classesOf(group)).toContain('flex-row');
    await userEvent.tab();
    await expect(canvas.getByRole('radio', { name: 'Normal' })).toHaveFocus();
    const retiro = canvas.getByRole('radio', { name: 'Retiro en tienda' });
    await pressArrow('ArrowRight', retiro);
    await expect(retiro).toBeChecked();
  },
};

// 5. Cards: the whole card is the radio, at least 48px. Its name is only the title and the
// description describes it; disabled, the description gives the reason. The selection shows a
// thicker border and a check icon, not only a color.
export const Cards: Story = {
  args: { label: 'Talla', className: 'grid grid-cols-2' },
  render: (args) => (
    <div className="w-96">
      <RadioGroup {...args}>
        <RadioCard value="s" title="S" description="Pecho 86–91 cm" />
        <RadioCard value="m" title="M" description="Pecho 96–101 cm" />
        <RadioCard value="l" title="L" disabled description="Sold out" />
        <RadioCard value="xl" title="XL" />
      </RadioGroup>
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('radiogroup', { name: 'Talla' });
    await expect(classesOf(group)).toContain('grid');
    const s = canvas.getByRole('radio', { name: 'S' });
    const m = canvas.getByRole('radio', { name: 'M' });
    const l = canvas.getByRole('radio', { name: 'L' });
    const xl = canvas.getByRole('radio', { name: 'XL' });
    await expect(s).toHaveAccessibleDescription('Pecho 86–91 cm');
    await expect(xl).not.toHaveAttribute('aria-describedby');
    await expect(l).toBeDisabled();
    await expect(l).toHaveAccessibleDescription('Sold out');
    // Only the title is dimmed, so the reason stays legible.
    await expect(canvas.getByText('L')).toHaveClass('opacity-50');
    await expect(canvas.getByText('Sold out')).not.toHaveClass('opacity-50');
    await expect(classesOf(s)).toEqual(
      expect.arrayContaining(['min-h-12', 'focus-visible:ring-primary']),
    );
    await expect(s.querySelector('svg')).toBeNull();

    await userEvent.click(canvas.getByText('Pecho 96–101 cm'));
    await expect(m).toBeChecked();
    await expect(args.onValueChange).toHaveBeenLastCalledWith('m');
    await expect(m.querySelector('svg')).not.toBeNull();
    await expect(classesOf(m)).toEqual(
      expect.arrayContaining([
        'data-[state=checked]:border-primary',
        'data-[state=checked]:inset-ring-1',
      ]),
    );

    // From M the arrow skips the disabled L.
    await pressArrow('ArrowRight', xl);
    await expect(xl).toBeChecked();
    await expect(m.querySelector('svg')).toBeNull();

    await userEvent.click(xl);
    await expect(xl).toBeChecked();
  },
};

// 6. In a form, the selected value is sent under the group's name.
export const InForm: Story = {
  render: () => (
    <form
      className="w-80"
      onSubmit={(event) => {
        event.preventDefault();
        const output = event.currentTarget.querySelector('output')!;
        output.textContent = String(new FormData(event.currentTarget).get('envio'));
      }}
    >
      <RadioGroup label="Envío" name="envio" defaultValue="normal">
        <RadioGroupItem value="normal" label="Normal" />
        <RadioGroupItem value="retiro" label="Retiro en tienda" />
      </RadioGroup>
      <button type="submit">Enviar</button>
      <output />
    </form>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText('Retiro en tienda'));
    await userEvent.click(canvas.getByRole('button', { name: 'Enviar' }));
    await expect(canvasElement.querySelector('output')).toHaveTextContent('retiro');
  },
};
