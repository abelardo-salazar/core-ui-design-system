'use client';

import * as React from 'react';
import { cn } from '../../utils/cn';
import { Skeleton } from '../Skeleton';

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /**
   * Node to show if the image fails to load (compositional pattern, same as AvatarFallback).
   * If it isn't passed and loading fails, Image renders nothing; it doesn't bake in a "broken
   * image" icon by default. Explicit behavior, a decision documented here.
   */
  fallback?: React.ReactNode;
  /** Classes for the container that wraps <img> and the loading/error state. */
  containerClassName?: string;
  /**
   * Called once per `src`, also when the image finished loading before
   * hydration or was already cached. In that case Image fires the event again on the
   * `<img>`, so `event.nativeEvent.isTrusted` is `false`.
   */
  onLoad?: React.ReactEventHandler<HTMLImageElement>;
  /** Same as `onLoad`: once per `src`. An `Image` without `src` also calls it. */
  onError?: React.ReactEventHandler<HTMLImageElement>;
}

type ImageStatus = 'loading' | 'loaded' | 'error';

// Unlike Avatar (circular, already covered by @radix-ui/react-avatar), Image is
// rectangular and has no Radix primitive available: the loading/error state can only
// be known through onLoad/onError of the native <img>, so it definitely requires 'use client'.
// Meant to be used inside <AspectRatio> or another container with an explicit size: Image
// fills h-full w-full of its container, same as AvatarImage.
const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  ({ className, containerClassName, fallback, onLoad, onError, src, alt, ...props }, ref) => {
    const [status, setStatus] = React.useState<ImageStatus>('loading');
    const [prevSrc, setPrevSrc] = React.useState(src);

    // If src changes, it goes through the load cycle again instead of keeping the state
    // of the previous image. It's adjusted during render and not in a useEffect: a mount
    // effect that sets 'loading' can run after an early onError (cached src, busy
    // machine) and override it; the <img> doesn't emit error again and stays invisible
    // forever.
    if (src !== prevSrc) {
      setPrevSrc(src);
      setStatus('loading');
    }

    // With server rendering, the <img> in the HTML can finish loading (or fail) before
    // React hydrates and attaches onLoad/onError: the event is lost and status would stay
    // 'loading' forever (reproduced in Image.stories, LoadedBeforeHydration). On
    // mount and when src changes, the result is read directly from the element (complete with
    // naturalWidth > 0 is a load, with 0 is an error) and that event is fired again on
    // the <img>: React's handler is already attached, so the state changes through the normal
    // flow and the consumer's onLoad/onError is called too.
    //
    // resolvedRef stores the src whose result was already delivered, and the handlers ignore a
    // second event for the same src. It's needed both ways: with the image cached,
    // complete is already true in the effect but the real load arrives later, in another task
    // (without the guard in the handler, the consumer would get two onLoad). The src is compared
    // instead of resetting a boolean: with StrictMode the effect runs twice on mount and a reset
    // would fire the event again.
    const resolvedRef = React.useRef<{ src: typeof src } | null>(null);
    // Compare with null first: without src, resolvedRef.current?.src would also be undefined.
    const markResolved = () => {
      const resolved = resolvedRef.current;
      if (resolved !== null && resolved.src === src) return false;
      resolvedRef.current = { src };
      return true;
    };

    const imgRef = React.useRef<HTMLImageElement | null>(null);
    const setImgRef = React.useCallback(
      (node: HTMLImageElement | null) => {
        imgRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    React.useLayoutEffect(() => {
      const img = imgRef.current;
      const resolved = resolvedRef.current;
      if (!img?.complete || (resolved !== null && resolved.src === src)) return;
      img.dispatchEvent(new Event(img.naturalWidth > 0 ? 'load' : 'error'));
    }, [src]);

    return (
      <div className={cn('relative h-full w-full overflow-hidden', containerClassName)}>
        {status === 'loading' && <Skeleton className="absolute inset-0 h-full w-full" />}
        {status === 'error' && fallback}
        {/* Unmounted on failure: without this, a broken <img> stays invisible but remains in the DOM,
            which doesn't meet "renders nothing" when there's no fallback. It mounts again only
            if src changes (the prevSrc adjustment above resets status to 'loading'). */}
        {status !== 'error' && (
          <img
            ref={setImgRef}
            src={src}
            alt={alt}
            className={cn(
              'h-full w-full object-cover',
              status !== 'loaded' && 'invisible absolute inset-0',
              className,
            )}
            onLoad={(event) => {
              if (!markResolved()) return;
              setStatus('loaded');
              onLoad?.(event);
            }}
            onError={(event) => {
              if (!markResolved()) return;
              setStatus('error');
              onError?.(event);
            }}
            {...props}
          />
        )}
      </div>
    );
  },
);
Image.displayName = 'Image';

export { Image };
