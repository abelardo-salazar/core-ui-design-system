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

// Embedded 1x1 PNG: no dependency on an external network or on Storybook serving a local
// file correctly (unlike a path such as /broken-image.jpg, which here we need to ALWAYS
// load successfully, not fail). Cause of the original flake: this story used
// https://github.com/shadcn.png, a real image over the network.
const TINY_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

// Image that fails: a data URI that can't be decoded. It fails in the browser itself, without
// requesting anything from the server. Before, these stories used /broken-image.jpg, which the
// vitest server doesn't answer with a 404 but with its fallback HTML (200); the error depended
// on how long that server took (and on whether the browser revalidated the cached response
// from a previous story), and the stories sometimes failed on a busy machine.
const BROKEN_SRC = 'data:image/png;base64,AAAA';

// Counts the load/error events the browser fires (isTrusted) inside a container.
// load and error don't bubble, but they do go through the capture phase. It's used to check
// that a callback was called "exactly once" without waiting a fixed time: once the real
// browser event has arrived, no other one can arrive for that src.
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

// 1. Full cycle: Skeleton visible while loading -> image visible once loaded.
export const LoadsSuccessfully: Story = {
  render: () => (
    <div className="h-32 w-32">
      <Image src={TINY_PNG} alt="Loaded photo" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // The real load can resolve before or after the assert runs (same case documented in
    // Avatar.stories UserProfile), so we don't assert the initial loading state through
    // timing; that is checked visually in the browser (see AGENT notes). Unlike
    // AvatarImage (Radix), our <img> is mounted right away (with alt already present) to be
    // able to fire onLoad/onError, so findByAltText resolves as soon as it mounts, not
    // when it finishes loading: we have to wait for the real load event (img.complete).
    const img = canvas.getByAltText('Loaded photo');
    await waitFor(() => expect(img.complete && img.naturalWidth > 0).toBe(true));
    await waitFor(() => expect(img.className).not.toContain('invisible'));
    await expect(canvasElement.querySelector('.animate-pulse')).not.toBeInTheDocument();
  },
};

// 2. Error with fallback: <img> is unmounted, the fallback node is shown (compositional, like
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

// 3. Error without fallback: documented minimal behavior; it renders nothing.
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

    // Wait for the error itself, not a fixed time: the absence of content only means something
    // after the image failed.
    await waitFor(() => expect(args.onError).toHaveBeenCalledOnce());

    // Image's inner wrapper stays mounted (it has to stay alive in case src changes), but
    // no <img> or visible content must remain inside it: the documented "renders nothing".
    await expect(canvas.queryByAltText('Broken')).not.toBeInTheDocument();
    await expect(container.querySelector('img')).not.toBeInTheDocument();
    await expect(container).toHaveTextContent('');
  },
};

// 4. Error-before-effect race: if the <img> fails before React runs the passive mount
// effects (cached src on a busy machine), the error must not be lost. The
// wrapper fires the `error` from a useLayoutEffect, which runs before those effects. The
// <img> is lazy inside a display:none container (inline: the headless fixture doesn't apply
// Tailwind), so the browser never loads it and no real event covers up the result.
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
    // No waiting: the error already happened synchronously during mount.
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await expect(container.querySelector('img')).not.toBeInTheDocument();
  },
};

// 5. Server rendering: the server HTML brings the <img>, which can finish loading
// before React hydrates and attaches onLoad. The image must not stay 'loading'
// (invisible, with the Skeleton on top). The play does what Next would: renderToString, injects
// the HTML, waits for the browser load event (without a React listener) and only then
// hydrates. The consumer's onLoad is called once, with the event that Image fires again
// on the <img> (isTrusted false).
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

// 6. Same with an image that fails before hydration: the fallback must show and the
// consumer's onError is called once.
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

// 7. No src: an <img> without src is complete with naturalWidth 0, so it counts as an error and
// the fallback is shown (before, the Skeleton stayed forever: neither load nor error ever arrives).
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

// 8. src change after an error: the <img> mounts again and goes through the load cycle
// again, instead of staying in the previous image's error state.
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

// 9. Load on the client, normal and with the image already cached: the consumer's callback is
// called once. With the image cached, complete is already true when Image's effect runs and
// the real browser event arrives later: without the guard, onLoad/onError would be
// called twice. Each click mounts one more image; we wait for the real event before counting.
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

    // First image (normal load) and second one (the same src, already cached).
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
