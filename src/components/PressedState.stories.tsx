import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { forcePseudoState } from '../../.storybook/forcePseudoState';
import { Badge } from './Badge';
import { Button } from './Button';
import { Calendar } from './Calendar';
import { Chip } from './Chip';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from './Dialog';
import { Input } from './Input';
import { NavigationBar, NavigationBarItem } from './NavigationBar';
import { RadioCard, RadioGroup } from './RadioGroup';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from './Sheet';
import { Tabs, TabsList, TabsTrigger } from './Tabs';
import { Toggle } from './Toggle';
import { ToggleGroup, ToggleGroupItem } from './ToggleGroup';

const meta: Meta = {
  title: 'Examples/PressedState',
  tags: ['real-css'],
};

export default meta;

// Transitions off, so the computed style is the final one and not a frame of the animation.
// A red tap highlight on <body>: the property is inherited and desktop Chromium's default is
// already transparent, so only an element that declares its own transparent one passes.
const harness = (
  <style>
    {
      '*, *::before, *::after { transition: none !important; } body { -webkit-tap-highlight-color: rgb(255, 0, 0); }'
    }
  </style>
);

const PROPERTIES = ['backgroundColor', 'color', 'opacity', 'textDecorationLine'] as const;
const snapshot = (element: Element) => {
  const style = getComputedStyle(element);
  return Object.fromEntries(PROPERTIES.map((property) => [property, style[property]]));
};

type Target = {
  name: string;
  element: Element;
  /** Disabled: pressing it must not change anything. */
  disabled?: boolean;
  /** Its hover doesn't change anything either (e.g. the current tab): skips the sanity check. */
  hoverIsInert?: boolean;
};

// In touch, hover: never applies (Tailwind v4 wraps it in @media (hover: hover)), so the pressed
// state is the only feedback: forced :active must look exactly like forced :hover. Each enabled
// target also drops the tap highlight; a disabled one looks the same pressed or not.
const checkPressed = async (targets: Target[]) => {
  const mismatches: Record<string, unknown> = {};
  for (const { name, element, disabled, hoverIsInert } of targets) {
    if (!(await forcePseudoState(element, []))) return; // Storybook UI: no CDP.
    const base = snapshot(element);
    await forcePseudoState(element, ['active']);
    const active = snapshot(element);
    await forcePseudoState(element, ['hover']);
    const hover = snapshot(element);
    await forcePseudoState(element, []);

    if (disabled) {
      if (JSON.stringify(active) !== JSON.stringify(base)) mismatches[name] = { base, active };
      continue;
    }
    if (JSON.stringify(active) !== JSON.stringify(hover)) mismatches[name] = { hover, active };
    if (!hoverIsInert && JSON.stringify(hover) === JSON.stringify(base))
      mismatches[`${name} (hover changes nothing)`] = base;
    const highlight = getComputedStyle(element).getPropertyValue('-webkit-tap-highlight-color');
    if (highlight !== 'rgba(0, 0, 0, 0)') mismatches[`${name} (tap highlight)`] = highlight;
  }
  await expect(mismatches).toEqual({});
};

// 1. The inline interactive components: each element that has a hover: has the same style
// pressed, with the same token; the disabled ones don't react.
export const PressedLooksLikeHover: StoryObj = {
  render: () => (
    <div className="flex flex-col items-start gap-4">
      {harness}
      <div className="flex flex-wrap gap-2">
        <Button>Primario</Button>
        <Button variant="secondary">Secundario</Button>
        <Button variant="outline">Contorno</Button>
        <Button variant="ghost">Fantasma</Button>
        <Button variant="link">Enlace</Button>
        <Button variant="destructive">Eliminar</Button>
        <Button disabled>Deshabilitado</Button>
        <Button asChild disabled>
          <a href="#ir">Enlace deshabilitado</a>
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge interactive variant="outline">
          Insignia
        </Badge>
        <Badge interactive variant="ghost">
          Insignia fantasma
        </Badge>
        <Badge interactive disabled>
          Insignia deshabilitada
        </Badge>
      </div>
      <div className="flex flex-wrap gap-2">
        <Toggle>Apagado</Toggle>
        <Toggle defaultPressed>Encendido</Toggle>
        <Toggle disabled>Toggle deshabilitado</Toggle>
      </div>
      <div className="flex flex-wrap gap-2">
        <Chip onRemove={() => {}} removeLabel="Quitar filtro">
          Filtro
        </Chip>
        <Chip onRemove={() => {}} removeLabel="Quitar filtro deshabilitado" disabled>
          Deshabilitado
        </Chip>
      </div>
      <div className="w-64">
        <Input aria-label="Buscar" defaultValue="texto" clearable clearLabel="Borrar" />
      </div>
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">Pestaña activa</TabsTrigger>
          <TabsTrigger value="b">Otra pestaña</TabsTrigger>
          <TabsTrigger value="c" disabled>
            Pestaña deshabilitada
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <ToggleGroup type="single" defaultValue="a" aria-label="Vista">
        <ToggleGroupItem value="a">Elegido</ToggleGroupItem>
        <ToggleGroupItem value="b">Sin elegir</ToggleGroupItem>
        <ToggleGroupItem value="c" disabled>
          Ítem deshabilitado
        </ToggleGroupItem>
      </ToggleGroup>
      <div className="w-80">
        <NavigationBar aria-label="Principal">
          <NavigationBarItem href="#inicio" active icon={<span />}>
            Inicio
          </NavigationBarItem>
          <NavigationBarItem href="#perfil" icon={<span />}>
            Perfil
          </NavigationBarItem>
        </NavigationBar>
      </div>
      <div className="w-64">
        <RadioGroup aria-label="Talla">
          <RadioCard value="s" title="Talla S" />
          <RadioCard value="l" title="Talla L" disabled />
        </RadioGroup>
      </div>
      <Calendar
        mode="single"
        selected={new Date(2027, 2, 15)}
        defaultMonth={new Date(2027, 2, 1)}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = (name: string | RegExp) => canvas.getByRole('button', { name });
    await checkPressed([
      { name: 'Button primary', element: button('Primario') },
      { name: 'Button secondary', element: button('Secundario') },
      { name: 'Button outline', element: button('Contorno') },
      { name: 'Button ghost', element: button('Fantasma') },
      { name: 'Button link', element: button('Enlace') },
      { name: 'Button destructive', element: button('Eliminar') },
      { name: 'Button disabled', element: button('Deshabilitado'), disabled: true },
      {
        name: 'Button asChild aria-disabled',
        element: canvas.getByRole('link', { name: 'Enlace deshabilitado' }),
        disabled: true,
      },
      { name: 'Badge outline', element: button('Insignia') },
      { name: 'Badge ghost', element: button('Insignia fantasma') },
      { name: 'Badge disabled', element: button('Insignia deshabilitada'), disabled: true },
      { name: 'Toggle off', element: button('Apagado') },
      { name: 'Toggle on', element: button('Encendido') },
      { name: 'Toggle disabled', element: button('Toggle deshabilitado'), disabled: true },
      { name: 'Chip remove', element: button('Quitar filtro') },
      {
        name: 'Chip remove disabled',
        element: button('Quitar filtro deshabilitado'),
        disabled: true,
      },
      { name: 'Input clear', element: button('Borrar') },
      {
        name: 'TabsTrigger active',
        element: canvas.getByRole('tab', { name: 'Pestaña activa' }),
        hoverIsInert: true,
      },
      { name: 'TabsTrigger', element: canvas.getByRole('tab', { name: 'Otra pestaña' }) },
      {
        name: 'TabsTrigger disabled',
        element: canvas.getByRole('tab', { name: 'Pestaña deshabilitada' }),
        disabled: true,
      },
      {
        name: 'ToggleGroupItem on',
        element: canvas.getByRole('radio', { name: 'Elegido' }),
        hoverIsInert: true,
      },
      { name: 'ToggleGroupItem', element: canvas.getByRole('radio', { name: 'Sin elegir' }) },
      {
        name: 'ToggleGroupItem disabled',
        element: canvas.getByRole('radio', { name: 'Ítem deshabilitado' }),
        disabled: true,
      },
      {
        name: 'NavigationBarItem current',
        element: canvas.getByRole('link', { name: 'Inicio' }),
        hoverIsInert: true,
      },
      { name: 'NavigationBarItem', element: canvas.getByRole('link', { name: 'Perfil' }) },
      { name: 'RadioCard', element: canvas.getByRole('radio', { name: 'Talla S' }) },
      {
        name: 'RadioCard disabled',
        element: canvas.getByRole('radio', { name: 'Talla L' }),
        disabled: true,
      },
      { name: 'Calendar selected day', element: button(/selected/i) },
      { name: 'Calendar nav', element: button(/next month/i) },
    ]);
  },
};

// 2. The ✕ of Dialog (Sheet has its own story: two modals can't be open at once).
export const DialogClosePressed: StoryObj = {
  render: () => (
    <Dialog defaultOpen>
      {harness}
      <DialogContent>
        <DialogTitle>Título</DialogTitle>
        <DialogDescription>Descripción</DialogDescription>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    const dialog = within(canvasElement.ownerDocument.body).getByRole('dialog');
    await checkPressed([
      { name: 'Dialog close', element: within(dialog).getByRole('button', { name: /close/i }) },
    ]);
  },
};

// 3. The ✕ of Sheet.
export const SheetClosePressed: StoryObj = {
  render: () => (
    <Sheet defaultOpen>
      {harness}
      <SheetContent closeLabel="Cerrar">
        <SheetTitle>Título</SheetTitle>
        <SheetDescription>Descripción</SheetDescription>
      </SheetContent>
    </Sheet>
  ),
  play: async ({ canvasElement }) => {
    const sheet = within(canvasElement.ownerDocument.body).getByRole('dialog');
    await checkPressed([
      { name: 'Sheet close', element: within(sheet).getByRole('button', { name: 'Cerrar' }) },
    ]);
  },
};
