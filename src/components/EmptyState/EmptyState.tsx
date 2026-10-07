import * as React from 'react';
import { cn } from '../../utils/cn';
import { emptyStateVariants } from './emptyStateVariants';

// Server-safe: la raíz recibe `size` como prop y lo resuelve con cva; a las partes les llega
// por CSS (data-size en la raíz + group-data-[size=…]/empty-state en cada parte), no por un
// contexto de React, que lo volvería client. Grupo con nombre para no reaccionar a un `group`
// externo. Cada parte tiene su base en md y el override de sm en una variante, que Tailwind
// emite después de las utilidades base: por eso gana sobre el className del consumidor (ver
// JSDoc de las partes).

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /** `sm` para tablas y tarjetas; `md` para una página entera. */
  size?: 'sm' | 'md';
}

/**
 * Estado vacío: ícono, título, descripción y acciones, centrados.
 *
 * Es un `div` sin `role`. Un estado vacío que aparece tras una acción del usuario (por
 * ejemplo, un filtro sin resultados) no se anuncia solo: usar `announce()`.
 */
const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, size = 'md', ...props }, ref) => (
    <div
      ref={ref}
      // Solo para las partes (group-data); la raíz se estiliza con cva.
      data-size={size}
      className={cn(emptyStateVariants({ size }), className)}
      {...props}
    />
  ),
);
EmptyState.displayName = 'EmptyState';

/**
 * Ícono decorativo: `aria-hidden` va después del spread para que no se pueda deshacer. Fija
 * el tamaño del SVG desde el contenedor.
 *
 * En `size="sm"` los ajustes de tamaño ganan sobre el `className`: Tailwind emite las
 * variantes después de las utilidades base y twMerge no los ve como conflicto. Es el costo de
 * seguir siendo server-safe. Para cambiarlos en sm, usar la misma variante en `className`
 * (por ejemplo, `group-data-[size=sm]/empty-state:size-8`).
 */
const EmptyStateIcon = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'mb-2 flex size-12 items-center justify-center rounded-full bg-base-200 text-base-content/65 [&_svg]:size-6',
        'group-data-[size=sm]/empty-state:mb-1 group-data-[size=sm]/empty-state:size-10 group-data-[size=sm]/empty-state:[&_svg]:size-5',
        className,
      )}
      {...props}
      aria-hidden="true"
    />
  ),
);
EmptyStateIcon.displayName = 'EmptyStateIcon';

export interface EmptyStateTitleProps extends React.HTMLAttributes<
  HTMLParagraphElement | HTMLHeadingElement
> {
  /**
   * Por defecto `p`: el componente no conoce su contexto, así que no impone un nivel de
   * encabezado. Pasar `h2`–`h6` cuando el estado vacío ocupa una sección o página.
   */
  as?: 'p' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

/**
 * Título del estado vacío. Renderiza un `p` salvo que `as` indique un encabezado.
 *
 * En `size="sm"` los ajustes de tamaño ganan sobre el `className`: Tailwind emite las
 * variantes después de las utilidades base y twMerge no los ve como conflicto. Es el costo de
 * seguir siendo server-safe. Para cambiarlos en sm, usar la misma variante en `className`
 * (por ejemplo, `group-data-[size=sm]/empty-state:text-base`).
 */
const EmptyStateTitle = React.forwardRef<
  HTMLParagraphElement | HTMLHeadingElement,
  EmptyStateTitleProps
>(({ className, as: Component = 'p', ...props }, ref) => (
  <Component
    ref={ref}
    className={cn(
      'max-w-md text-lg font-semibold text-base-content',
      'group-data-[size=sm]/empty-state:max-w-xs group-data-[size=sm]/empty-state:text-sm',
      className,
    )}
    {...props}
  />
));
EmptyStateTitle.displayName = 'EmptyStateTitle';

/**
 * Texto secundario del estado vacío.
 *
 * En `size="sm"` los ajustes de tamaño ganan sobre el `className`: Tailwind emite las
 * variantes después de las utilidades base y twMerge no los ve como conflicto. Es el costo de
 * seguir siendo server-safe. Para cambiarlos en sm, usar la misma variante en `className`
 * (por ejemplo, `group-data-[size=sm]/empty-state:text-base`).
 */
const EmptyStateDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      'max-w-md text-sm text-base-content/65 group-data-[size=sm]/empty-state:max-w-xs',
      className,
    )}
    {...props}
  />
));
EmptyStateDescription.displayName = 'EmptyStateDescription';

/**
 * Botones o enlaces del estado vacío, centrados.
 *
 * En `size="sm"` los ajustes de tamaño ganan sobre el `className`: Tailwind emite las
 * variantes después de las utilidades base y twMerge no los ve como conflicto. Es el costo de
 * seguir siendo server-safe. Para cambiarlos en sm, usar la misma variante en `className`
 * (por ejemplo, `group-data-[size=sm]/empty-state:text-base`).
 */
const EmptyStateActions = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'mt-4 flex flex-wrap items-center justify-center gap-2 group-data-[size=sm]/empty-state:mt-2',
        className,
      )}
      {...props}
    />
  ),
);
EmptyStateActions.displayName = 'EmptyStateActions';

export { EmptyState, EmptyStateIcon, EmptyStateTitle, EmptyStateDescription, EmptyStateActions };
