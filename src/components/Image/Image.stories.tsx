import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
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

// Imagen que falla: un data URI que no se puede decodificar. Falla en el propio navegador, sin
// pedir nada al servidor. Antes estas stories usaban /broken-image.jpg, que el servidor de vitest
// no responde con un 404 sino con su HTML de fallback (200); el error dependía de cuánto
// tardaba ese servidor (y de si el navegador revalidaba la respuesta en caché de una story
// anterior), y las stories fallaban a veces con la máquina cargada.
const BROKEN_SRC = 'data:image/png;base64,AAAA';

// Cuenta los eventos load/error que dispara el navegador (isTrusted) dentro de un contenedor.
// load y error no burbujean, pero sí pasan por la fase de captura. Sirve para comprobar que un
// callback se llamó "exactamente una vez" sin esperar un tiempo fijo: una vez llegado el evento
// real del navegador, ya no puede llegar otro para ese src.
function countBrowserEvents(container: HTMLElement) {
  const counts = { load: 0, error: 0 };
  const listener = (event: Event) => {
    if (event.isTrusted && (event.type === 'load' || event.type === 'error')) {
      counts[event.type] += 1;
    }
  };
  container.addEventListener('load', listener, true);
  container.addEventListener('error', listener, true);
  return counts;
}

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
        src={BROKEN_SRC}
        alt="Broken"
        fallback={
          <span className="flex h-full w-full items-center justify-center bg-base-200 text-xs">
            No image
          </span>
        }
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText('No image')).toBeInTheDocument();
    await expect(canvas.queryByAltText('Broken')).not.toBeInTheDocument();
  },
};

// 3. Error sin fallback: comportamiento mínimo documentado — no renderiza nada.
export const ErrorWithoutFallback: Story = {
  args: { onError: fn() },
  render: (args) => (
    <div className="h-32 w-32" data-testid="image-container">
      <Image src={BROKEN_SRC} alt="Broken" onError={args.onError} />
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const container = canvas.getByTestId('image-container');

    // Se espera el error en sí, no un tiempo fijo: la ausencia de contenido solo significa algo
    // después de que la imagen falló.
    await waitFor(() => expect(args.onError).toHaveBeenCalledOnce());

    // El wrapper interno de Image sigue montado (necesita seguir vivo por si src cambia), pero
    // no debe quedar ningún <img> ni contenido visible dentro — "no renderiza nada" documentado.
    await expect(canvas.queryByAltText('Broken')).not.toBeInTheDocument();
    await expect(container.querySelector('img')).not.toBeInTheDocument();
    await expect(container).toHaveTextContent('');
  },
};

// 4. Carrera error-antes-del-efecto: si el <img> falla antes de que React ejecute los efectos
// pasivos del montaje (src en caché con la máquina cargada), el error no debe perderse. El
// wrapper dispara el `error` desde un useLayoutEffect, que corre antes de esos efectos. El
// <img> es lazy dentro de un contenedor display:none (inline: el fixture headless no aplica
// Tailwind), así que el navegador nunca lo carga y ningún evento real tapa el resultado.
function ErrorBeforeEffects() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  React.useLayoutEffect(() => {
    containerRef.current?.querySelector('img')?.dispatchEvent(new Event('error'));
  }, []);
  return (
    <div ref={containerRef} data-testid="image-container" style={{ display: 'none' }}>
      <Image src="/never-loaded.jpg" alt="Early error" loading="lazy" />
    </div>
  );
}

export const ErrorBeforeMountEffects: Story = {
  render: () => <ErrorBeforeEffects />,
  play: async ({ canvasElement }) => {
    const container = within(canvasElement).getByTestId('image-container');
    // Sin espera: el error ya ocurrió de forma síncrona durante el montaje.
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await expect(container.querySelector('img')).not.toBeInTheDocument();
  },
};

// 5. Renderizado en servidor: el HTML del servidor trae el <img>, que puede terminar de cargar
// antes de que React se hidrate y conecte onLoad. La imagen no debe quedarse en 'loading'
// (invisible, con el Skeleton encima). El play hace lo que haría Next: renderToString, inyecta
// el HTML, espera el evento load del navegador (sin listener de React) y recién entonces
// hidrata. El onLoad del consumidor se llama una sola vez, con el evento que Image vuelve a
// disparar sobre el <img> (isTrusted false).
export const LoadedBeforeHydration: Story = {
  render: () => <div className="h-32 w-32" data-testid="ssr-container" />,
  play: async ({ canvasElement }) => {
    const container = within(canvasElement).getByTestId('ssr-container');
    const onLoad = fn();
    const ssrImage = <Image src={TINY_PNG} alt="Server image" onLoad={onLoad} />;
    const browserEvents = countBrowserEvents(container);
    container.innerHTML = renderToString(ssrImage);

    await waitFor(() => expect(browserEvents.load).toBe(1));
    await expect(container.querySelector('img')!.naturalWidth).toBeGreaterThan(0);

    const root = hydrateRoot(container, ssrImage);
    try {
      await waitFor(() =>
        expect(container.querySelector('img')?.className).not.toContain('invisible'),
      );
      await expect(container.querySelector('.animate-pulse')).not.toBeInTheDocument();
      await expect(onLoad).toHaveBeenCalledOnce();
      await expect(onLoad.mock.calls[0][0].nativeEvent.isTrusted).toBe(false);
    } finally {
      root.unmount();
    }
  },
};

// 6. Lo mismo con una imagen que falla antes de hidratar: debe mostrarse el fallback y el
// onError del consumidor se llama una sola vez.
export const ErrorBeforeHydration: Story = {
  render: () => <div className="h-32 w-32" data-testid="ssr-container" />,
  play: async ({ canvasElement }) => {
    const container = within(canvasElement).getByTestId('ssr-container');
    const onError = fn();
    const ssrBrokenImage = (
      <Image
        src={BROKEN_SRC}
        alt="Broken server image"
        fallback={<span>No image</span>}
        onError={onError}
      />
    );
    const browserEvents = countBrowserEvents(container);
    container.innerHTML = renderToString(ssrBrokenImage);

    await waitFor(() => expect(browserEvents.error).toBe(1));

    const root = hydrateRoot(container, ssrBrokenImage);
    try {
      await waitFor(() => expect(container).toHaveTextContent('No image'));
      await expect(container.querySelector('img')).not.toBeInTheDocument();
      await expect(onError).toHaveBeenCalledOnce();
      await expect(onError.mock.calls[0][0].nativeEvent.isTrusted).toBe(false);
    } finally {
      root.unmount();
    }
  },
};

// 7. Sin src: un <img> sin src queda complete con naturalWidth 0, así que cuenta como error y
// se muestra el fallback (antes quedaba el Skeleton para siempre: nunca llega load ni error).
export const WithoutSrc: Story = {
  render: () => (
    <div className="h-32 w-32">
      <Image alt="Sin imagen" fallback={<span>No image</span>} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText('No image')).toBeInTheDocument();
    await expect(canvas.queryByAltText('Sin imagen')).not.toBeInTheDocument();
    await expect(canvasElement.querySelector('.animate-pulse')).not.toBeInTheDocument();
  },
};

// 8. Cambio de src tras un error: el <img> vuelve a montarse y recorre de nuevo el ciclo de
// carga, en vez de quedarse en el estado de error de la imagen anterior.
function SwitchSrcAfterError() {
  const [src, setSrc] = React.useState(BROKEN_SRC);
  return (
    <div className="space-y-2">
      <div className="h-32 w-32">
        <Image src={src} alt="Switchable" fallback={<span>No image</span>} />
      </div>
      <button type="button" onClick={() => setSrc(TINY_PNG)}>
        Cambiar imagen
      </button>
    </div>
  );
}

export const RecoversWhenSrcChanges: Story = {
  render: () => <SwitchSrcAfterError />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText('No image')).toBeInTheDocument();
    await expect(canvas.queryByAltText('Switchable')).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: 'Cambiar imagen' }));

    const img = await canvas.findByAltText('Switchable');
    await waitFor(() => expect(img.className).not.toContain('invisible'));
    await expect(canvas.queryByText('No image')).not.toBeInTheDocument();
  },
};

// 9. Carga en el cliente, normal y con la imagen ya en caché: el callback del consumidor se
// llama una sola vez. Con la imagen en caché, complete ya es true cuando corre el efecto de
// Image y el evento real del navegador llega después: sin la guarda, onLoad/onError se
// llamarían dos veces. Cada clic monta una imagen más; se espera el evento real antes de contar.
function ImageList({
  src,
  onLoad,
  onError,
}: {
  src: string;
  onLoad: () => void;
  onError: () => void;
}) {
  const [count, setCount] = React.useState(0);
  return (
    <div className="space-y-2">
      <button type="button" onClick={() => setCount((c) => c + 1)}>
        Agregar imagen
      </button>
      <div className="flex gap-2">
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="h-16 w-16">
            <Image src={src} alt={`Imagen ${i + 1}`} onLoad={onLoad} onError={onError} />
          </div>
        ))}
      </div>
    </div>
  );
}

const callsOnceStory = (src: string, type: 'load' | 'error'): Story => ({
  args: { onLoad: fn(), onError: fn() },
  render: (args) => (
    <ImageList src={src} onLoad={args.onLoad as () => void} onError={args.onError as () => void} />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const browserEvents = countBrowserEvents(canvasElement);
    const callback = type === 'load' ? args.onLoad : args.onError;
    const other = type === 'load' ? args.onError : args.onLoad;

    // Primera imagen (carga normal) y segunda (el mismo src, ya en caché).
    for (const n of [1, 2]) {
      await userEvent.click(canvas.getByRole('button', { name: 'Agregar imagen' }));
      await waitFor(() => expect(browserEvents[type]).toBe(n));
      await expect(callback).toHaveBeenCalledTimes(n);
    }
    await expect(other).not.toHaveBeenCalled();
  },
});

export const LoadCallsOnLoadOnce = callsOnceStory(TINY_PNG, 'load');
export const ErrorCallsOnErrorOnce = callsOnceStory(BROKEN_SRC, 'error');
