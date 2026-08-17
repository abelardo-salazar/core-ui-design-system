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

    // Si cambia el src, vuelve a pasar por el ciclo de carga en vez de conservar el estado
    // de la imagen anterior.
    React.useEffect(() => {
      setStatus('loading');
    }, [src]);

    return (
      <div className={cn('relative h-full w-full overflow-hidden', containerClassName)}>
        {status === 'loading' && <Skeleton className="absolute inset-0 h-full w-full" />}
        {status === 'error' && fallback}
        {/* Se desmonta al fallar: sin esto, un <img> roto queda invisible pero sigue en el DOM,
            lo cual no cumple "no renderiza nada" cuando no hay fallback. Vuelve a montarse solo
            si el src cambia (el useEffect de arriba resetea status a 'loading'). */}
        {status !== 'error' && (
          <img
            ref={ref}
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
