import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from './DropdownMenu';
import { Button } from '../Button';

const meta: Meta<typeof DropdownMenu> = {
  title: 'Components/DropdownMenu',
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof DropdownMenu>;

interface DemoProps {
  onSelect?: () => void;
  onCheckedChange?: (checked: boolean) => void;
  onValueChange?: (value: string) => void;
}

// DropdownMenuCheckboxItem/RadioItem son totalmente controlados en Radix (sin
// defaultChecked/defaultValue), así que el demo necesita estado propio para que el
// toggle/selección se vea reflejado — no alcanza con un mock suelto como en Switch/Checkbox.
const DropdownMenuDemo = ({ onSelect, onCheckedChange, onValueChange }: DemoProps) => {
  const [notifications, setNotifications] = React.useState(false);
  const [theme, setTheme] = React.useState('light');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Open menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onSelect}>Profile</DropdownMenuItem>
        <DropdownMenuItem>Billing</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={notifications}
          onCheckedChange={(checked) => {
            setNotifications(checked);
            onCheckedChange?.(checked);
          }}
        >
          Show notifications
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={(value) => {
            setTheme(value);
            onValueChange?.(value);
          }}
        >
          <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// 1. Default — abrir con click, seleccionar un Item cierra el menú, foco vuelve al trigger.
export const Default: Story = {
  args: { onSelect: fn() },
  render: (args) => <DropdownMenuDemo {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Open menu' });

    // El contenido vive en un Portal fuera de canvasElement (mismo patrón que Select).
    const body = within(document.body);
    await expect(body.queryByRole('menu')).not.toBeInTheDocument();

    await userEvent.click(trigger);
    const menu = await body.findByRole('menu');

    const profileItem = within(menu).getByRole('menuitem', { name: 'Profile' });
    await userEvent.click(profileItem);

    await expect(args.onSelect).toHaveBeenCalledTimes(1);
    // Seleccionar un Item cierra el menú por default en Radix (sin preventDefault en onSelect).
    await waitFor(() => expect(body.queryByRole('menu')).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
  },
};

// 2. KeyboardNavigation — abrir con teclado, navegar con flechas, cerrar con Escape.
export const KeyboardNavigation: Story = {
  render: () => <DropdownMenuDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Open menu' });

    trigger.focus();
    await userEvent.keyboard('{Enter}');

    const body = within(document.body);
    const menu = await body.findByRole('menu');
    const items = within(menu).getAllByRole('menuitem');

    // Radix mueve el foco al primer item automáticamente al abrir.
    await waitFor(() => expect(items[0]).toHaveFocus());

    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => expect(items[1]).toHaveFocus());

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('menu')).not.toBeInTheDocument());
    // El foco vuelve al trigger tras cerrar (onCloseAutoFocus por defecto de Radix,
    // mismo patrón ya verificado en Dialog/Sheet).
    await expect(trigger).toHaveFocus();
  },
};

// 3. CheckboxToggle — toggle de CheckboxItem. Como no hay modo no controlado, se reabre el
// menú para confirmar aria-checked en vez de leerlo en el instante del cierre (evita
// flakiness por la animación de salida del Content).
export const CheckboxToggle: Story = {
  args: { onCheckedChange: fn() },
  render: (args) => <DropdownMenuDemo {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Open menu' });
    const body = within(document.body);

    await userEvent.click(trigger);
    let menu = await body.findByRole('menu');
    let checkboxItem = within(menu).getByRole('menuitemcheckbox', { name: 'Show notifications' });
    await expect(checkboxItem).toHaveAttribute('aria-checked', 'false');

    await userEvent.click(checkboxItem);

    await expect(args.onCheckedChange).toHaveBeenLastCalledWith(true);
    // Seleccionar un CheckboxItem también cierra el menú por default en Radix.
    await waitFor(() => expect(body.queryByRole('menu')).not.toBeInTheDocument());

    await userEvent.click(trigger);
    menu = await body.findByRole('menu');
    checkboxItem = within(menu).getByRole('menuitemcheckbox', { name: 'Show notifications' });
    await expect(checkboxItem).toHaveAttribute('aria-checked', 'true');
  },
};

// 4. RadioGroupSelection — selección dentro de RadioGroup, mismo criterio de reapertura
// que CheckboxToggle.
export const RadioGroupSelection: Story = {
  args: { onValueChange: fn() },
  render: (args) => <DropdownMenuDemo {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Open menu' });
    const body = within(document.body);

    await userEvent.click(trigger);
    let menu = await body.findByRole('menu');
    let lightItem = within(menu).getByRole('menuitemradio', { name: 'Light' });
    let darkItem = within(menu).getByRole('menuitemradio', { name: 'Dark' });
    await expect(lightItem).toHaveAttribute('aria-checked', 'true');
    await expect(darkItem).toHaveAttribute('aria-checked', 'false');

    await userEvent.click(darkItem);

    await expect(args.onValueChange).toHaveBeenLastCalledWith('dark');
    await waitFor(() => expect(body.queryByRole('menu')).not.toBeInTheDocument());

    await userEvent.click(trigger);
    menu = await body.findByRole('menu');
    lightItem = within(menu).getByRole('menuitemradio', { name: 'Light' });
    darkItem = within(menu).getByRole('menuitemradio', { name: 'Dark' });
    await expect(darkItem).toHaveAttribute('aria-checked', 'true');
    await expect(lightItem).toHaveAttribute('aria-checked', 'false');
  },
};
