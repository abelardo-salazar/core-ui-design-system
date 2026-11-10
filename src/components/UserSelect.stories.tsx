import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';
import { Badge } from './Badge';
import { Button } from './Button';
import { Calendar } from './Calendar';
import { Chip } from './Chip';
import { Combobox } from './Combobox';
import { Input } from './Input';
import { NavigationBar, NavigationBarItem } from './NavigationBar';
import { RadioCard, RadioGroup } from './RadioGroup';
import { Tabs, TabsList, TabsTrigger } from './Tabs';
import { Textarea } from './Textarea';
import { Toggle } from './Toggle';
import { ToggleGroup, ToggleGroupItem } from './ToggleGroup';

const meta: Meta = {
  title: 'Examples/UserSelect',
  tags: ['real-css'],
};

export default meta;

// On iOS, a long press on a control selects its text and shows the copy handles: every
// actionable control that looks like a button has user-select: none. An editable field must
// stay selectable, also when it sits next to Chips (Combobox multiple): select-none on one of
// its ancestors would block selecting and editing it on iOS.
const userSelect = (element: Element) => getComputedStyle(element).getPropertyValue('user-select');

const describe = (element: Element) =>
  `${element.tagName.toLowerCase()}${element.className ? `.${String(element.className).split(' ').slice(0, 3).join('.')}` : ''}`;

const checkUserSelect = async (
  root: Element,
  cases: Record<string, string>,
  expected: 'none' | 'selectable',
) => {
  const wrong: Record<string, string> = {};
  for (const [name, selector] of Object.entries(cases)) {
    const element = root.querySelector(selector);
    if (!element) {
      wrong[name] = `not found: ${selector}`;
      continue;
    }
    if (expected === 'none') {
      if (userSelect(element) !== 'none') wrong[name] = userSelect(element);
      continue;
    }
    // user-select isn't inherited per the spec, and engines differ in what the field itself
    // computes: walk the field and every ancestor up to the root, none may compute to none.
    for (let node: Element | null = element; node; node = node.parentElement) {
      if (userSelect(node) === 'none') {
        wrong[name] = `none on ${node === element ? 'the field' : describe(node)}`;
        break;
      }
      if (node === root) break;
    }
  }
  await expect(wrong).toEqual({});
};

const cities = [
  { value: 'cdmx', label: 'Ciudad de México' },
  { value: 'bogota', label: 'Bogotá' },
];

const Case = ({ name, children }: { name: string; children: React.ReactNode }) => (
  <div data-case={name}>{children}</div>
);
const inCase = (name: string, selector: string) => `[data-case="${name}"] ${selector}`;

// 1. Controls with a button look: not selectable. Fields: selectable.
export const InlineElements: StoryObj = {
  render: () => (
    <div className="flex w-96 flex-col items-start gap-3">
      <Case name="Button">
        <Button>Botón</Button>
      </Case>
      <Case name="Button link">
        <Button asChild>
          <a href="#destino">Enlace con aspecto de botón</a>
        </Button>
      </Case>
      <Case name="Calendar">
        <Calendar mode="single" defaultMonth={new Date(2027, 2, 1)} />
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
      <Case name="Badge">
        <Badge interactive>Insignia</Badge>
      </Case>
      <Case name="Chip">
        <Chip onPressedChange={() => {}} onRemove={() => {}} removeLabel="Quitar">
          Filtro
        </Chip>
      </Case>
      <Case name="RadioCard">
        <RadioGroup aria-label="Pago">
          <RadioCard value="b" title="Tarjeta" description="Visa o Mastercard" />
        </RadioGroup>
      </Case>
      <Case name="Input">
        <Input aria-label="Nombre" defaultValue="texto" />
      </Case>
      <Case name="Textarea">
        <Textarea aria-label="Comentario" defaultValue="texto" />
      </Case>
      <Case name="Combobox inline">
        <Combobox aria-label="Destino" mode="inline" options={cities} />
      </Case>
      <Case name="Combobox inline multiple">
        <Combobox
          aria-label="Destinos"
          mode="inline"
          multiple
          options={cities}
          defaultValue={['cdmx']}
        />
      </Case>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await checkUserSelect(
      canvasElement,
      {
        Button: inCase('Button', 'button'),
        'Button asChild link': inCase('Button link', 'a'),
        'Calendar day (buttonVariants)': inCase('Calendar', '[role=gridcell] button'),
        Toggle: inCase('Toggle', 'button'),
        ToggleGroupItem: inCase('ToggleGroupItem', '[role=radio]'),
        TabsTrigger: inCase('TabsTrigger', '[role=tab]'),
        NavigationBarItem: inCase('NavigationBarItem', 'a'),
        'Badge interactive': inCase('Badge', 'button'),
        'Chip body': inCase('Chip', 'button[aria-pressed]'),
        'Chip remove': inCase('Chip', 'button:not([aria-pressed])'),
        RadioCard: inCase('RadioCard', '[role=radio]'),
        // The Chips come before the search field and the options (divs): the first button is a ✕.
        'Chip remove in Combobox multiple': inCase('Combobox inline multiple', 'button'),
      },
      'none',
    );
    await checkUserSelect(
      canvasElement,
      {
        Input: inCase('Input', 'input'),
        Textarea: inCase('Textarea', 'textarea'),
        'Combobox search': inCase('Combobox inline', 'input'),
        'Combobox multiple search (next to the Chips)': inCase('Combobox inline multiple', 'input'),
      },
      'selectable',
    );
  },
};

// 2. Combobox multiple in popover mode: the search field opens in the portal, anchored to the
// container with the Chips.
export const ComboboxMultipleOpen: StoryObj = {
  render: () => (
    <div className="w-96">
      <Combobox aria-label="Ciudades" multiple options={cities} defaultValue={['cdmx']} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const body = canvasElement.ownerDocument.body;
    await userEvent.click(canvasElement.querySelector('[data-combobox-trigger]')!);
    await within(body).findByRole('dialog');
    await checkUserSelect(
      canvasElement,
      { 'Chip remove': 'button:not([data-combobox-trigger])' },
      'none',
    );
    await checkUserSelect(
      body,
      { 'Combobox multiple search': '[role=dialog] input' },
      'selectable',
    );
  },
};
