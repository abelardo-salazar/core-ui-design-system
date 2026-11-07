import type * as React from 'react';
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

const sizedTrigger = (label: string, props: React.ComponentProps<typeof SelectTrigger> = {}) => (
  <Select>
    <SelectTrigger aria-label={label} className="w-[180px]" {...props}>
      <SelectValue placeholder="Elige una fruta" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="apple">Manzana</SelectItem>
    </SelectContent>
  </Select>
);

const sizeCases = (
  <div className="flex flex-col gap-4">
    {sizedTrigger('Pequeño', { size: 'sm' })}
    {sizedTrigger('Por defecto')}
    {sizedTrigger('Grande', { size: 'lg' })}
    {sizedTrigger('Con error', { 'aria-invalid': true })}
  </div>
);

// 3. size and aria-invalid on the trigger itself: size goes to the variants, never to the DOM;
// the error classes are always there and only apply with aria-invalid="true".
export const TriggerSizeAndError: Story = {
  render: () => sizeCases,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const small = canvas.getByRole('combobox', { name: 'Pequeño' });
    const byDefault = canvas.getByRole('combobox', { name: 'Por defecto' });
    await expect(small).not.toHaveAttribute('size');
    await expect(small).toHaveClass('h-8', 'px-2', 'text-xs');
    await expect(byDefault).toHaveClass(
      'h-11',
      'px-3',
      'text-sm',
      'aria-[invalid=true]:border-error',
    );
    await expect(byDefault).not.toHaveAttribute('aria-invalid');
    await expect(canvas.getByRole('combobox', { name: 'Con error' })).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  },
};

// 4. Same, with the CSS applied: 32/44/48px, and with aria-invalid the error border and the error
// focus ring win over border-base-300 and ring-primary with no `!`.
export const TriggerSizeAndErrorStyles: Story = {
  tags: ['real-css'],
  render: () => sizeCases,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = (name: string) => canvas.getByRole('combobox', { name });
    await expect(trigger('Pequeño').getBoundingClientRect().height).toBe(32);
    await expect(trigger('Por defecto').getBoundingClientRect().height).toBe(44);
    await expect(trigger('Grande').getBoundingClientRect().height).toBe(48);

    const errorColor = getComputedStyle(document.documentElement).getPropertyValue('--color-error');
    const swatch = document.createElement('div');
    swatch.style.color = `var(--color-error)`;
    document.body.append(swatch);
    const error = getComputedStyle(swatch).color;
    swatch.remove();
    await expect(errorColor).not.toBe('');

    const invalid = trigger('Con error');
    await expect(getComputedStyle(invalid).borderTopColor).toBe(error);
    await expect(getComputedStyle(trigger('Por defecto')).borderTopColor).not.toBe(error);

    // The ring is a box-shadow in the ring color: focused, it carries the error color.
    invalid.focus();
    await expect(getComputedStyle(invalid).boxShadow).toContain(error);
    invalid.blur();
  },
};
