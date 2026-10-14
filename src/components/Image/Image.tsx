'use client';

import * as React from 'react';
import { cn } from '../../utils/cn';
import { Skeleton } from '../Skeleton';

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /**
   * Nodo a mostrar si la imagen falla al cargar (patrón compositivo, igual que AvatarFallback).
   * Si no se pasa y la carga falla, Image no renderiza nada — no hornea un ícono de "imagen
   * rota" por default. Comportamiento explícito, decisión documentada aquí.
   */
  fallback?: React.ReactNode;
  /** Clases para el contenedor que envuelve <img> y el estado de carga/error. */
  containerClassName?: string;
}

type ImageStatus = 'loading' | 'loaded' | 'error';

// A diferencia de Avatar (circular, ya cubierto por @radix-ui/react-avatar), Image es
// rectangular y no tiene primitiva de Radix disponible: el estado de carga/error solo se
// puede conocer vía onLoad/onError del <img> nativo, así que requiere 'use client' con certeza.
// Pensado para usarse dentro de <AspectRatio> u otro contenedor con tamaño explícito: Image
// llena h-full w-full de su contenedor, igual que AvatarImage.
const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  ({ className, containerClassName, fallback, onLoad, onError, src, alt, ...props }, ref) => {
    const [status, setStatus] = React.useState<ImageStatus>('loading');
    const [prevSrc, setPrevSrc] = React.useState(src);

    // Si cambia el src, vuelve a pasar por el ciclo de carga en vez de conservar el estado
    // de la imagen anterior. Se ajusta durante el render y no en un useEffect: un efecto de
    // montaje que pone 'loading' puede correr después de un onError temprano (src en caché,
    // máquina cargada) y pisarlo; el <img> ya no vuelve a emitir error y queda invisible para
    // siempre.
    if (src !== prevSrc) {
      setPrevSrc(src);
      setStatus('loading');
    }

    // Con renderizado en servidor, el <img> del HTML puede terminar de cargar (o fallar) antes
    // de que React se hidrate y conecte onLoad/onError: el evento se pierde y status quedaría
    // en 'loading' para siempre (reproducido en Image.stories, LoadedBeforeHydration). Al
    // montar y al cambiar src se lee el resultado directo del elemento: complete con
    // naturalWidth > 0 es una carga, con 0 es un error. Solo se resuelve desde 'loading', así
    // que un onLoad/onError que ya llegó no se pisa.
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
      if (!img?.complete) return;
      const result = img.naturalWidth > 0 ? 'loaded' : 'error';
      setStatus((current) => (current === 'loading' ? result : current));
    }, [src]);

    return (
      <div className={cn('relative h-full w-full overflow-hidden', containerClassName)}>
        {status === 'loading' && <Skeleton className="absolute inset-0 h-full w-full" />}
        {status === 'error' && fallback}
        {/* Se desmonta al fallar: sin esto, un <img> roto queda invisible pero sigue en el DOM,
            lo cual no cumple "no renderiza nada" cuando no hay fallback. Vuelve a montarse solo
            si el src cambia (el ajuste de prevSrc de arriba resetea status a 'loading'). */}
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
              setStatus('loaded');
              onLoad?.(event);
            }}
            onError={(event) => {
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
