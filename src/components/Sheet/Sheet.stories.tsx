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

// Ring inside the touch area and without offset, so the panel's overflow doesn't clip
// it; keyboard only (focus-visible).
const expectInsetFocusRing = async (closeButton: HTMLElement) => {
  await expect(closeButton).toHaveClass('focus-visible:ring-2', 'focus-visible:ring-inset');
  await expect(closeButton.className).not.toMatch(/ring-offset/);
};

const SIDE_LABELS = {
  top: 'superior',
  right: 'derecho',
  bottom: 'inferior',
  left: 'izquierdo',
};

const SheetDemo = ({ side }: { side: 'top' | 'right' | 'bottom' | 'left' }) => (
  <Sheet>
    <SheetTrigger asChild>
      <Button variant="outline">Panel {SIDE_LABELS[side]}</Button>
    </SheetTrigger>
    <SheetContent side={side}>
      <SheetHeader>
        <SheetTitle>Editar perfil</SheetTitle>
        <SheetDescription>
          Haz los cambios en tu perfil aquí. Haz clic en guardar cuando termines.
        </SheetDescription>
      </SheetHeader>
      <div className="grid gap-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <label htmlFor="name" className="text-right text-sm font-medium">
            Nombre
          </label>
          <Input id="name" defaultValue="Pedro Duarte" className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <label htmlFor="username" className="text-right text-sm font-medium">
            Usuario
          </label>
          <Input id="username" defaultValue="@pedro" className="col-span-3" />
        </div>
      </div>
      <SheetFooter>
        <SheetClose asChild>
          <Button type="submit">Guardar cambios</Button>
        </SheetClose>
      </SheetFooter>
    </SheetContent>
  </Sheet>
);

export const Right: Story = {
  render: () => <SheetDemo side="right" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Panel derecho' });

    const body = within(document.body);
    await expect(body.queryByRole('dialog')).not.toBeInTheDocument();

    await userEvent.click(trigger);

    // Sheet wraps the same Radix Dialog primitive, so it shares the same
    // set of focus assertions as Dialog.
    const dialog = await body.findByRole('dialog');
    await expect(dialog.className.split(' ')).toContain('right-0');
    await expect(dialog.contains(document.activeElement)).toBe(true);

    // Touch target: p-3.5 (14px) takes the hit box to 44x44 (Apple HIG) without the icon
    // (h-4 w-4, 16x16) changing size; the 2px offset + safe area leaves the icon 16px
    // from the edge. The vitest-browser fixture doesn't apply Tailwind's utility CSS
    // (same issue documented in Button's Destructive story), so the assertion is
    // on the classes; the real pixel size and position were checked by hand in
    // Storybook with a real browser.
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
    const trigger = canvas.getByRole('button', { name: 'Panel izquierdo' });
    await userEvent.click(trigger);

    const dialog = await within(document.body).findByRole('dialog');
    await expect(dialog.className.split(' ')).toContain('left-0');

    // The panel's right edge is the inner one: the ✕ doesn't add safe area there.
    const closeButton = within(dialog).getByRole('button', { name: 'Close' });
    await expect(closeButton).toHaveClass(CLOSE_SAFE_TOP, 'right-0.5');
    await expectInsetFocusRing(closeButton);
  },
};

export const Top: Story = {
  render: () => <SheetDemo side="top" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Panel superior' });
    await userEvent.click(trigger);

    const dialog = await within(document.body).findByRole('dialog');
    await expect(dialog.className.split(' ')).toContain('top-0');
  },
};

export const Bottom: Story = {
  render: () => <SheetDemo side="bottom" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Panel inferior' });
    await userEvent.click(trigger);

    const dialog = await within(document.body).findByRole('dialog');
    await expect(dialog.className.split(' ')).toContain('bottom-0');

    // The panel's top edge is the inner one: the ✕ doesn't add safe area there.
    const closeButton = within(dialog).getByRole('button', { name: 'Close' });
    await expect(closeButton).toHaveClass('top-0.5', CLOSE_SAFE_RIGHT);
    await expectInsetFocusRing(closeButton);
  },
};

type Side = 'top' | 'right' | 'bottom' | 'left';

// Long content inside SheetBody: the body scrolls and header/footer stay fixed.
// The inputs take the full width of the body (and the first and last touch its top
// and bottom edges) to check in a real browser that the overflow doesn't clip the focus ring.
const LongSheetDemo = ({ side }: { side: Side }) => (
  <Sheet>
    <SheetTrigger asChild>
      <Button variant="outline">Panel largo {SIDE_LABELS[side]}</Button>
    </SheetTrigger>
    <SheetContent side={side}>
      <SheetHeader>
        <SheetTitle>Editar perfil</SheetTitle>
        <SheetDescription>
          Haz los cambios en tu perfil aquí. Haz clic en guardar cuando termines.
        </SheetDescription>
      </SheetHeader>
      <SheetBody data-testid="sheet-body">
        <div className="grid gap-4">
          {Array.from({ length: 20 }, (_, i) => (
            <Input key={i} aria-label={`Campo ${i + 1}`} placeholder={`Campo ${i + 1}`} />
          ))}
        </div>
      </SheetBody>
      <SheetFooter>
        <SheetClose asChild>
          <Button type="submit">Guardar cambios</Button>
        </SheetClose>
      </SheetFooter>
    </SheetContent>
  </Sheet>
);

// Structure, not measurements: the headless fixture doesn't apply Tailwind or do layout. That
// the footer stays visible, the max height of top/bottom and the unclipped rings were checked
// by hand in Storybook with a real browser.
const assertLongSheetStructure =
  (side: Side): Story['play'] =>
  async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: `Panel largo ${SIDE_LABELS[side]}` }));

    const dialog = await within(document.body).findByRole('dialog');
    const sheetBody = within(dialog).getByTestId('sheet-body');
    await expect(sheetBody).toHaveClass('flex-1', 'min-h-0', 'overflow-y-auto');
    await expect(sheetBody.parentElement).toBe(dialog);

    const header = within(dialog).getByText('Editar perfil').parentElement!;
    const footer = within(dialog).getByRole('button', { name: 'Guardar cambios' }).parentElement!;
    await expect(header.parentElement).toBe(dialog);
    // Room for the ✕ with the right safe area (without an inset it resolves to 24px; measured in
    // a real browser), symmetric on mobile to keep the centering.
    await expect(header).toHaveClass('px-[calc(1.5rem_+_env(safe-area-inset-right))]', 'sm:pl-0');
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

// closeLabel changes the accessible name of the ✕ ("Close" by default) and doesn't reach the DOM.
export const CustomCloseLabel: Story = {
  render: () => (
    <Sheet defaultOpen>
      <SheetContent closeLabel="Cerrar">
        <SheetHeader>
          <SheetTitle>Filtros</SheetTitle>
          <SheetDescription>Ajusta los resultados.</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  ),
  play: async () => {
    const dialog = await within(document.body).findByRole('dialog');
    await expect(within(dialog).getByRole('button', { name: 'Cerrar' })).toBeInTheDocument();
    await expect(within(dialog).queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
    await expect(dialog).not.toHaveAttribute('closelabel');
    await expect(dialog).not.toHaveAttribute('closeLabel');
  },
};
