import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from './Select';

const meta: Meta<typeof Select> = {
  title: 'Components/Select',
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Select>;

const SelectDemo = () => (
  <Select>
    <SelectTrigger className="w-[180px]">
      <SelectValue placeholder="Select a fruit" />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectLabel>Fruits</SelectLabel>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="blueberry">Blueberry</SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
);

// 1. Default: abrir con click, seleccionar con click.
export const Default: Story = {
  render: () => <SelectDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox');

    // El contenido vive en un Portal fuera de canvasElement (mismo patrón que
    // Dialog/Sheet/Popover/Toast).
    const body = within(document.body);
    await expect(body.queryByRole('listbox')).not.toBeInTheDocument();

    await userEvent.click(trigger);
    const listbox = await body.findByRole('listbox');

    const bananaOption = within(listbox).getByText('Banana');
    await userEvent.click(bananaOption);

    await expect(trigger).toHaveTextContent('Banana');
    await expect(body.queryByRole('listbox')).not.toBeInTheDocument();
  },
};

// 2. KeyboardSelection: abrir con click (patrón consistente con Default), navegar y
// seleccionar con teclado (flecha + Enter) — nunca verificado hasta ahora.
export const KeyboardSelection: Story = {
  render: () => <SelectDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox');

    const body = within(document.body);
    await userEvent.click(trigger);
    await body.findByRole('listbox');

    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{Enter}');

    await expect(trigger).toHaveTextContent('Banana');
    await expect(body.queryByRole('listbox')).not.toBeInTheDocument();
  },
};
