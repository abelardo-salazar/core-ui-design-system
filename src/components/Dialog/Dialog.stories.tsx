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
        <Button variant="outline">Edit Profile</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        {/* Form Content */}
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Text as="label" htmlFor="name" className="text-right" size="lg" weight="medium">
              Name
            </Text>
            <Input id="name" defaultValue="Pedro Duarte" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Text as="label" htmlFor="username" className="text-right" size="lg" weight="medium">
              Username
            </Text>
            <Input id="username" defaultValue="@pedrodev" className="col-span-3" />
          </div>
        </div>

        <DialogFooter>
          {/* We can use DialogClose to auto-close on click */}
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Edit Profile' });

    const body = within(document.body);
    await expect(body.queryByRole('dialog')).not.toBeInTheDocument();

    await userEvent.click(trigger);

    const dialog = await body.findByRole('dialog');
    const dialogScope = within(dialog);

    // Touch target: p-3.5 (14px) lleva el hit box a 44x44 (Apple HIG) sin que el ícono
    // (h-4 w-4, 16x16) cambie de tamaño; right-0.5/top-0.5 (16px - 14px de padding)
    // compensa el offset para que el ícono quede en el mismo lugar visual que con
    // right-4/top-4 sin padding. El fixture de vitest-browser no aplica el CSS de
    // utilidades de Tailwind (mismo issue documentado en el story Destructive de Button),
    // así que la aserción va sobre las clases; el tamaño y la posición reales en píxeles
    // (44x44, ícono a 16px del borde superior/derecho) se verificaron a mano en Storybook
    // con devtools de un navegador real, en ambos temas.
    const closeButton = dialogScope.getByRole('button', { name: 'Close' });
    const closeClasses = closeButton.className.split(' ');
    await expect(closeClasses).toContain('p-3.5');
    await expect(closeClasses).toContain('right-0.5');
    await expect(closeClasses).toContain('top-0.5');
    await expect(closeButton.querySelector('svg')).toHaveClass('h-4', 'w-4');

    // axe: label — los inputs no tenían label real, solo texto suelto sin htmlFor.
    await expect(dialogScope.getByLabelText('Name')).toHaveValue('Pedro Duarte');
    await expect(dialogScope.getByLabelText('Username')).toHaveValue('@pedrodev');

    // Radix mueve el foco dentro del contenido al abrir (FocusScope), delegado sin test hasta ahora.
    await expect(dialog.contains(document.activeElement)).toBe(true);

    // Escape cierra el diálogo (DismissableLayer de Radix).
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());

    // El foco vuelve al trigger tras cerrar (onCloseAutoFocus por defecto de Radix).
    await expect(trigger).toHaveFocus();
  },
};
