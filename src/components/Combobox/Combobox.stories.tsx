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

// 1. Roles: the trigger announces the label and the value; inside the popover (a dialog named
// after the label), the search field is a combobox and the list a listbox of options. size
// doesn't reach the DOM.
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

// 2. Own filter: ignoring case and accents, anywhere in the label and in the original
// order.
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

// 3. Single selection: choosing closes the popover, returns focus to the trigger and updates
// its name. With aria-label (no <label>) the trigger also announces label and value.
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

    // On reopening, the search field is empty and the chosen option is the highlighted one.
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

// 4. Multiple selection: aria-checked on the chosen ones, the popover stays open, and the Chips
// and the trigger name reflect the value.
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

    // Choosing an option again removes it.
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
    // The Chips don't go inside the button.
    await expect(trigger.querySelector('button')).toBeNull();
  },
};

// 5. Removing a Chip: focus moves to the next Chip; if there's none after it, to the button.
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

// 6. Escape closes the popover and returns focus to the trigger.
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

// 7. Inline mode inside a bottom Sheet: search field and list always visible, no button; the
// Chips above the search field. The visible label is visual only (aria-hidden, no for): the
// search field is named by cmdk's hidden label, so the reader reads it only once, and a
// click on the visible one focuses the search field.
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
    // The only exposed label is cmdk's, which points to the search field.
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

    // Chips above the search field; removing the last one returns focus to the search field.
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

// 8. Heights: each row (single Combobox, multiple, Select, Input) must measure 32 / 44 / 48.
// Measured in Storybook with a real browser; the headless fixture doesn't apply Tailwind.
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

// 9. Long list: scrolls inside the popover (max-h-72). Checked in a real browser.
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

// 10. Controlled and disabled.
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

// 11. Server rendering: the renderToString HTML already has the association between the label
// and the field, without effects or hydration. Popover: <label for> on the button and
// aria-labelledby with the label and the value. Inline: cmdk's hidden label with the `label`
// text, pointing to the search field.
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

// 12. Changing `label` between renders updates the accessible name of the trigger (without
// opening the popover), of the popover and of the search field in both modes.
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

// 13. listVisibility="query": the list only shows with focus and text (ignoring spaces).
// aria-expanded follows each state, and the empty message only appears with the list visible.
export const InlineQuery: Story = {
  render: () => (
    <Field>
      <Combobox label="País" mode="inline" listVisibility="query" options={countries} />
    </Field>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox', { name: 'País' });
    const listbox = canvas.getByRole('listbox', { hidden: true });
    await expect(input).toHaveAttribute('aria-expanded', 'false');
    await expect(input).toHaveAttribute('aria-controls', listbox.id);
    await expect(listbox).not.toBeVisible();

    await userEvent.click(input);
    await expect(input).toHaveFocus();
    await expect(listbox).not.toBeVisible();
    await expect(input).toHaveAttribute('aria-expanded', 'false');
    await expect(canvas.queryByText('No results.')).not.toBeInTheDocument();

    await userEvent.type(input, '   ');
    await expect(listbox).not.toBeVisible();

    await userEvent.clear(input);
    await userEvent.type(input, 'pe');
    await expect(listbox).toBeVisible();
    await expect(input).toHaveAttribute('aria-expanded', 'true');
    await expect(
      within(listbox)
        .getAllByRole('option')
        .map((o) => o.textContent),
    ).toEqual(['Perú']);

    await userEvent.type(input, 'zzz');
    await expect(canvas.getByText('No results.')).toBeVisible();

    await userEvent.clear(input);
    await expect(listbox).not.toBeVisible();
    await expect(input).toHaveAttribute('aria-expanded', 'false');
    await expect(canvas.queryByText('No results.')).not.toBeInTheDocument();
    // With the list hidden there are no options: Enter chooses nothing invisible.
    await expect(within(listbox).queryAllByRole('option', { hidden: true })).toHaveLength(0);
  },
};

// 14. listVisibility="focus": visible while the search field has focus. Escape hides it without
// moving focus; typing shows it again.
export const InlineFocus: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-4">
      <Combobox label="País" mode="inline" listVisibility="focus" options={countries} />
      <Button variant="outline">Siguiente</Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox', { name: 'País' });
    const listbox = canvas.getByRole('listbox', { hidden: true });
    await expect(listbox).not.toBeVisible();
    await expect(input).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(input);
    await expect(listbox).toBeVisible();
    await expect(input).toHaveAttribute('aria-expanded', 'true');
    await expect(within(listbox).getAllByRole('option')).toHaveLength(countries.length);

    await userEvent.keyboard('{Escape}');
    await expect(listbox).not.toBeVisible();
    await expect(input).toHaveFocus();
    await expect(input).toHaveAttribute('aria-expanded', 'false');
    await userEvent.type(input, 'c');
    await expect(listbox).toBeVisible();

    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Siguiente' })).toHaveFocus();
    await expect(listbox).not.toBeVisible();
    await expect(input).toHaveAttribute('aria-expanded', 'false');
  },
};

// 15. Multiple with listVisibility="query": choosing with Enter and with a click clears the
// text, keeps focus in the search field and hides the list (the text is now empty). With
// "focus" the list stays.
export const InlineQueryMultiple: Story = {
  args: { onValueChange: fn() },
  render: (args) => (
    <div className="flex w-72 flex-col gap-4">
      <Combobox
        label="Países"
        mode="inline"
        listVisibility="query"
        multiple
        options={countries}
        onValueChange={args.onValueChange as (value: string[]) => void}
      />
      <Combobox
        label="Con foco"
        mode="inline"
        listVisibility="focus"
        multiple
        options={countries}
      />
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox', { name: 'Países' });
    const listbox = canvas.getAllByRole('listbox', { hidden: true })[0];

    await userEvent.type(input, 'chi');
    await expect(listbox).toBeVisible();
    await userEvent.keyboard('{Enter}');
    await expect(args.onValueChange).toHaveBeenLastCalledWith(['cl']);
    await expect(input).toHaveValue('');
    await expect(input).toHaveFocus();
    await expect(listbox).not.toBeVisible();
    await expect(input).toHaveAttribute('aria-expanded', 'false');

    await userEvent.type(input, 'per');
    await userEvent.click(within(listbox).getByRole('option', { name: 'Perú' }));
    await expect(args.onValueChange).toHaveBeenLastCalledWith(['cl', 'pe']);
    await expect(input).toHaveValue('');
    await expect(input).toHaveFocus();
    await expect(listbox).not.toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Remove Perú' })).toBeInTheDocument();

    const focusInput = canvas.getByRole('combobox', { name: 'Con foco' });
    const focusListbox = canvas.getAllByRole('listbox', { hidden: true })[1];
    await userEvent.type(focusInput, 'bol');
    await userEvent.keyboard('{Enter}');
    await expect(focusInput).toHaveValue('');
    await expect(focusInput).toHaveFocus();
    await expect(focusListbox).toBeVisible();
    await expect(focusInput).toHaveAttribute('aria-expanded', 'true');
    await expect(within(focusListbox).getByRole('option', { name: 'Bolivia' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  },
};

// 16. Single with a conditional list: the value is shown as a Chip (with the list hidden there
// would be no other way to see it); its ✕ clears the value and returns focus to the search field.
export const InlineFocusSingle: Story = {
  args: { onValueChange: fn() },
  render: (args) => (
    <Field>
      <Combobox
        label="País"
        mode="inline"
        listVisibility="focus"
        options={countries}
        defaultValue="mx"
        onValueChange={args.onValueChange as (value: string) => void}
      />
    </Field>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox', { name: 'País' });
    await userEvent.click(canvas.getByRole('button', { name: 'Remove México' }));
    await expect(args.onValueChange).toHaveBeenLastCalledWith('');
    await expect(input).toHaveFocus();
    await expect(canvas.getByRole('listbox')).toBeVisible();

    await userEvent.type(input, 'chi');
    await userEvent.keyboard('{Enter}');
    await expect(args.onValueChange).toHaveBeenLastCalledWith('cl');
    await expect(input).toHaveValue('');
    await expect(canvas.getByRole('button', { name: 'Remove Chile' })).toBeInTheDocument();
  },
};

// 17. Inside a bottom Sheet: with the list visible, the first Escape hides it and the Sheet
// stays open; the second one closes it.
export const InlineQueryInSheet: Story = {
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
            listVisibility="query"
            multiple
            size="lg"
            options={countries}
          />
        </SheetBody>
      </SheetContent>
    </Sheet>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Filtrar' }));
    const sheet = await body().findByRole('dialog', { name: 'Filtros' });
    const input = within(sheet).getByRole('combobox', { name: 'País' });
    const listbox = within(sheet).getByRole('listbox', { hidden: true });

    await userEvent.type(input, 'ar');
    await expect(listbox).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect(listbox).not.toBeVisible();
    await expect(input).toHaveAttribute('aria-expanded', 'false');
    await expect(input).toHaveFocus();
    await expect(input).toHaveValue('ar');
    await expect(body().getByRole('dialog', { name: 'Filtros' })).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(body().queryByRole('dialog', { name: 'Filtros' })).not.toBeInTheDocument(),
    );
  },
};

// 18. The Chips follow the Combobox size (sm / md / lg), in popover and inline. Measured in
// Storybook with a real browser, multiple popover field with one Chip: sm 32px (Chip 29), md
// 44px (Chip 32), lg 53px (Chip 44 + py-1 + border: exceeds the min-h-12 of 48). With more
// Chips than fit on one line, the field grows in all three sizes (flex-wrap).
export const ChipSizes: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-4">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <React.Fragment key={size}>
          <Combobox
            aria-label={`Popover ${size}`}
            size={size}
            multiple
            options={countries}
            defaultValue={['mx']}
            removeLabel={(label) => `Quitar ${label} popover ${size}`}
          />
          <Combobox
            aria-label={`En línea ${size}`}
            mode="inline"
            size={size}
            multiple
            options={countries}
            defaultValue={['mx']}
            removeLabel={(label) => `Quitar ${label} en línea ${size}`}
          />
        </React.Fragment>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // chipVariants classes per size (sm doesn't set a height).
    const chipClasses = { sm: ['text-xs'], md: ['text-sm', 'h-8'], lg: ['text-base', 'h-11'] };
    for (const size of ['sm', 'md', 'lg'] as const) {
      for (const where of ['popover', 'en línea']) {
        const remove = canvas.getByRole('button', { name: `Quitar México ${where} ${size}` });
        await expect(remove.parentElement).toHaveClass(...chipClasses[size]);
      }
    }
  },
};

const shipping: ComboboxOption[] = [
  { value: 'store', label: 'Retiro en tienda' },
  { value: 'standard', label: 'Estándar', group: 'A domicilio', description: 'De 3 a 5 días' },
  {
    value: 'express',
    label: 'Exprés',
    group: 'A domicilio',
    description: 'No disponible en tu zona',
    disabled: true,
  },
  { value: 'locker', label: 'Casillero', group: 'Puntos de retiro' },
  { value: 'gift', label: 'Tarjeta de regalo' },
  { value: 'same-day', label: 'En el día', group: 'A domicilio' },
];

const optionNames = (root: HTMLElement) =>
  within(root)
    .getAllByRole('option')
    .map((option) => option.textContent);

// Shared by both modes: structure, names, order and filter over the same options. Each group goes
// where its first option appears, with all of its options, even if they aren't contiguous.
const expectGroupsAndDescriptions = async (listbox: HTMLElement, input: HTMLElement) => {
  await expect(optionNames(listbox)).toEqual([
    'Retiro en tienda',
    'Estándar De 3 a 5 días',
    'Exprés No disponible en tu zona',
    'En el día',
    'Casillero',
    'Tarjeta de regalo',
  ]);

  const home = within(listbox).getByRole('group', { name: 'A domicilio' });
  await expect(within(home).getAllByRole('option')).toHaveLength(3);
  const store = within(listbox).getByRole('option', { name: 'Retiro en tienda' });
  await expect(store.closest('[role="group"]')).toBeNull();

  // The description is in the accessible name, also when the option is disabled. Only the label
  // and the check are dimmed there, so the reason stays legible.
  const express = within(listbox).getByRole('option', {
    name: 'Exprés No disponible en tu zona',
  });
  await expect(express).toHaveAttribute('aria-disabled', 'true');
  await expect(express.className).not.toContain('data-[disabled=true]:opacity-50');
  const description = within(express).getByText('No disponible en tu zona');
  await expect(description.className).not.toContain('opacity');
  await expect(within(express).getByText('Exprés').className).toContain(
    'in-data-[disabled=true]:opacity-50',
  );
  // Without a description, the whole option is dimmed, as before.
  await expect(store.className).toContain('data-[disabled=true]:opacity-50');

  // The filter only looks at the label; a group left without options disappears.
  await userEvent.type(input, 'zona');
  await expect(within(listbox).queryAllByRole('option')).toHaveLength(0);
  await userEvent.clear(input);
  await userEvent.type(input, 'casillero');
  await expect(optionNames(listbox)).toEqual(['Casillero']);
  await expect(within(listbox).queryByRole('group', { name: 'A domicilio' })).toBeNull();
  await expect(within(listbox).getByRole('group', { name: 'Puntos de retiro' })).toBeVisible();
  await userEvent.clear(input);
};

// 19. description and group, popover. The trigger shows only the label of the choice. Arrow keys
// cross group boundaries and skip the disabled option.
export const DescriptionAndGroups: Story = {
  render: () => (
    <Field>
      <Combobox label="Envío" options={shipping} />
    </Field>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: /Envío/ });
    await userEvent.click(trigger);
    const listbox = await body().findByRole('listbox', { name: 'Envío' });
    const input = body().getByRole('combobox', { name: 'Envío' });
    await expectGroupsAndDescriptions(listbox, input);

    const highlighted = () => listbox.querySelector('[aria-selected="true"]')?.textContent;
    await waitFor(() => expect(highlighted()).toBe('Retiro en tienda'));
    await userEvent.keyboard('{ArrowDown}');
    await expect(highlighted()).toBe('Estándar De 3 a 5 días');
    await userEvent.keyboard('{ArrowDown}');
    await expect(highlighted()).toBe('En el día');

    await userEvent.keyboard('{ArrowUp}');
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(trigger).toHaveAccessibleName('Envío Estándar'));
  },
};

// 20. description and group, inline: same behavior. With multiple, the Chip shows only the label.
export const DescriptionAndGroupsInline: Story = {
  render: () => (
    <Field>
      <Combobox label="Envío" mode="inline" multiple options={shipping} />
    </Field>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const listbox = canvas.getByRole('listbox', { name: 'Envío' });
    await expectGroupsAndDescriptions(listbox, canvas.getByRole('combobox', { name: 'Envío' }));

    await userEvent.click(within(listbox).getByRole('option', { name: /^Estándar/ }));
    const remove = canvas.getByRole('button', { name: 'Remove Estándar' });
    await expect(remove.parentElement).not.toHaveTextContent('De 3 a 5 días');
  },
};

// 21. With listVisibility, groups follow the list: no options or groups while it's hidden.
export const GroupsWithListVisibility: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-4">
      <Combobox aria-label="Con foco" mode="inline" listVisibility="focus" options={shipping} />
      <Combobox aria-label="Con texto" mode="inline" listVisibility="query" options={shipping} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const focusInput = canvas.getByRole('combobox', { name: 'Con foco' });
    const queryInput = canvas.getByRole('combobox', { name: 'Con texto' });
    await expect(canvas.queryAllByRole('group')).toHaveLength(0);
    await expect(canvas.queryAllByRole('option')).toHaveLength(0);

    await userEvent.click(focusInput);
    await expect(canvas.getByRole('group', { name: 'A domicilio' })).toBeVisible();
    await expect(canvas.getByRole('option', { name: 'Estándar De 3 a 5 días' })).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect(canvas.queryAllByRole('group')).toHaveLength(0);

    await userEvent.click(queryInput);
    await expect(canvas.queryAllByRole('group')).toHaveLength(0);
    await userEvent.type(queryInput, 'exp');
    await expect(canvas.getByRole('group', { name: 'A domicilio' })).toBeVisible();
    await expect(
      canvas.getByRole('option', { name: 'Exprés No disponible en tu zona' }),
    ).toBeVisible();
  },
};
