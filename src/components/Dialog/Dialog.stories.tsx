import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from './Dialog';
import { Button } from '../Button';
import { Input } from '../Input';
import { Text } from '../Typography'; // Using our new Typography component!

const meta: Meta<typeof Dialog> = {
  title: 'Components/Dialog',
  component: Dialog,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Dialog>;

export const EditProfileExample: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Editar perfil</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar perfil</DialogTitle>
          <DialogDescription>
            Haz los cambios en tu perfil aquí. Haz clic en guardar cuando termines.
          </DialogDescription>
        </DialogHeader>

        {/* Form Content */}
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Text as="label" htmlFor="name" className="text-right" size="lg" weight="medium">
              Nombre
            </Text>
            <Input id="name" defaultValue="Pedro Duarte" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Text as="label" htmlFor="username" className="text-right" size="lg" weight="medium">
              Usuario
            </Text>
            <Input id="username" defaultValue="@pedrodev" className="col-span-3" />
          </div>
        </div>

        <DialogFooter>
          {/* We can use DialogClose to auto-close on click */}
          <DialogClose asChild>
            <Button variant="ghost">Cancelar</Button>
          </DialogClose>
          <Button type="submit">Guardar cambios</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Editar perfil' });

    const body = within(document.body);
    await expect(body.queryByRole('dialog')).not.toBeInTheDocument();

    await userEvent.click(trigger);

    const dialog = await body.findByRole('dialog');
    const dialogScope = within(dialog);

    // Touch target: p-3.5 (14px) takes the hit box to 44x44 (Apple HIG) without the icon
    // (h-4 w-4, 16x16) changing size; right-0.5/top-0.5 (16px - 14px of padding)
    // compensates the offset so the icon stays in the same visual spot as with
    // right-4/top-4 without padding. The vitest-browser fixture doesn't apply Tailwind's
    // utility CSS (same issue documented in Button's Destructive story),
    // so the assertion is on the classes; the real pixel size and position
    // (44x44, icon 16px from the top/right edge) were checked by hand in Storybook
    // with the devtools of a real browser, in both themes.
    const closeButton = dialogScope.getByRole('button', { name: 'Close' });
    const closeClasses = closeButton.className.split(' ');
    await expect(closeClasses).toContain('p-3.5');
    await expect(closeClasses).toContain('right-0.5');
    await expect(closeClasses).toContain('top-0.5');
    await expect(closeButton.querySelector('svg')).toHaveClass('h-4', 'w-4');
    // Ring same as Sheet's ✕: keyboard only (focus-visible), inside the touch
    // area and without offset. It doesn't appear with the mouse.
    await expect(closeButton).toHaveClass(
      'focus-visible:ring-2',
      'focus-visible:ring-inset',
      'focus-visible:ring-primary',
    );
    await expect(closeButton.className).not.toMatch(/(^|\s)focus:|ring-offset/);

    // axe: label; the inputs had no real label, only loose text without htmlFor.
    await expect(dialogScope.getByLabelText('Nombre')).toHaveValue('Pedro Duarte');
    await expect(dialogScope.getByLabelText('Usuario')).toHaveValue('@pedrodev');

    // Radix moves focus inside the content on opening (FocusScope), left untested until now.
    await expect(dialog.contains(document.activeElement)).toBe(true);

    // Escape closes the dialog (Radix's DismissableLayer).
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());

    // Focus returns to the trigger after closing (Radix's default onCloseAutoFocus).
    await expect(trigger).toHaveFocus();
  },
};

// closeLabel changes the accessible name of the ✕ ("Close" by default) and doesn't reach the DOM.
export const CustomCloseLabel: Story = {
  render: () => (
    <Dialog defaultOpen>
      <DialogContent closeLabel="Cerrar">
        <DialogHeader>
          <DialogTitle>Editar perfil</DialogTitle>
          <DialogDescription>Cambia tus datos.</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  ),
  play: async () => {
    const dialog = await within(document.body).findByRole('dialog');
    await expect(within(dialog).getByRole('button', { name: 'Cerrar' })).toBeInTheDocument();
    await expect(within(dialog).queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
    await expect(dialog).not.toHaveAttribute('closelabel');
    await expect(dialog).not.toHaveAttribute('closeLabel');
  },
};
