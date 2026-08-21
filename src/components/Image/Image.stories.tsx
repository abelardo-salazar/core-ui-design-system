import type { Meta, StoryObj } from '@storybook/react';
import { expect, waitFor, within } from 'storybook/test';
import { Image } from './Image';

const meta: Meta<typeof Image> = {
  title: 'Components/Image',
  component: Image,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Image>;

// PNG 1x1 embebido: sin dependencia de red externa ni de que Storybook esté sirviendo un
// archivo local correctamente (a diferencia de una ruta como /broken-image.jpg, que acá
// necesitamos que SIEMPRE cargue con éxito, no que falle). Causante del flake original: esta
// story usaba https://github.com/shadcn.png, una imagen real por red.
const TINY_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

// 1. Ciclo completo: Skeleton visible mientras carga -> imagen visible al cargar.
export const LoadsSuccessfully: Story = {
  render: () => (
    <div className="h-32 w-32">
      <Image src={TINY_PNG} alt="Loaded photo" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // La carga real puede resolver antes o después de que el assert corra (mismo caso
    // documentado en Avatar.stories UserProfile), así que no afirmamos el estado inicial de
    // carga por timing — eso se verifica visualmente en el navegador (ver AGENT notes). A
    // diferencia de AvatarImage (Radix), nuestro <img> se monta de entrada (con alt ya
    // presente) para poder disparar onLoad/onError, así que findByAltText resuelve apenas se
    // monta, no cuando termina de cargar: hay que esperar el evento load real (img.complete).
    const img = canvas.getByAltText('Loaded photo');
    await waitFor(() => expect(img.complete && img.naturalWidth > 0).toBe(true));
    await waitFor(() => expect(img.className).not.toContain('invisible'));
    await expect(canvasElement.querySelector('.animate-pulse')).not.toBeInTheDocument();
  },
};

// 2. Error con fallback: se desmonta <img>, se muestra el nodo de fallback (compositivo, como
// AvatarFallback).
export const ErrorWithFallback: Story = {
  render: () => (
    <div className="h-32 w-32">
      <Image
        src="/broken-image.jpg"
        alt="Broken"
        fallback={<span className="flex h-full w-full items-center justify-center bg-base-200 text-xs">No image</span>}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Src dentro del propio origin (404, sin dependencia de red externa) — mismo patrón que
    // Avatar.stories FallbackState.
    await expect(await canvas.findByText('No image')).toBeInTheDocument();
    await expect(canvas.queryByAltText('Broken')).not.toBeInTheDocument();
  },
};

// 3. Error sin fallback: comportamiento mínimo documentado — no renderiza nada.
export const ErrorWithoutFallback: Story = {
  render: () => (
    <div className="h-32 w-32" data-testid="image-container">
      <Image src="/broken-image.jpg" alt="Broken" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const container = canvas.getByTestId('image-container');

    // Le damos tiempo al 404 a resolver antes de confirmar la ausencia total de contenido.
    await new Promise((resolve) => setTimeout(resolve, 300));

    // El wrapper interno de Image sigue montado (necesita seguir vivo por si src cambia), pero
    // no debe quedar ningún <img> ni contenido visible dentro — "no renderiza nada" documentado.
    await expect(canvas.queryByAltText('Broken')).not.toBeInTheDocument();
    await expect(container.querySelector('img')).not.toBeInTheDocument();
    await expect(container).toHaveTextContent('');
  },
};
