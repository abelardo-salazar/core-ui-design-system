import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { Textarea } from './Textarea';
import { Checkbox } from './Checkbox';
import { Switch } from './Switch';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from './Select';
import { Text } from './Typography';
import { Combobox } from './Combobox';
import { DatePicker } from './DatePicker';
import { DateRangePicker } from './DateRangePicker';
import { QuantityStepper } from './QuantityStepper';

const meta: Meta = {
  title: 'Examples/AdvancedForm',
  parameters: { layout: 'centered' },
};

export default meta;

export const SettingsForm: StoryObj = {
  render: () => (
    <Card className="w-[450px]">
      <CardHeader>
        <CardTitle>Ajustes de notificaciones</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Select Component */}
        <div className="space-y-2">
          <Text as="label" htmlFor="email-frequency" className="text-sm font-medium">
            Frecuencia de correos
          </Text>
          <Select defaultValue="daily">
            <SelectTrigger id="email-frequency">
              <SelectValue placeholder="Elige la frecuencia" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Frecuencia</SelectLabel>
                <SelectItem value="realtime">En tiempo real</SelectItem>
                <SelectItem value="daily">Resumen diario</SelectItem>
                <SelectItem value="weekly">Resumen semanal</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Switch Component */}
        <div className="flex items-center justify-between space-x-2">
          <div className="flex flex-col space-y-1">
            <Text as="label" htmlFor="marketing-emails" className="text-sm font-medium">
              Correos de marketing
            </Text>
            <Text className="text-xs text-base-content">Recibe ofertas y novedades.</Text>
          </div>
          <Switch id="marketing-emails" />
        </div>

        {/* Checkbox Component */}
        <div className="flex items-start space-x-2">
          <Checkbox id="terms" />
          <div className="grid gap-1.5 leading-none">
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Acepto los términos y condiciones
            </label>
            <Text className="text-xs text-base-content">
              Aceptas nuestros Términos del servicio y la Política de privacidad.
            </Text>
          </div>
        </div>

        {/* Textarea Component */}
        <div className="space-y-2">
          <Text className="text-sm font-medium">Comentarios</Text>
          <Textarea placeholder="Cuéntanos qué opinas..." />
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Guardar preferencias</Button>
      </CardFooter>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // axe: button-name; the SelectTrigger (combobox) and the Switch had no accessible name;
    // "Email Frequency"/"Marketing Emails" were loose text without htmlFor. The Checkbox next
    // to them already used <label htmlFor> correctly, which is why it never showed up in the report.
    await expect(canvas.getByLabelText('Frecuencia de correos')).toHaveAttribute(
      'role',
      'combobox',
    );
    await expect(canvas.getByLabelText('Correos de marketing')).toHaveAttribute('role', 'switch');
    await expect(canvas.getByLabelText('Acepto los términos y condiciones')).toHaveAttribute(
      'role',
      'checkbox',
    );
  },
};

const sizes = ['sm', 'md', 'lg'] as const;
const rect = (element: Element) => element.getBoundingClientRect();

// Button, Input, the Select trigger and the Combobox trigger share the same height family
// (sm=32px, md=44px, lg=48px): in the same row, using them with the same size aligns them at the
// top and bottom. The fields' text (16px) is larger than Button's on purpose: what aligns is the
// height, not the text. Runs with the CSS applied, so it measures the real boxes.
export const AlignedFormRow: StoryObj = {
  tags: ['real-css'],
  render: () => (
    <div className="flex flex-col gap-4">
      {sizes.map((size) => (
        <div key={size} data-row={size} className="flex items-center gap-2">
          <Input aria-label={`Nombre ${size}`} placeholder="Nombre" size={size} />
          <Select defaultValue="md">
            <SelectTrigger className="w-32" aria-label={`Tamaño ${size}`} size={size}>
              <SelectValue placeholder="Tamaño" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sm">Pequeño</SelectItem>
              <SelectItem value="md">Mediano</SelectItem>
              <SelectItem value="lg">Grande</SelectItem>
            </SelectContent>
          </Select>
          <div className="w-40">
            <Combobox aria-label={`Ciudad ${size}`} size={size} options={cities} />
          </div>
          <Button size={size}>Buscar</Button>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const size of sizes) {
      const row = canvasElement.querySelector(`[data-row="${size}"]`)!;
      const [input, ...others] = [
        row.querySelector('input')!,
        ...Array.from(row.querySelectorAll('button')),
      ];
      await expect(others).toHaveLength(3);
      for (const other of others) {
        await expect(rect(other).top).toBe(rect(input).top);
        await expect(rect(other).bottom).toBe(rect(input).bottom);
      }
    }
  },
};

const cities = [
  { value: 'cdmx', label: 'Ciudad de México' },
  { value: 'bogota', label: 'Bogotá' },
];
const fontSize = (element: Element, pseudoElement?: string) =>
  parseFloat(getComputedStyle(element, pseudoElement).fontSize);

// Text of 16px or more in every form field, in every size: iOS Safari zooms in on focusing an
// editable field with smaller text. Select and the pickers are <button>s (no zoom) but keep the
// same size so the form looks consistent. Measures the computed font-size with the CSS applied.
export const FieldTextSize: StoryObj = {
  tags: ['real-css'],
  render: () => (
    <div className="flex w-80 flex-col gap-4">
      {sizes.map((size) => (
        <React.Fragment key={size}>
          <div data-case={`Input ${size}`}>
            <Input aria-label={`Input ${size}`} size={size} />
          </div>
          <div data-case={`SelectTrigger ${size}`}>
            <Select>
              <SelectTrigger aria-label={`Select ${size}`} size={size}>
                <SelectValue placeholder="Elegir" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="a">A</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div data-case={`Combobox trigger ${size}`}>
            <Combobox aria-label={`Combobox ${size}`} size={size} options={cities} />
          </div>
          <div data-case={`Combobox multiple trigger ${size}`}>
            <Combobox
              aria-label={`Combobox múltiple ${size}`}
              size={size}
              multiple
              options={cities}
            />
          </div>
          <div data-case={`Combobox search ${size}`}>
            <Combobox aria-label={`Búsqueda ${size}`} mode="inline" size={size} options={cities} />
          </div>
        </React.Fragment>
      ))}
      <div data-case="Input file">
        <Input aria-label="Archivo" type="file" />
      </div>
      <div data-case="Textarea">
        <Textarea aria-label="Comentario" />
      </div>
      <div data-case="DatePicker">
        <DatePicker />
      </div>
      <div data-case="DateRangePicker">
        <DateRangePicker />
      </div>
      <div data-case="QuantityStepper">
        <QuantityStepper aria-label="Cantidad" defaultValue={1} />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    // By priority, not document order: QuantityStepper's first element is the − button.
    const editable = (box: Element) =>
      ['input, textarea', '[role=combobox]', 'button']
        .map((selector) => box.querySelector(selector))
        .find(Boolean)!;
    const sizesBelow16: Record<string, number> = {};
    for (const box of canvasElement.querySelectorAll('[data-case]')) {
      const px = fontSize(editable(box));
      if (px < 16) sizesBelow16[box.getAttribute('data-case')!] = px;
    }
    const fileButton = fontSize(
      canvasElement.querySelector('input[type=file]')!,
      '::file-selector-button',
    );
    if (fileButton < 16) sizesBelow16['Input file button'] = fileButton;
    await expect(sizesBelow16).toEqual({});
    await expect(canvasElement.querySelectorAll('[data-case]')).toHaveLength(20);
  },
};
