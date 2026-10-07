import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { announce } from './announce';
import { Button } from '../components/Button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../components/Sheet';

const meta = {
  title: 'Utilities/announce',
  parameters: { layout: 'centered' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const POLITE = '[data-core-ui-announcer="polite"]';
const ASSERTIVE = '[data-core-ui-announcer="assertive"]';

// Las stories de este archivo comparten document: se borran las regiones de las anteriores
// para que cada una pruebe la creación desde cero.
const resetRegions = () =>
  document.querySelectorAll('[data-core-ui-announcer]').forEach((el) => el.remove());

const getRegion = (selector: string) => document.querySelector<HTMLElement>(selector);

const AnnounceDemo = () => (
  <Button variant="outline" onClick={() => announce('Cambios guardados')}>
    Anunciar
  </Button>
);

const SheetDemo = () => (
  <Sheet>
    <SheetTrigger asChild>
      <Button variant="outline">Abrir sheet</Button>
    </SheetTrigger>
    <SheetContent>
      <SheetHeader>
        <SheetTitle>Carrito</SheetTitle>
        <SheetDescription>Revisá los productos antes de pagar.</SheetDescription>
      </SheetHeader>
    </SheetContent>
  </Sheet>
);

export const Regions: Story = {
  render: () => <AnnounceDemo />,
  play: async () => {
    resetRegions();
    announce('Uno');
    announce('Dos');
    announce('Urgente', { politeness: 'assertive' });

    // Una sola región por nivel, aunque se llame varias veces.
    await expect(document.querySelectorAll(POLITE)).toHaveLength(1);
    await expect(document.querySelectorAll(ASSERTIVE)).toHaveLength(1);

    const polite = getRegion(POLITE)!;
    const assertive = getRegion(ASSERTIVE)!;
    await expect(polite.parentElement).toBe(document.body);
    await expect(polite).toHaveAttribute('aria-live', 'polite');
    await expect(assertive).toHaveAttribute('aria-live', 'assertive');
    // sr-only, no display:none ni hidden: una región oculta así no se anuncia.
    await expect(polite).toHaveClass('sr-only');
    await expect(polite).not.toHaveAttribute('hidden');
    await expect(polite.style.display).not.toBe('none');

    await waitFor(() => expect(polite).toHaveTextContent('Dos'));
    await waitFor(() => expect(assertive).toHaveTextContent('Urgente'));
  },
};

export const RepeatedMessage: Story = {
  render: () => <AnnounceDemo />,
  play: async ({ canvasElement }) => {
    resetRegions();
    const button = within(canvasElement).getByRole('button', { name: 'Anunciar' });
    await userEvent.click(button);
    const region = getRegion(POLITE)!;
    await waitFor(() => expect(region).toHaveTextContent('Cambios guardados'));

    // El mismo texto otra vez: la región se vacía y se vuelve a escribir, que es lo que hace
    // que el lector lo anuncie de nuevo.
    const writes: string[] = [];
    const observer = new MutationObserver(() => writes.push(region.textContent ?? ''));
    observer.observe(region, { childList: true, characterData: true, subtree: true });
    await userEvent.click(button);
    await waitFor(() => expect(writes).toEqual(['', 'Cambios guardados']));
    observer.disconnect();
  },
};

export const ClearsText: Story = {
  render: () => <AnnounceDemo />,
  play: async () => {
    resetRegions();
    announce('Temporal');
    const region = getRegion(POLITE)!;
    await waitFor(() => expect(region).toHaveTextContent('Temporal'));
    // Se borra a los 5s.
    await waitFor(() => expect(region).toBeEmptyDOMElement(), { timeout: 7000 });
  },
};

// hideOthers (aria-hidden, usado por Radix Dialog) pone aria-hidden en los hermanos del
// portal al abrir. El hijo de body que contiene el canvas sí debe quedar oculto: eso confirma
// que hideOthers corrió y que la aserción sobre la región no pasa por casualidad.
const expectRegionNotHidden = async (region: HTMLElement, canvasElement: HTMLElement) => {
  const appRoot = [...document.body.children].find((el) => el.contains(canvasElement));
  await expect(appRoot).toHaveAttribute('aria-hidden', 'true');
  await expect(region.closest('[aria-hidden="true"]')).toBeNull();
};

const openSheet = async (canvasElement: HTMLElement) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: 'Abrir sheet' }));
  await within(document.body).findByRole('dialog');
};

const closeSheet = async () => {
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(within(document.body).queryByRole('dialog')).not.toBeInTheDocument());
};

export const WithOpenSheetRegionBefore: Story = {
  render: () => <SheetDemo />,
  play: async ({ canvasElement }) => {
    resetRegions();
    announce('Antes de abrir');
    const region = getRegion(POLITE)!;

    await openSheet(canvasElement);
    await expectRegionNotHidden(region, canvasElement);
    announce('Producto agregado');
    await waitFor(() => expect(region).toHaveTextContent('Producto agregado'));
    await closeSheet();
  },
};

export const WithOpenSheetRegionAfter: Story = {
  render: () => <SheetDemo />,
  play: async ({ canvasElement }) => {
    resetRegions();
    await openSheet(canvasElement);

    announce('Producto agregado');
    const region = getRegion(POLITE)!;
    await expectRegionNotHidden(region, canvasElement);
    await waitFor(() => expect(region).toHaveTextContent('Producto agregado'));
    await closeSheet();
  },
};
