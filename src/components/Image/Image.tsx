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
  /**
   * Se llama una sola vez por `src`, también cuando la imagen terminó de cargar antes de la
   * hidratación o ya estaba en caché. En ese caso Image vuelve a disparar el evento sobre el
   * `<img>`, así que `event.nativeEvent.isTrusted` es `false`.
   */
  onLoad?: React.ReactEventHandler<HTMLImageElement>;
  /** Igual que `onLoad`: una sola vez por `src`. Una `Image` sin `src` también lo llama. */
  onError?: React.ReactEventHandler<HTMLImageElement>;
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
    // montar y al cambiar src se lee el resultado directo del elemento (complete con
    // naturalWidth > 0 es una carga, con 0 es un error) y se vuelve a disparar ese evento sobre
    // el <img>: el manejador de React ya está conectado, así que el estado cambia por el flujo
    // normal y el onLoad/onError del consumidor también se llama.
    //
    // resolvedRef guarda el src cuyo resultado ya se entregó, y los manejadores ignoran un
    // segundo evento para el mismo src. Hace falta en los dos sentidos: con la imagen en caché,
    // complete ya es true en el efecto pero el load real llega después, en otra tarea (sin la
    // guarda en el manejador, el consumidor recibiría dos onLoad). Se compara el src en vez de
    // reiniciar un booleano: con StrictMode el efecto corre dos veces al montar y un reinicio
    // volvería a disparar el evento.
    const resolvedRef = React.useRef<{ src: typeof src } | null>(null);
    // Se compara con null primero: sin src, resolvedRef.current?.src también sería undefined.
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
