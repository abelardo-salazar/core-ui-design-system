import * as React from 'react';
import { cn } from '../../utils/cn';

// Server-safe: el tamaño llega a las partes por CSS (data-size en la raíz +
// group-data-[size=…]/empty-state en cada parte), no por un contexto de React, que lo
// volvería client. Grupo con nombre para no reaccionar a un `group` externo. Cada parte tiene
// su base en md y el override de sm en una variante, que Tailwind emite después de la base.

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
      data-size={size}
      className={cn(
        'group/empty-state flex w-full flex-col items-center gap-2 px-6 py-12 text-center data-[size=sm]:px-4 data-[size=sm]:py-6',
        className,
      )}
      {...props}
    />
  ),
);
EmptyState.displayName = 'EmptyState';

// Decorativo: aria-hidden va después del spread para que no se pueda deshacer.
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

export interface EmptyStateTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /**
   * Por defecto `p`: el componente no conoce su contexto, así que no impone un nivel de
   * encabezado. Pasar `h2`–`h6` cuando el estado vacío ocupa una sección o página.
   */
  as?: 'p' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

const EmptyStateTitle = React.forwardRef<HTMLHeadingElement, EmptyStateTitleProps>(
  ({ className, as: Component = 'p', ...props }, ref) => (
    <Component
      ref={ref}
      className={cn(
        'max-w-md text-lg font-semibold text-base-content',
        'group-data-[size=sm]/empty-state:max-w-xs group-data-[size=sm]/empty-state:text-sm',
        className,
      )}
      {...props}
    />
  ),
);
EmptyStateTitle.displayName = 'EmptyStateTitle';

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
