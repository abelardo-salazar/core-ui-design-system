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

// Button, Input and the Select trigger share the same height family (sm=32px,
// md=44px, lg=48px): in the same row, using them with the same size aligns them at the
// top and bottom. Here all three stay at their md size (the default of all three, without passing it
// explicitly): exactly the case that did NOT align before (Button md measured 40px, Input/Select
// also 40px, aligned by coincidence, not by design, and a 44px size="icon", like
// QuantityStepper's buttons, broke that alignment by 4px).
export const AlignedFormRow: StoryObj = {
  render: () => (
    <div className="flex items-center gap-2">
      <Input aria-label="Nombre" placeholder="Nombre" />
      <Select defaultValue="md">
        <SelectTrigger className="w-32" aria-label="Tamaño">
          <SelectValue placeholder="Tamaño" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="sm">Pequeño</SelectItem>
          <SelectItem value="md">Mediano</SelectItem>
          <SelectItem value="lg">Grande</SelectItem>
        </SelectContent>
      </Select>
      <Button>Buscar</Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText('Nombre');
    const trigger = canvas.getByRole('combobox');
    const button = canvas.getByRole('button', { name: 'Buscar' });

    // vitest-browser's headless fixture doesn't apply Tailwind's utilities or do real
    // layout, so this can only check the class, not the real height/alignment in
    // pixels (that was checked by hand in Storybook with a real browser, A/B against main:
    // all three with the same top/bottom).
    await expect(input.className.split(' ')).toContain('h-11');
    await expect(trigger.className.split(' ')).toContain('h-11');
    await expect(button.className.split(' ')).toContain('h-11');
  },
};
