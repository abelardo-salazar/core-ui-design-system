import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { VisuallyHidden } from './VisuallyHidden';
import { Button } from '../Button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../Sheet';

const meta = {
  title: 'Components/VisuallyHidden',
  component: VisuallyHidden,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof VisuallyHidden>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Button size="icon" aria-describedby="hint">
      ★<VisuallyHidden id="hint">Agregar a favoritos</VisuallyHidden>
    </Button>
  ),
  play: async ({ canvasElement }) => {
    const hidden = within(canvasElement).getByText('Agregar a favoritos');
    await expect(hidden.tagName).toBe('SPAN');
    await expect(hidden).toHaveClass('sr-only');
  },
};

// Un Sheet sin título visible: el título queda oculto pero Radix lo encuentra, así que no
// muestra el aviso de título faltante y el diálogo conserva su nombre accesible. as="div"
// porque SheetTitle es un h2, que no puede ir dentro de un span.
export const HiddenSheetTitle: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Abrir menú</Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <VisuallyHidden as="div">
            <SheetTitle>Menú principal</SheetTitle>
          </VisuallyHidden>
          <SheetDescription>Navegá por las secciones del sitio.</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Abrir menú' }));

    // @radix-ui/react-dialog 1.1.23 ya no emite el aviso de título faltante (WarningProvider
    // no hace nada), así que espiar console.error no podría fallar. Lo que el aviso protegía
    // es el nombre accesible: el diálogo lo toma del título oculto vía aria-labelledby, y sin
    // SheetTitle esta búsqueda falla.
    const dialog = await within(document.body).findByRole('dialog', { name: 'Menú principal' });

    const title = within(dialog).getByText('Menú principal');
    await expect(title.parentElement).toHaveClass('sr-only');
    await expect(title.parentElement!.tagName).toBe('DIV');

    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(within(document.body).queryByRole('dialog')).not.toBeInTheDocument(),
    );
  },
};
