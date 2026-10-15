import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { renderToString } from 'react-dom/server';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../Button';
import { Input } from '../Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../Select';
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../Sheet';
import { Combobox, type ComboboxOption } from './Combobox';

const meta: Meta<typeof Combobox> = {
  title: 'Components/Combobox',
  component: Combobox,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Combobox>;

const countries: ComboboxOption[] = [
  { value: 'ar', label: 'Argentina' },
  { value: 'bo', label: 'Bolivia' },
  { value: 'br', label: 'Brasil' },
  { value: 'cl', label: 'Chile' },
  { value: 'co', label: 'Colombia' },
  { value: 'cr', label: 'Costa Rica' },
  { value: 'cu', label: 'Cuba', disabled: true },
  { value: 'ec', label: 'Ecuador' },
  { value: 'sv', label: 'El Salvador' },
  { value: 'gt', label: 'Guatemala' },
  { value: 'hn', label: 'Honduras' },
  { value: 'mx', label: 'México' },
  { value: 'ni', label: 'Nicaragua' },
  { value: 'pa', label: 'Panamá' },
  { value: 'py', label: 'Paraguay' },
  { value: 'pe', label: 'Perú' },
  { value: 'do', label: 'República Dominicana' },
  { value: 'uy', label: 'Uruguay' },
  { value: 've', label: 'Venezuela' },
];

const body = () => within(document.body);

const Field = ({ children }: { children: React.ReactNode }) => (
  <div className="w-72">{children}</div>
);

// 1. Roles: el disparador anuncia la etiqueta y el valor; dentro del popover (dialog con el
// nombre de la etiqueta), el buscador es un combobox y la lista un listbox de option. size no
// llega al DOM.
export const Default: Story = {
  render: () => (
    <Field>
      <Combobox label="País" options={countries} defaultValue="mx" size="md" />
    </Field>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'País México' });
    const label = canvas.getByText('País', { selector: 'label' });
    await expect(label).toHaveAttribute('for', trigger.id);
    await expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(trigger);
    const dialog = await body().findByRole('dialog', { name: 'País' });
    const input = within(dialog).getByRole('combobox', { name: 'País' });
    await expect(input).toHaveAttribute('aria-expanded', 'true');
    await expect(input).toHaveFocus();
    const listbox = within(dialog).getByRole('listbox', { name: 'País' });
    await expect(input).toHaveAttribute('aria-controls', listbox.id);
    const options = within(listbox).getAllByRole('option');
    await expect(options).toHaveLength(countries.length);
    await expect(within(listbox).getByRole('option', { name: 'México' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await expect(within(listbox).getByRole('option', { name: 'Perú' })).toHaveAttribute(
      'aria-checked',
      'false',
    );
    await expect(within(listbox).getByRole('option', { name: 'Cuba' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );

    for (const element of [canvasElement, dialog]) {
      await expect(element.querySelector('[size]')).toBeNull();
    }
  },
};

// 2. Filtro propio: sin mayúsculas ni acentos, en cualquier parte de la etiqueta y en el orden
// original.
export const Filter: Story = {
  render: () => (
    <Field>
      <Combobox label="País" options={countries} />
    </Field>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole('button', { name: /País/ }));
    const dialog = await body().findByRole('dialog', { name: 'País' });
    const input = within(dialog).getByRole('combobox');
    const optionNames = () =>
      within(dialog)
        .queryAllByRole('option')
        .map((option) => option.textContent);

    await userEvent.type(input, 'MEXICO');
    await expect(optionNames()).toEqual(['México']);

    await userEvent.clear(input);
    await userEvent.type(input, 'ua');
    await expect(optionNames()).toEqual([
      'Ecuador',
      'Guatemala',
      'Nicaragua',
      'Paraguay',
      'Uruguay',
    ]);

    await userEvent.clear(input);
    await userEvent.type(input, 'rú');
    await expect(optionNames()).toEqual(['Perú', 'Uruguay']);

    await userEvent.clear(input);
    await userEvent.type(input, 'zzz');
    await expect(optionNames()).toEqual([]);
    await expect(within(dialog).getByText('No results.')).toBeVisible();
  },
};

// 3. Selección única: elegir cierra el popover, devuelve el foco al disparador y actualiza su
// nombre. Con aria-label (sin <label>) el disparador también anuncia etiqueta y valor.
export const SingleSelect: Story = {
  args: { onValueChange: fn() },
  render: (args) => (
    <div className="w-72">
      <Combobox
        aria-label="País"
        options={countries}
        onValueChange={args.onValueChange as (value: string) => void}
      />
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole('button', { name: 'País Select...' });
    await userEvent.click(trigger);
    const dialog = await body().findByRole('dialog', { name: 'País' });

    await userEvent.type(within(dialog).getByRole('combobox'), 'peru');
    await userEvent.keyboard('{Enter}');

    await waitFor(() => expect(body().queryByRole('dialog')).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
    await expect(args.onValueChange).toHaveBeenCalledExactlyOnceWith('pe');
    await expect(trigger).toHaveAccessibleName('País Perú');

    // Al reabrir, el buscador está vacío y la opción elegida es la resaltada.
    await userEvent.click(trigger);
    const reopened = await body().findByRole('dialog');
    await expect(within(reopened).getByRole('combobox')).toHaveValue('');
    await expect(within(reopened).getByRole('option', { name: 'Perú' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await userEvent.keyboard('{Escape}');
  },
};

// 4. Selección múltiple: aria-checked en las elegidas, el popover sigue abierto, y los Chips y el
// nombre del disparador reflejan el valor.
export const Multiple: Story = {
  args: { onValueChange: fn() },
  render: (args) => (
    <Field>
      <Combobox
        label="País"
        multiple
        options={countries}
        defaultValue={['mx']}
        onValueChange={args.onValueChange as (value: string[]) => void}
      />
    </Field>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole('button', { name: 'País México' });
    await userEvent.click(trigger);
    const dialog = await body().findByRole('dialog', { name: 'País' });

    await userEvent.click(within(dialog).getByRole('option', { name: 'Chile' }));
    await userEvent.click(within(dialog).getByRole('option', { name: 'Perú' }));

    await expect(body().getByRole('dialog')).toBeInTheDocument();
    await expect(within(dialog).getByRole('combobox')).toHaveFocus();
    for (const name of ['México', 'Chile', 'Perú']) {
      await expect(within(dialog).getByRole('option', { name })).toHaveAttribute(
        'aria-checked',
        'true',
      );
    }
    await expect(within(dialog).getByRole('option', { name: 'Brasil' })).toHaveAttribute(
      'aria-checked',
      'false',
    );
    await expect(args.onValueChange).toHaveBeenLastCalledWith(['mx', 'cl', 'pe']);

    // Volver a elegir una opción la quita.
    await userEvent.click(within(dialog).getByRole('option', { name: 'Chile' }));
    await expect(within(dialog).getByRole('option', { name: 'Chile' })).toHaveAttribute(
      'aria-checked',
      'false',
    );

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body().queryByRole('dialog')).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
    await expect(trigger).toHaveAccessibleName('País México, Perú');
    await expect(canvas.getByRole('button', { name: 'Remove Perú' })).toBeInTheDocument();
    // Los Chips no van dentro del botón.
    await expect(trigger.querySelector('button')).toBeNull();
  },
};

// 5. Quitar un Chip: el foco pasa al Chip siguiente; si no queda uno después, al botón.
export const RemoveChipFocus: Story = {
  render: () => (
    <Field>
      <Combobox
        label="País"
        multiple
        options={countries}
        defaultValue={['ar', 'mx', 'pe']}
        removeLabel={(label) => `Quitar ${label}`}
      />
    </Field>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Quitar México' }));
    await expect(canvas.getByRole('button', { name: 'Quitar Perú' })).toHaveFocus();
    await expect(canvas.queryByRole('button', { name: 'Quitar México' })).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: 'Quitar Perú' }));
    await expect(canvas.getByRole('button', { name: 'País Argentina' })).toHaveFocus();

    await userEvent.click(canvas.getByRole('button', { name: 'Quitar Argentina' }));
    await expect(canvas.getByRole('button', { name: 'País Select...' })).toHaveFocus();
  },
};

// 6. Escape cierra el popover y devuelve el foco al disparador.
export const EscapeCloses: Story = {
  render: () => (
    <Field>
      <Combobox label="País" options={countries} />
    </Field>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole('button', { name: 'País Select...' });
    await userEvent.click(trigger);
    const dialog = await body().findByRole('dialog', { name: 'País' });
    await userEvent.type(within(dialog).getByRole('combobox'), 'chi');

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body().queryByRole('dialog')).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  },
};

// 7. Modo en línea dentro de un Sheet bottom: buscador y lista siempre visibles, sin botón; los
// Chips encima del buscador. La etiqueta visible es solo visual (aria-hidden, sin for): el
// buscador se nombra con la etiqueta oculta de cmdk, así el lector la lee una sola vez, y un
// clic en la visible enfoca el buscador.
export const InlineInSheet: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Filtrar</Button>
      </SheetTrigger>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>Filtros</SheetTitle>
          <SheetDescription>Elige los países que quieres ver.</SheetDescription>
        </SheetHeader>
        <SheetBody>
          <Combobox
            label="País"
            mode="inline"
            multiple
            size="lg"
            options={countries}
            defaultValue={['mx']}
          />
        </SheetBody>
      </SheetContent>
    </Sheet>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Filtrar' }));
    const sheet = await body().findByRole('dialog', { name: 'Filtros' });
    const sheetScope = within(sheet);

    const input = sheetScope.getByRole('combobox', { name: 'País' });
    const visibleLabel = sheetScope.getByText('País', { selector: 'span' });
    await expect(visibleLabel).toHaveAttribute('aria-hidden', 'true');
    // La única etiqueta expuesta es la de cmdk, que apunta al buscador.
    const labels = sheet.querySelectorAll('label');
    await expect(labels).toHaveLength(1);
    await expect(labels[0].control).toBe(input);
    await userEvent.click(visibleLabel);
    await expect(input).toHaveFocus();
    await expect(input).toHaveAttribute('aria-expanded', 'true');
    await expect(sheetScope.getByRole('listbox', { name: 'País' })).toBeVisible();
    await expect(sheetScope.queryByRole('button', { name: /^País/ })).not.toBeInTheDocument();
    await userEvent.type(input, 'uru');
    await userEvent.keyboard('{Enter}');
    await expect(sheetScope.getByRole('option', { name: 'Uruguay' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await expect(sheetScope.getByRole('button', { name: 'Remove Uruguay' })).toBeInTheDocument();
    await expect(body().getByRole('dialog', { name: 'Filtros' })).toBeInTheDocument();

    // Chips encima del buscador; quitar el último devuelve el foco al buscador.
    const chip = sheetScope.getByRole('button', { name: 'Remove Uruguay' });
    await expect(chip.compareDocumentPosition(input) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    await userEvent.click(chip);
    await expect(input).toHaveFocus();
    await expect(sheetScope.queryByRole('dialog', { name: 'País' })).not.toBeInTheDocument();
    await expect(sheet.querySelector('[size]')).toBeNull();
  },
};

// 8. Alturas: cada fila (Combobox único, múltiple, Select, Input) debe medir 32 / 44 / 48. Medido
// en Storybook con navegador real; el fixture headless no aplica Tailwind.
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size} className="flex items-start gap-2" data-size-row={size}>
          <div className="w-48 shrink-0">
            <Combobox aria-label={`País ${size}`} size={size} options={countries} />
          </div>
          <div className="w-48 shrink-0">
            <Combobox
              aria-label={`Países ${size}`}
              size={size}
              multiple
              options={countries}
              defaultValue={['mx']}
            />
          </div>
          {size === 'md' && (
            <div className="w-48 shrink-0">
              <Select>
                <SelectTrigger aria-label="Select md">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mx">México</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <Input
            size={size}
            placeholder={`Input ${size}`}
            aria-label={`Input ${size}`}
            className="w-48 shrink-0"
          />
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const heights = { sm: 'h-8', md: 'h-11', lg: 'h-12' } as const;
    const minHeights = { sm: 'min-h-8', md: 'min-h-11', lg: 'min-h-12' } as const;
    for (const size of ['sm', 'md', 'lg'] as const) {
      await expect(
        await canvas.findByRole('button', { name: `País ${size} Select...` }),
      ).toHaveClass(heights[size]);
      const multipleTrigger = canvas.getByRole('button', { name: `Países ${size} México` });
      await expect(multipleTrigger.parentElement).toHaveClass(minHeights[size]);
      await expect(canvas.getByRole('textbox', { name: `Input ${size}` })).toHaveClass(
        heights[size],
      );
    }
  },
};

// 9. Lista larga: hace scroll dentro del popover (max-h-72). Verificado en navegador real.
export const LongList: Story = {
  render: () => (
    <Field>
      <Combobox label="País" options={countries} />
    </Field>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(await within(canvasElement).findByRole('button', { name: /País/ }));
    const listbox = await body().findByRole('listbox', { name: 'País' });
    await expect(listbox).toHaveClass('max-h-72', 'overflow-y-auto');
  },
};

// 10. Controlado y deshabilitado.
function ControlledDemo() {
  const [value, setValue] = React.useState('cl');
  return (
    <div className="flex w-72 flex-col gap-2">
      <Field>
        <Combobox label="País" options={countries} value={value} onValueChange={setValue} />
      </Field>
      <p className="text-sm">Valor: {value || '—'}</p>
      <Combobox aria-label="Deshabilitado" options={countries} defaultValue="ar" disabled />
    </div>
  );
}

export const ControlledAndDisabled: Story = {
  render: () => <ControlledDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole('button', { name: 'País Chile' })).toBeEnabled();
    await expect(canvas.getByRole('button', { name: 'Deshabilitado Argentina' })).toBeDisabled();
  },
};

// 11. Renderizado en servidor: el HTML de renderToString ya trae la asociación entre la etiqueta
// y el campo, sin efectos ni hidratación. Popover: <label for> sobre el botón y aria-labelledby
// con la etiqueta y el valor. En línea: la etiqueta oculta de cmdk con el texto de `label`,
// apuntando al buscador.
export const ServerRendered: Story = {
  render: () => <div data-testid="ssr-container" className="flex w-72 flex-col gap-4" />,
  play: async ({ canvasElement }) => {
    const container = within(canvasElement).getByTestId('ssr-container');
    container.innerHTML = renderToString(
      <>
        <Combobox label="País" options={countries} defaultValue="mx" />
        <Combobox label="Ciudad" mode="inline" options={countries} />
      </>,
    );
    const ssr = within(container);

    const trigger = ssr.getByRole('button', { name: 'País México' });
    const label = ssr.getByText('País', { selector: 'label' });
    await expect(label).toHaveAttribute('for', trigger.id);
    await expect(trigger.getAttribute('aria-labelledby')?.split(' ')).toContain(label.id);

    const input = ssr.getByRole('combobox', { name: 'Ciudad' });
    const cmdkLabel = container.querySelector<HTMLLabelElement>('label[cmdk-label]');
    await expect(cmdkLabel).toHaveTextContent('Ciudad');
    await expect(cmdkLabel).toHaveAttribute('for', input.id);
    await expect(ssr.getByRole('listbox', { name: 'Ciudad' })).toBeInTheDocument();
    await expect(ssr.getByText('Ciudad', { selector: 'span' })).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  },
};

// 12. Cambiar `label` entre renders actualiza el nombre accesible del disparador (sin abrir el
// popover), del popover y del buscador en los dos modos.
function LabelChangeDemo() {
  const [label, setLabel] = React.useState('País');
  return (
    <div className="flex w-72 flex-col gap-4">
      <Button variant="outline" onClick={() => setLabel('País de origen')}>
        Cambiar etiqueta
      </Button>
      <Combobox label={label} options={countries} defaultValue="mx" />
      <Combobox label={`${label} (en línea)`} mode="inline" options={countries.slice(0, 3)} />
    </div>
  );
}

export const LabelChange: Story = {
  render: () => <LabelChangeDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'País México' });
    await expect(canvas.getByRole('combobox', { name: 'País (en línea)' })).toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: 'Cambiar etiqueta' }));
    await expect(trigger).toHaveAccessibleName('País de origen México');
    await expect(body().queryByRole('dialog')).not.toBeInTheDocument();
    await expect(
      canvas.getByRole('combobox', { name: 'País de origen (en línea)' }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('listbox', { name: 'País de origen (en línea)' }),
    ).toBeInTheDocument();

    await userEvent.click(trigger);
    const dialog = await body().findByRole('dialog', { name: 'País de origen' });
    await expect(within(dialog).getByRole('combobox')).toHaveAccessibleName('País de origen');
    await userEvent.keyboard('{Escape}');
  },
};
