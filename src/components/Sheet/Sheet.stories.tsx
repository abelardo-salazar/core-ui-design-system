import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from './Sheet';
import { Button } from '../Button'; // Assuming Button exists from Phase 1
import { Input } from '../Input'; // Assuming Input exists from Phase 1

const meta = {
  title: 'Components/Navigation/Sheet',
  component: Sheet,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

const SheetDemo = ({ side }: { side: 'top' | 'right' | 'bottom' | 'left' }) => (
  <Sheet>
    <SheetTrigger asChild>
      <Button variant="outline">{side} sheet</Button>
    </SheetTrigger>
    <SheetContent side={side}>
      <SheetHeader>
        <SheetTitle>Edit profile</SheetTitle>
        <SheetDescription>
          Make changes to your profile here. Click save when you're done.
        </SheetDescription>
      </SheetHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <label htmlFor="name" className="text-right text-sm font-medium">
            Name
          </label>
          <Input id="name" defaultValue="Pedro Duarte" className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <label htmlFor="username" className="text-right text-sm font-medium">
            Username
          </label>
          <Input id="username" defaultValue="@pedro" className="col-span-3" />
        </div>
      </div>
      <SheetFooter>
        <SheetClose asChild>
          <Button type="submit">Save changes</Button>
        </SheetClose>
      </SheetFooter>
    </SheetContent>
  </Sheet>
);

export const Right: Story = {
  render: () => <SheetDemo side="right" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'right sheet' });

    const body = within(document.body);
    await expect(body.queryByRole('dialog')).not.toBeInTheDocument();

    await userEvent.click(trigger);

    // Sheet envuelve la misma primitiva de Radix Dialog, así que comparte el mismo
    // set de aserciones de foco que Dialog.
    const dialog = await body.findByRole('dialog');
    await expect(dialog.className.split(' ')).toContain('right-0');
    await expect(dialog.contains(document.activeElement)).toBe(true);

    // Touch target: p-3.5 (14px) lleva el hit box a 44x44 (Apple HIG) sin que el ícono
    // (h-4 w-4, 16x16) cambie de tamaño; right-0.5/top-0.5 (16px - 14px de padding)
    // compensa el offset para que el ícono quede en el mismo lugar visual que con
    // right-4/top-4 sin padding. El fixture de vitest-browser no aplica el CSS de
    // utilidades de Tailwind (mismo issue documentado en el story Destructive de Button),
    // así que la aserción va sobre las clases; el tamaño y la posición reales en píxeles
    // (44x44, ícono a 16px del borde superior/derecho) se verificaron a mano en Storybook
    // con devtools de un navegador real, en ambos temas.
    const closeButton = within(dialog).getByRole('button', { name: 'Close' });
    const closeClasses = closeButton.className.split(' ');
    await expect(closeClasses).toContain('p-3.5');
    await expect(closeClasses).toContain('right-0.5');
    await expect(closeClasses).toContain('top-0.5');
    await expect(closeButton.querySelector('svg')).toHaveClass('h-4', 'w-4');

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
  },
};

export const Left: Story = {
  render: () => <SheetDemo side="left" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'left sheet' });
    await userEvent.click(trigger);

    const dialog = await within(document.body).findByRole('dialog');
    await expect(dialog.className.split(' ')).toContain('left-0');
  },
};

export const Top: Story = {
  render: () => <SheetDemo side="top" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'top sheet' });
    await userEvent.click(trigger);

    const dialog = await within(document.body).findByRole('dialog');
    await expect(dialog.className.split(' ')).toContain('top-0');
  },
};

export const Bottom: Story = {
  render: () => <SheetDemo side="bottom" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'bottom sheet' });
    await userEvent.click(trigger);

    const dialog = await within(document.body).findByRole('dialog');
    await expect(dialog.className.split(' ')).toContain('bottom-0');
  },
};
