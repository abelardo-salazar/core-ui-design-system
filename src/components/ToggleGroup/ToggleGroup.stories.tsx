import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';
import {
  FontBoldIcon,
  FontItalicIcon,
  GridIcon,
  ListBulletIcon,
  TableIcon,
  UnderlineIcon,
} from '@radix-ui/react-icons';
import { Button } from '../Button';
import { ToggleGroup, ToggleGroupItem } from './ToggleGroup';
import type { ToggleGroupSize } from './toggleGroupVariants';

const meta: Meta<typeof ToggleGroup> = {
  title: 'Components/ToggleGroup',
  component: ToggleGroup,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof ToggleGroup>;

function ViewItems() {
  return (
    <>
      <ToggleGroupItem value="list">Lista</ToggleGroupItem>
      <ToggleGroupItem value="grid">Cuadrícula</ToggleGroupItem>
      <ToggleGroupItem value="table">Tabla</ToggleGroupItem>
    </>
  );
}

// 1. Modo único: radiogroup con ítems radio y aria-checked (no aria-pressed). size no llega al
// DOM ni en el grupo ni en los ítems.
export const Single: Story = {
  render: () => (
    <ToggleGroup type="single" defaultValue="list" aria-label="Vista" size="md">
      <ViewItems />
    </ToggleGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('radiogroup', { name: 'Vista' });
    const radios = within(group).getAllByRole('radio');

    await expect(radios).toHaveLength(3);
    await expect(canvas.getByRole('radio', { name: 'Lista' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await expect(canvas.getByRole('radio', { name: 'Tabla' })).toHaveAttribute(
      'aria-checked',
      'false',
    );
    for (const radio of radios) {
      await expect(radio).not.toHaveAttribute('aria-pressed');
      await expect(radio).not.toHaveAttribute('size');
    }
    await expect(group).not.toHaveAttribute('size');
  },
};

// 2. Modo múltiple: toolbar con aria-pressed; puede quedar vacío.
export const Multiple: Story = {
  args: { onValueChange: fn() },
  render: (args) => (
    <ToggleGroup
      type="multiple"
      defaultValue={['bold']}
      aria-label="Formato"
      onValueChange={args.onValueChange as (value: string[]) => void}
    >
      <ToggleGroupItem value="bold" aria-label="Negrita">
        <FontBoldIcon />
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Cursiva">
        <FontItalicIcon />
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Subrayado">
        <UnderlineIcon />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const toolbar = canvas.getByRole('toolbar', { name: 'Formato' });
    const bold = within(toolbar).getByRole('button', { name: 'Negrita' });
    const italic = within(toolbar).getByRole('button', { name: 'Cursiva' });

    await expect(canvas.queryByRole('radio')).not.toBeInTheDocument();
    await expect(bold).toHaveAttribute('aria-pressed', 'true');
    await expect(italic).toHaveAttribute('aria-pressed', 'false');
    await expect(bold).not.toHaveAttribute('aria-checked');

    await userEvent.click(italic);
    await expect(italic).toHaveAttribute('aria-pressed', 'true');
    await expect(args.onValueChange).toHaveBeenLastCalledWith(['bold', 'italic']);

    await userEvent.click(bold);
    await userEvent.click(italic);
    await expect(bold).toHaveAttribute('aria-pressed', 'false');
    await expect(italic).toHaveAttribute('aria-pressed', 'false');
    await expect(args.onValueChange).toHaveBeenLastCalledWith([]);
  },
};

// 3. Modo único no controlado: el clic sobre el ítem activo no lo desactiva y onValueChange no
// recibe ''.
export const SingleUncontrolledKeepsValue: Story = {
  args: { onValueChange: fn() },
  render: (args) => (
    <ToggleGroup
      type="single"
      defaultValue="grid"
      aria-label="Vista"
      onValueChange={args.onValueChange as (value: string) => void}
    >
      <ViewItems />
    </ToggleGroup>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const grid = canvas.getByRole('radio', { name: 'Cuadrícula' });
    const list = canvas.getByRole('radio', { name: 'Lista' });

    await userEvent.click(grid);
    await expect(grid).toHaveAttribute('aria-checked', 'true');
    await expect(args.onValueChange).not.toHaveBeenCalled();

    await userEvent.click(list);
    await expect(list).toHaveAttribute('aria-checked', 'true');
    await expect(grid).toHaveAttribute('aria-checked', 'false');
    await expect(args.onValueChange).toHaveBeenCalledExactlyOnceWith('list');

    await userEvent.click(list);
    await expect(list).toHaveAttribute('aria-checked', 'true');
    await expect(args.onValueChange).toHaveBeenCalledTimes(1);
  },
};

// 4. Modo único controlado: mismo comportamiento con value/onValueChange del consumidor.
function ControlledSingle({ onValueChange }: { onValueChange: (value: string) => void }) {
  const [value, setValue] = React.useState('grid');
  return (
    <div className="flex flex-col items-center gap-2">
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(next) => {
          setValue(next);
          onValueChange(next);
        }}
        aria-label="Vista"
      >
        <ViewItems />
      </ToggleGroup>
      <p data-testid="value">{value === '' ? '(vacío)' : value}</p>
    </div>
  );
}

export const SingleControlledKeepsValue: Story = {
  args: { onValueChange: fn() },
  render: (args) => (
    <ControlledSingle onValueChange={args.onValueChange as (value: string) => void} />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const grid = canvas.getByRole('radio', { name: 'Cuadrícula' });

    await userEvent.click(grid);
    await expect(grid).toHaveAttribute('aria-checked', 'true');
    await expect(canvas.getByTestId('value')).toHaveTextContent('grid');
    await expect(args.onValueChange).not.toHaveBeenCalled();

    await userEvent.click(canvas.getByRole('radio', { name: 'Tabla' }));
    await expect(canvas.getByTestId('value')).toHaveTextContent('table');
    await expect(args.onValueChange).toHaveBeenCalledExactlyOnceWith('table');
  },
};

// 5. Teclado: un solo punto de tabulación (entra en el ítem seleccionado); la flecha mueve el
// foco sin cambiar el valor; Space y Enter seleccionan.
export const Keyboard: Story = {
  args: { onValueChange: fn() },
  render: (args) => (
    <div className="flex items-center gap-4">
      <ToggleGroup
        type="single"
        defaultValue="list"
        aria-label="Vista"
        onValueChange={args.onValueChange as (value: string) => void}
      >
        <ViewItems />
      </ToggleGroup>
      <Button variant="outline">Después</Button>
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole('radio', { name: 'Lista' });
    const grid = canvas.getByRole('radio', { name: 'Cuadrícula' });
    const table = canvas.getByRole('radio', { name: 'Tabla' });

    await userEvent.tab();
    await expect(list).toHaveFocus();

    await userEvent.keyboard('{ArrowRight}');
    await expect(grid).toHaveFocus();
    await expect(list).toHaveAttribute('aria-checked', 'true');
    await expect(grid).toHaveAttribute('aria-checked', 'false');
    await expect(args.onValueChange).not.toHaveBeenCalled();

    await userEvent.keyboard(' ');
    await expect(grid).toHaveAttribute('aria-checked', 'true');
    await expect(list).toHaveAttribute('aria-checked', 'false');
    await expect(args.onValueChange).toHaveBeenLastCalledWith('grid');

    await userEvent.keyboard('{ArrowRight}');
    await expect(table).toHaveFocus();
    await expect(grid).toHaveAttribute('aria-checked', 'true');
    await userEvent.keyboard('{Enter}');
    await expect(table).toHaveAttribute('aria-checked', 'true');
    await expect(args.onValueChange).toHaveBeenLastCalledWith('table');

    // Un solo punto de tabulación: el siguiente Tab sale del grupo.
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Después' })).toHaveFocus();
  },
};

// 6. Tamaños: el grupo pasa size a los ítems por contexto y un ítem puede sobrescribirlo. El
// fixture headless no aplica Tailwind: la aserción va sobre las clases; las alturas reales
// (32/44/48) y la alineación con Button se verificaron en Storybook con un navegador real.
const sizes: ToggleGroupSize[] = ['sm', 'md', 'lg'];

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {sizes.map((size) => (
        <div key={size} className="flex items-center gap-2" data-testid={`row-${size}`}>
          <ToggleGroup type="single" defaultValue="list" size={size} aria-label={`Vista ${size}`}>
            <ToggleGroupItem value="list" aria-label="Lista">
              <ListBulletIcon />
            </ToggleGroupItem>
            <ToggleGroupItem value="grid" aria-label="Cuadrícula">
              <GridIcon />
            </ToggleGroupItem>
            <ToggleGroupItem value="table" aria-label="Tabla">
              <TableIcon />
            </ToggleGroupItem>
          </ToggleGroup>
          <Button variant="outline" size={size}>
            Exportar
          </Button>
        </div>
      ))}
      <ToggleGroup type="multiple" size="sm" aria-label="Mixto">
        <ToggleGroupItem value="a">Hereda sm</ToggleGroupItem>
        <ToggleGroupItem value="b" size="lg">
          Propio lg
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const heights: Record<ToggleGroupSize, string> = { sm: 'h-8', md: 'h-11', lg: 'h-12' };
    for (const size of sizes) {
      const group = canvas.getByRole('radiogroup', { name: `Vista ${size}` });
      for (const item of within(group).getAllByRole('radio')) {
        await expect(item).toHaveClass(heights[size]);
        await expect(item).not.toHaveAttribute('size');
      }
    }
    await expect(canvas.getByRole('button', { name: 'Hereda sm' })).toHaveClass('h-8');
    await expect(canvas.getByRole('button', { name: 'Propio lg' })).toHaveClass('h-12');
    await expect(canvas.getByRole('button', { name: 'Propio lg' })).not.toHaveClass('h-8');
  },
};
