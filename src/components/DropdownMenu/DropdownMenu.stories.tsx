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

// DropdownMenuCheckboxItem/RadioItem are fully controlled in Radix (no
// defaultChecked/defaultValue), so the demo needs its own state for the
// toggle/selection to show; a loose mock like in Switch/Checkbox isn't enough.
const DropdownMenuDemo = ({ onSelect, onCheckedChange, onValueChange }: DemoProps) => {
  const [notifications, setNotifications] = React.useState(false);
  const [theme, setTheme] = React.useState('light');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Abrir menú</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onSelect}>Perfil</DropdownMenuItem>
        <DropdownMenuItem>Facturación</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={notifications}
          onCheckedChange={(checked) => {
            setNotifications(checked);
            onCheckedChange?.(checked);
          }}
        >
          Mostrar notificaciones
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={(value) => {
            setTheme(value);
            onValueChange?.(value);
          }}
        >
          <DropdownMenuRadioItem value="light">Claro</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">Oscuro</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// 1. Default: open with a click, selecting an Item closes the menu, focus returns to the trigger.
export const Default: Story = {
  args: { onSelect: fn() },
  render: (args) => <DropdownMenuDemo {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Abrir menú' });

    // The content lives in a Portal outside canvasElement (same pattern as Select).
    const body = within(document.body);
    await expect(body.queryByRole('menu')).not.toBeInTheDocument();

    await userEvent.click(trigger);
    const menu = await body.findByRole('menu');

    const profileItem = within(menu).getByRole('menuitem', { name: 'Perfil' });
    await userEvent.click(profileItem);

    await expect(args.onSelect).toHaveBeenCalledTimes(1);
    // Selecting an Item closes the menu by default in Radix (no preventDefault in onSelect).
    await waitFor(() => expect(body.queryByRole('menu')).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
  },
};

// 2. KeyboardNavigation: open with the keyboard, move with the arrows, close with Escape.
export const KeyboardNavigation: Story = {
  render: () => <DropdownMenuDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Abrir menú' });

    trigger.focus();
    await userEvent.keyboard('{Enter}');

    const body = within(document.body);
    const menu = await body.findByRole('menu');
    const items = within(menu).getAllByRole('menuitem');

    // Radix moves focus to the first item automatically on opening.
    await waitFor(() => expect(items[0]).toHaveFocus());

    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => expect(items[1]).toHaveFocus());

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('menu')).not.toBeInTheDocument());
    // Focus returns to the trigger after closing (Radix's default onCloseAutoFocus,
    // same pattern already checked in Dialog/Sheet).
    await expect(trigger).toHaveFocus();
  },
};

// 3. CheckboxToggle: toggling a CheckboxItem. Since there's no uncontrolled mode, the menu
// is reopened to confirm aria-checked instead of reading it at the moment of closing (avoids
// flakiness from the Content's exit animation).
export const CheckboxToggle: Story = {
  args: { onCheckedChange: fn() },
  render: (args) => <DropdownMenuDemo {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Abrir menú' });
    const body = within(document.body);

    await userEvent.click(trigger);
    let menu = await body.findByRole('menu');
    let checkboxItem = within(menu).getByRole('menuitemcheckbox', {
      name: 'Mostrar notificaciones',
    });
    await expect(checkboxItem).toHaveAttribute('aria-checked', 'false');

    await userEvent.click(checkboxItem);

    await expect(args.onCheckedChange).toHaveBeenLastCalledWith(true);
    // Selecting a CheckboxItem also closes the menu by default in Radix.
    await waitFor(() => expect(body.queryByRole('menu')).not.toBeInTheDocument());

    await userEvent.click(trigger);
    menu = await body.findByRole('menu');
    checkboxItem = within(menu).getByRole('menuitemcheckbox', { name: 'Mostrar notificaciones' });
    await expect(checkboxItem).toHaveAttribute('aria-checked', 'true');
  },
};

// 4. RadioGroupSelection: selection inside a RadioGroup, same reopening criterion
// as CheckboxToggle.
export const RadioGroupSelection: Story = {
  args: { onValueChange: fn() },
  render: (args) => <DropdownMenuDemo {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Abrir menú' });
    const body = within(document.body);

    await userEvent.click(trigger);
    let menu = await body.findByRole('menu');
    let lightItem = within(menu).getByRole('menuitemradio', { name: 'Claro' });
    let darkItem = within(menu).getByRole('menuitemradio', { name: 'Oscuro' });
    await expect(lightItem).toHaveAttribute('aria-checked', 'true');
    await expect(darkItem).toHaveAttribute('aria-checked', 'false');

    await userEvent.click(darkItem);

    await expect(args.onValueChange).toHaveBeenLastCalledWith('dark');
    await waitFor(() => expect(body.queryByRole('menu')).not.toBeInTheDocument());

    await userEvent.click(trigger);
    menu = await body.findByRole('menu');
    lightItem = within(menu).getByRole('menuitemradio', { name: 'Claro' });
    darkItem = within(menu).getByRole('menuitemradio', { name: 'Oscuro' });
    await expect(darkItem).toHaveAttribute('aria-checked', 'true');
    await expect(lightItem).toHaveAttribute('aria-checked', 'false');
  },
};
