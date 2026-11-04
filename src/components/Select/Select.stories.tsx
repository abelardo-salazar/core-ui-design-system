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
      <SelectValue placeholder="Elige una fruta" />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectLabel>Frutas</SelectLabel>
        <SelectItem value="apple">Manzana</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="blueberry">Arándano</SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
);

// 1. Default: open with a click, select with a click.
export const Default: Story = {
  render: () => <SelectDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox');

    // The content lives in a Portal outside canvasElement (same pattern as
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

// 2. KeyboardSelection: open with a click (pattern consistent with Default), navigate and
// select with the keyboard (arrow + Enter); never checked until now.
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
