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

// A Sheet without a visible title: the title is hidden but Radix finds it, so it doesn't
// show the missing-title warning and the dialog keeps its accessible name. as="div"
// because SheetTitle is an h2, which can't go inside a span.
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
          <SheetDescription>Navega por las secciones del sitio.</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Abrir menú' }));

    // @radix-ui/react-dialog 1.1.23 no longer emits the missing-title warning (WarningProvider
    // does nothing), so spying on console.error couldn't fail. What the warning protected
    // is the accessible name: the dialog takes it from the hidden title through aria-labelledby, and without
    // SheetTitle this query fails.
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
