import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetBody,
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

const CLOSE_SAFE_TOP = 'top-[calc(0.125rem_+_env(safe-area-inset-top))]';
const CLOSE_SAFE_RIGHT = 'right-[calc(0.125rem_+_env(safe-area-inset-right))]';

// Anillo dentro del área táctil y sin separación, para que el overflow del panel no lo
// recorte; solo con teclado (focus-visible).
const expectInsetFocusRing = async (closeButton: HTMLElement) => {
  await expect(closeButton).toHaveClass('focus-visible:ring-2', 'focus-visible:ring-inset');
  await expect(closeButton.className).not.toMatch(/ring-offset/);
};

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
      <div className="grid gap-4">
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
    // (h-4 w-4, 16x16) cambie de tamaño; el offset de 2px + safe area deja el ícono a 16px
    // del borde. El fixture de vitest-browser no aplica el CSS de utilidades de Tailwind
    // (mismo issue documentado en el story Destructive de Button), así que la aserción va
    // sobre las clases; el tamaño y la posición reales en píxeles se verificaron a mano en
    // Storybook con un navegador real.
    const closeButton = within(dialog).getByRole('button', { name: 'Close' });
    await expect(closeButton).toHaveClass('p-3.5', CLOSE_SAFE_TOP, CLOSE_SAFE_RIGHT);
    await expectInsetFocusRing(closeButton);
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

    // El lado derecho del panel es el borde interior: la ✕ no suma safe area ahí.
    const closeButton = within(dialog).getByRole('button', { name: 'Close' });
    await expect(closeButton).toHaveClass(CLOSE_SAFE_TOP, 'right-0.5');
    await expectInsetFocusRing(closeButton);
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

    // El borde superior del panel es el interior: la ✕ no suma safe area ahí.
    const closeButton = within(dialog).getByRole('button', { name: 'Close' });
    await expect(closeButton).toHaveClass('top-0.5', CLOSE_SAFE_RIGHT);
    await expectInsetFocusRing(closeButton);
  },
};

type Side = 'top' | 'right' | 'bottom' | 'left';

// Contenido largo dentro de SheetBody: el body hace scroll y header/footer quedan fijos.
// Los inputs ocupan todo el ancho del body (y el primero y el último tocan su borde superior
// e inferior) para comprobar en un navegador real que el overflow no recorta el anillo de foco.
const LongSheetDemo = ({ side }: { side: Side }) => (
  <Sheet>
    <SheetTrigger asChild>
      <Button variant="outline">{side} long sheet</Button>
    </SheetTrigger>
    <SheetContent side={side}>
      <SheetHeader>
        <SheetTitle>Edit profile</SheetTitle>
        <SheetDescription>
          Make changes to your profile here. Click save when you're done.
        </SheetDescription>
      </SheetHeader>
      <SheetBody data-testid="sheet-body">
        <div className="grid gap-4">
          {Array.from({ length: 20 }, (_, i) => (
            <Input key={i} aria-label={`Field ${i + 1}`} placeholder={`Field ${i + 1}`} />
          ))}
        </div>
      </SheetBody>
      <SheetFooter>
        <SheetClose asChild>
          <Button type="submit">Save changes</Button>
        </SheetClose>
      </SheetFooter>
    </SheetContent>
  </Sheet>
);

// Estructura, no medidas: el fixture headless no aplica Tailwind ni hace layout. Que el
// footer quede visible, el alto máximo de top/bottom y los anillos sin recorte se verificaron
// a mano en Storybook con un navegador real.
const assertLongSheetStructure =
  (side: Side): Story['play'] =>
  async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: `${side} long sheet` }));

    const dialog = await within(document.body).findByRole('dialog');
    const sheetBody = within(dialog).getByTestId('sheet-body');
    await expect(sheetBody).toHaveClass('flex-1', 'min-h-0', 'overflow-y-auto');
    await expect(sheetBody.parentElement).toBe(dialog);

    const header = within(dialog).getByText('Edit profile').parentElement!;
    const footer = within(dialog).getByRole('button', { name: 'Save changes' }).parentElement!;
    await expect(header.parentElement).toBe(dialog);
    await expect(footer.parentElement).toBe(dialog);
    await expect(sheetBody.contains(header)).toBe(false);
    await expect(sheetBody.contains(footer)).toBe(false);

    const closeButton = within(dialog).getByRole('button', { name: 'Close' });
    await expect(dialog.lastElementChild).toBe(closeButton);
  };

export const LongContentRight: Story = {
  render: () => <LongSheetDemo side="right" />,
  play: assertLongSheetStructure('right'),
};

export const LongContentLeft: Story = {
  render: () => <LongSheetDemo side="left" />,
  play: assertLongSheetStructure('left'),
};

export const LongContentTop: Story = {
  render: () => <LongSheetDemo side="top" />,
  play: assertLongSheetStructure('top'),
};

export const LongContentBottom: Story = {
  render: () => <LongSheetDemo side="bottom" />,
  play: assertLongSheetStructure('bottom'),
};
