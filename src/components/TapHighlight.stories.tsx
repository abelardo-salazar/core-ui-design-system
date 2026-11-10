import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { createColumnHelper } from '@tanstack/react-table';
import { expect } from 'storybook/test';
import { Badge } from './Badge';
import { Button } from './Button';
import { Calendar } from './Calendar';
import { Checkbox } from './Checkbox';
import { CheckboxField } from './CheckboxField';
import { Chip } from './Chip';
import { Combobox } from './Combobox';
import { DataTable } from './DataTable';
import { features } from './DataTable/dataTableFeatures';
import { DatePicker } from './DatePicker';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from './Dialog';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from './DropdownMenu';
import { FileInput } from './FileInput';
import { ImageUploader } from './ImageUploader';
import { Input } from './Input';
import { NavigationBar, NavigationBarItem } from './NavigationBar';
import { QuantityStepper } from './QuantityStepper';
import { RadioCard, RadioGroup, RadioGroupItem } from './RadioGroup';
import { ScrollRow, ScrollRowItem } from './ScrollRow';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './Select';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from './Sheet';
import { Switch } from './Switch';
import { Tabs, TabsList, TabsTrigger } from './Tabs';
import { Textarea } from './Textarea';
import { Toggle } from './Toggle';
import { ToggleGroup, ToggleGroupItem } from './ToggleGroup';

const meta: Meta = {
  title: 'Examples/TapHighlight',
  tags: ['real-css'],
};

export default meta;

// The property is inherited and desktop Chromium's default is already transparent: with a red
// one on <body>, only an element that declares its own transparent tap highlight passes.
const redHighlight = <style>{'body { -webkit-tap-highlight-color: rgb(255, 0, 0); }'}</style>;

// Every element of the DS that responds to a tap drops the browser's tap highlight, whether or
// not it has a hover: the flash shows on any tappable element.
const checkTapHighlight = async (root: ParentNode, cases: Record<string, string>) => {
  const wrong: Record<string, string> = {};
  for (const [name, selector] of Object.entries(cases)) {
    const element = root.querySelector(selector);
    if (!element) {
      wrong[name] = `not found: ${selector}`;
      continue;
    }
    const value = getComputedStyle(element).getPropertyValue('-webkit-tap-highlight-color');
    if (value !== 'rgba(0, 0, 0, 0)') wrong[name] = value;
  }
  await expect(wrong).toEqual({});
};

const cities = [
  { value: 'cdmx', label: 'Ciudad de México' },
  { value: 'bogota', label: 'Bogotá' },
];

type Row = { name: string };
const columnHelper = createColumnHelper<typeof features, Row>();
const columns = [columnHelper.accessor('name', { header: 'Nombre' })];

const Case = ({ name, children }: { name: string; children: React.ReactNode }) => (
  <div data-case={name}>{children}</div>
);
const inCase = (name: string, selector: string) => `[data-case="${name}"] ${selector}`;

// 1. The components in the page flow.
export const InlineElements: StoryObj = {
  render: () => (
    <div className="flex w-96 flex-col items-start gap-3">
      {redHighlight}
      <Case name="Button">
        <Button>Botón</Button>
      </Case>
      <Case name="Badge">
        <Badge interactive>Insignia</Badge>
      </Case>
      <Case name="Toggle">
        <Toggle>Toggle</Toggle>
      </Case>
      <Case name="ToggleGroupItem">
        <ToggleGroup type="single" aria-label="Vista">
          <ToggleGroupItem value="a">Ítem</ToggleGroupItem>
        </ToggleGroup>
      </Case>
      <Case name="TabsTrigger">
        <Tabs defaultValue="a">
          <TabsList>
            <TabsTrigger value="a">Pestaña</TabsTrigger>
          </TabsList>
        </Tabs>
      </Case>
      <Case name="NavigationBarItem">
        <NavigationBar aria-label="Principal">
          <NavigationBarItem href="#inicio" icon={<span />}>
            Inicio
          </NavigationBarItem>
        </NavigationBar>
      </Case>
      <Case name="Chip">
        <Chip onPressedChange={() => {}} onRemove={() => {}} removeLabel="Quitar">
          Filtro
        </Chip>
      </Case>
      <Case name="Input">
        <Input aria-label="Buscar" defaultValue="texto" clearable clearLabel="Borrar" />
      </Case>
      <Case name="Textarea">
        <Textarea aria-label="Comentario" />
      </Case>
      <Case name="Checkbox">
        <Checkbox aria-label="Acepto" />
      </Case>
      <Case name="Switch">
        <Switch aria-label="Avisos" />
      </Case>
      <Case name="CheckboxField">
        <CheckboxField label="Recordarme" />
      </Case>
      <Case name="RadioGroupItem">
        <RadioGroup aria-label="Envío">
          <RadioGroupItem value="a" label="Estándar" />
        </RadioGroup>
      </Case>
      <Case name="RadioCard">
        <RadioGroup aria-label="Pago">
          <RadioCard value="b" title="Tarjeta" />
        </RadioGroup>
      </Case>
      <Case name="Select">
        <Select>
          <SelectTrigger aria-label="Talla">
            <SelectValue placeholder="Elegir" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="s">S</SelectItem>
          </SelectContent>
        </Select>
      </Case>
      <Case name="Combobox">
        <Combobox aria-label="Ciudad" options={cities} />
      </Case>
      <Case name="Combobox multiple">
        <Combobox aria-label="Ciudades" multiple options={cities} />
      </Case>
      <Case name="Combobox inline">
        <Combobox aria-label="Destino" mode="inline" options={cities} />
      </Case>
      <Case name="DataTable">
        <DataTable columns={columns} data={[{ name: 'Ana' }]} />
      </Case>
      <Case name="Calendar">
        <Calendar mode="single" defaultMonth={new Date(2027, 2, 1)} />
      </Case>
      <Case name="DatePicker">
        <DatePicker />
      </Case>
      <Case name="FileInput">
        <FileInput />
      </Case>
      <Case name="ImageUploader">
        <ImageUploader label="Fotos" value={[]} onValueChange={() => {}} />
      </Case>
      <Case name="QuantityStepper">
        <QuantityStepper aria-label="Cantidad" defaultValue={1} />
      </Case>
      <Case name="ScrollRow">
        <div className="w-60">
          <ScrollRow aria-label="Tarjetas" controls>
            {Array.from({ length: 6 }, (_, index) => (
              <ScrollRowItem key={index} className="w-40">
                Tarjeta {index + 1}
              </ScrollRowItem>
            ))}
          </ScrollRow>
        </div>
      </Case>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await checkTapHighlight(canvasElement, {
      Button: inCase('Button', 'button'),
      Badge: inCase('Badge', 'button'),
      Toggle: inCase('Toggle', 'button'),
      ToggleGroupItem: inCase('ToggleGroupItem', '[role=radio]'),
      TabsTrigger: inCase('TabsTrigger', '[role=tab]'),
      NavigationBarItem: inCase('NavigationBarItem', 'a'),
      'Chip body': inCase('Chip', 'button[aria-pressed]'),
      'Chip remove': inCase('Chip', 'button:not([aria-pressed])'),
      'Input field': inCase('Input', 'input'),
      'Input clear': inCase('Input', 'button'),
      Textarea: inCase('Textarea', 'textarea'),
      Checkbox: inCase('Checkbox', '[role=checkbox]'),
      Switch: inCase('Switch', '[role=switch]'),
      'CheckboxField row (SelectionField)': inCase('CheckboxField', 'label'),
      RadioGroupItem: inCase('RadioGroupItem', '[role=radio]'),
      'RadioGroupItem row (SelectionField)': inCase('RadioGroupItem', 'label'),
      RadioCard: inCase('RadioCard', '[role=radio]'),
      SelectTrigger: inCase('Select', '[role=combobox]'),
      'Combobox trigger': inCase('Combobox', 'button'),
      'Combobox multiple trigger': inCase('Combobox multiple', '[data-combobox-trigger]'),
      'Combobox search': inCase('Combobox inline', 'input'),
      'Combobox option': inCase('Combobox inline', '[role=option]'),
      'DataTable sort header': inCase('DataTable', 'th button'),
      'Calendar day': inCase('Calendar', '[role=gridcell] button'),
      'DatePicker trigger': inCase('DatePicker', 'button'),
      'FileInput button': inCase('FileInput', 'label'),
      'ImageUploader add': inCase('ImageUploader', 'button'),
      'QuantityStepper button': inCase('QuantityStepper', 'button'),
      'ScrollRow control': inCase('ScrollRow', 'button'),
    });
  },
};

// 2. SelectItem, in the open Select's portal.
export const SelectOpen: StoryObj = {
  render: () => (
    <Select defaultOpen>
      {redHighlight}
      <SelectTrigger aria-label="Talla">
        <SelectValue placeholder="Elegir" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="s">S</SelectItem>
      </SelectContent>
    </Select>
  ),
  play: async ({ canvasElement }) => {
    await checkTapHighlight(canvasElement.ownerDocument.body, { SelectItem: '[role=option]' });
  },
};

// 3. DropdownMenu items, in the open menu's portal.
export const DropdownMenuOpen: StoryObj = {
  render: () => (
    <DropdownMenu defaultOpen>
      {redHighlight}
      <DropdownMenuTrigger asChild>
        <Button>Menú</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Editar</DropdownMenuItem>
        <DropdownMenuCheckboxItem checked>Fijar</DropdownMenuCheckboxItem>
        <DropdownMenuRadioGroup value="a">
          <DropdownMenuRadioItem value="a">Lista</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  play: async ({ canvasElement }) => {
    await checkTapHighlight(canvasElement.ownerDocument.body, {
      DropdownMenuItem: '[role=menuitem]',
      DropdownMenuCheckboxItem: '[role=menuitemcheckbox]',
      DropdownMenuRadioItem: '[role=menuitemradio]',
    });
  },
};

// 4. Dialog: overlay (a tap closes it) and ✕.
export const DialogOpen: StoryObj = {
  render: () => (
    <Dialog defaultOpen>
      {redHighlight}
      <DialogContent>
        <DialogTitle>Título</DialogTitle>
        <DialogDescription>Descripción</DialogDescription>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    await checkTapHighlight(canvasElement.ownerDocument.body, {
      'Dialog overlay': '[data-state=open].fixed.inset-0:not([role=dialog])',
      'Dialog close': '[role=dialog] button',
    });
  },
};

// 5. Sheet: overlay and ✕.
export const SheetOpen: StoryObj = {
  render: () => (
    <Sheet defaultOpen>
      {redHighlight}
      <SheetContent closeLabel="Cerrar">
        <SheetTitle>Título</SheetTitle>
        <SheetDescription>Descripción</SheetDescription>
      </SheetContent>
    </Sheet>
  ),
  play: async ({ canvasElement }) => {
    await checkTapHighlight(canvasElement.ownerDocument.body, {
      'Sheet overlay': '[data-state=open].fixed.inset-0:not([role=dialog])',
      'Sheet close': '[role=dialog] button[aria-label=Cerrar], [role=dialog] button',
    });
  },
};
