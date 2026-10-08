import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';
import { es } from 'date-fns/locale';
import { es as dayPickerEs } from '@daypicker/react/locale/es';
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

    const content = await body.findByRole('dialog', { name: 'Choose date' });

    // Elegimos un día visible dentro del mes actual (evitamos días "outside"
    // para no depender de qué día es "hoy" al correr el test).
    const dayButtons = within(content)
      .getAllByRole('button')
      .filter(
        (el) =>
          /^\d{1,2}$/.test(el.textContent ?? '') && el.closest('td')?.dataset.outside !== 'true',
      );
    const targetDay = dayButtons[Math.min(10, dayButtons.length - 1)];
    await userEvent.click(targetDay);

    // Al seleccionar, el trigger debe reflejar la fecha formateada (ya no el placeholder).
    await expect(trigger).not.toHaveTextContent('Pick a date');
    // Sin locale, date-fns formatea en inglés (PPP: "October 11th, 2026").
    await expect(trigger).toHaveTextContent(/^[A-Z][a-z]+ \d{1,2}(st|nd|rd|th), \d{4}$/);

    // El Popover no reimplementa su propio manejo de apertura/cierre: sigue abierto tras seleccionar.
    await expect(body.getByRole('dialog')).toBeInTheDocument();
  },
};

// 2. Locale español de date-fns: la fecha del disparador, el mes y los días de la semana
// salen en español; dialogLabel cambia el nombre accesible del popover. Las etiquetas de
// navegación del calendario quedan en inglés: DayPicker las toma de `locale.labels`, que los
// locales de date-fns no traen (ver la story siguiente).
export const SpanishLocale: Story = {
  render: () => <DatePicker date={new Date(2026, 0, 15)} locale={es} dialogLabel="Elegir fecha" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '15 de enero de 2026' }));

    const content = await within(document.body).findByRole('dialog', { name: 'Elegir fecha' });
    const caption = within(content).getByRole('grid').getAttribute('aria-label');
    // Abre en el mes de la fecha elegida, no en el actual.
    await expect(caption).toBe('enero 2026');
    // DayPicker oculta la fila de días de la semana al árbol de accesibilidad: consulta al DOM.
    const weekdays = Array.from(content.querySelectorAll('th'), (th) => th.textContent);
    await expect(weekdays).toEqual(['lu', 'ma', 'mi', 'ju', 'vi', 'sá', 'do']);

    await expect(within(content).getByRole('button', { name: 'Go to the Next Month' })).toBeInTheDocument();
    await expect(within(content).getByRole('button', { name: 'Go to the Previous Month' })).toBeInTheDocument();
  },
};

// 3. Locale español de DayPicker: es un Locale de date-fns con `labels` agregadas, así que
// DatePicker lo acepta igual y también traduce las etiquetas de navegación.
export const SpanishLocaleWithDayPickerLabels: Story = {
  render: () => <DatePicker date={new Date(2026, 0, 15)} locale={dayPickerEs} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '15 de enero de 2026' }));

    const content = await within(document.body).findByRole('dialog', { name: 'Choose date' });
    await expect(within(content).getByRole('button', { name: 'Ir al mes siguiente' })).toBeInTheDocument();
    await expect(within(content).getByRole('button', { name: 'Ir al mes anterior' })).toBeInTheDocument();
  },
};
