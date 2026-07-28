import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';
import { DatePicker } from './DatePicker';

const meta: Meta<typeof DatePicker> = {
  title: 'Components/DatePicker',
  component: DatePicker,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof DatePicker>;

// DatePicker es controlado (sin estado interno): el consumidor maneja `date`/`onDateChange`,
// igual que se haría en una app real.
function ControlledDatePicker() {
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  return <DatePicker date={date} onDateChange={setDate} />;
}

// 1. Default
export const Default: Story = {
  render: () => <ControlledDatePicker />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Pick a date' });

    const body = within(document.body);
    await expect(body.queryByRole('dialog')).not.toBeInTheDocument();

    await userEvent.click(trigger);

    const content = await body.findByRole('dialog');

    // Elegimos un día visible dentro del mes actual (evitamos días "outside"
    // para no depender de qué día es "hoy" al correr el test).
    const dayButtons = within(content)
      .getAllByRole('button')
      .filter(
        (el) => /^\d{1,2}$/.test(el.textContent ?? '') && el.closest('td')?.dataset.outside !== 'true',
      );
    const targetDay = dayButtons[Math.min(10, dayButtons.length - 1)];
    await userEvent.click(targetDay);

    // Al seleccionar, el trigger debe reflejar la fecha formateada (ya no el placeholder).
    await expect(trigger).not.toHaveTextContent('Pick a date');

    // El Popover no reimplementa su propio manejo de apertura/cierre: sigue abierto tras seleccionar.
    await expect(body.getByRole('dialog')).toBeInTheDocument();
  },
};
