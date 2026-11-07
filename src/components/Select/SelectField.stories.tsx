import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { SelectField } from './SelectField';
import { SelectItem } from './Select';

const meta: Meta<typeof SelectField> = {
  title: 'Components/SelectField',
  component: SelectField,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SelectField>;

const items = [
  <SelectItem key="ar" value="ar">
    Argentina
  </SelectItem>,
  <SelectItem key="mx" value="mx">
    México
  </SelectItem>,
];

// 1. The visible label names the trigger; without error, aria-invalid is "false" and there's no
// description.
export const WithLabel: Story = {
  render: () => (
    <SelectField label="País" placeholder="Elige un país">
      {items}
    </SelectField>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox', { name: 'País' });

    await expect(trigger).toHaveTextContent('Elige un país');
    await expect(trigger).toHaveAttribute('aria-invalid', 'false');
    await expect(trigger).not.toHaveAttribute('aria-describedby');
    await expect(trigger).toHaveAttribute('data-placeholder');
  },
};

// 2. aria-label names the trigger with no <label> in the DOM.
export const WithAriaLabel: Story = {
  render: () => <SelectField aria-label="País">{items}</SelectField>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('combobox', { name: 'País' })).toBeInTheDocument();
    await expect(canvasElement.querySelector('label')).toBeNull();
  },
};

// 3. error: aria-invalid, description linked to the message, and it takes the place of helperText.
export const WithError: Story = {
  render: () => (
    <SelectField label="País" error="Elige un país." helperText="Ayuda que no se muestra.">
      {items}
    </SelectField>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox', { name: 'País' });

    await expect(trigger).toHaveAttribute('aria-invalid', 'true');
    await expect(trigger).toHaveAccessibleDescription('Elige un país.');
    await expect(canvas.queryByText('Ayuda que no se muestra.')).not.toBeInTheDocument();
    // The error border is SelectTrigger's own, from aria-invalid (see SizesAndErrorStyles).
    await expect(trigger).toHaveClass('aria-[invalid=true]:border-error');
    await expect(canvas.getByText('País').className.split(' ')).toContain('text-error-focus');
    await expect(canvas.getByText('Elige un país.').className.split(' ')).toContain(
      'text-error-focus',
    );
  },
};

// 4. helperText is linked as the description, without marking the field as invalid.
export const WithHelperText: Story = {
  render: () => (
    <SelectField label="País" helperText="Define la moneda de la factura.">
      {items}
    </SelectField>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('combobox', { name: 'País' });

    await expect(trigger).toHaveAttribute('aria-invalid', 'false');
    await expect(trigger).toHaveAccessibleDescription('Define la moneda de la factura.');
  },
};

// 5. The Select props reach the root and the children are the options; id and ref go to the
// trigger, and className to the root.
const onValueChange = fn();
const triggerRef = { current: null as HTMLButtonElement | null };

export const ForwardsProps: Story = {
  render: () => (
    <SelectField
      ref={triggerRef}
      label="País"
      id="country"
      defaultValue="ar"
      onValueChange={onValueChange}
      className="root-class"
    >
      {items}
    </SelectField>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox', { name: 'País' });

    await expect(trigger).toHaveAttribute('id', 'country');
    await expect(triggerRef.current).toBe(trigger);
    await expect(canvasElement.querySelector('.root-class')).toContainElement(trigger);
    await expect(trigger.className.split(' ')).not.toContain('root-class');
    await expect(trigger).toHaveTextContent('Argentina');

    await userEvent.click(trigger);
    const listbox = await within(document.body).findByRole('listbox');
    await userEvent.click(within(listbox).getByText('México'));

    await expect(onValueChange).toHaveBeenCalledWith('mx');
    await expect(trigger).toHaveTextContent('México');
  },
};

// 6. disabled and required reach the trigger through the root; name and required, the native
// select Radix adds inside a form.
export const DisabledAndForm: Story = {
  render: () => (
    <form className="flex flex-col gap-4">
      <SelectField label="Plan" disabled>
        {items}
      </SelectField>
      <SelectField label="País" name="country" required defaultValue="mx">
        {items}
      </SelectField>
    </form>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('combobox', { name: 'Plan' })).toBeDisabled();
    await expect(canvas.getByRole('combobox', { name: 'País' })).toHaveAttribute(
      'aria-required',
      'true',
    );
    const form = canvasElement.querySelector('form') as HTMLFormElement;
    await expect(new FormData(form).get('country')).toBe('mx');
  },
};

// 7. A click on the label reaches the trigger. Radix opens the list there unless the last pointer
// on the trigger was a mouse, and an open list hides the page from role queries, so the trigger is
// read from the DOM and the list is closed to leave focus on it.
export const LabelClickReachesTrigger: Story = {
  render: () => <SelectField label="País">{items}</SelectField>,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByText('País'));
    await userEvent.keyboard('{Escape}');

    await expect(canvasElement.querySelector('button')).toHaveFocus();
  },
};

// 8. Same heights as Input, and the trigger's border changes with the error. Real CSS: size and
// aria-invalid reach SelectTrigger, whose classes win with no `!`.
export const SizesAndErrorStyles: Story = {
  tags: ['real-css'],
  render: () => (
    <div className="flex flex-col gap-4">
      <SelectField aria-label="Pequeño" size="sm">
        {items}
      </SelectField>
      <SelectField aria-label="Mediano">{items}</SelectField>
      <SelectField aria-label="Grande" size="lg">
        {items}
      </SelectField>
      <SelectField aria-label="Con error" error="Elige un país.">
        {items}
      </SelectField>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const height = (name: string) =>
      canvas.getByRole('combobox', { name }).getBoundingClientRect().height;

    await expect(height('Pequeño')).toBe(32);
    await expect(height('Mediano')).toBe(44);
    await expect(height('Grande')).toBe(48);

    const borderColor = (name: string) =>
      getComputedStyle(canvas.getByRole('combobox', { name })).borderTopColor;
    await expect(borderColor('Con error')).not.toBe(borderColor('Mediano'));
  },
};
