import * as React from 'react';
import { cn } from '../../utils/cn';

export interface VisuallyHiddenProps extends React.HTMLAttributes<HTMLElement> {
  /** Elemento a renderizar. Por defecto `span`; usar `div` para envolver contenido de bloque. */
  as?: React.ElementType;
}

/**
 * Oculta su contenido a la vista pero lo deja disponible para los lectores de pantalla
 * (`sr-only`). Por ejemplo, para un `SheetTitle` o `DialogTitle` que el diseño no muestra.
 */
const VisuallyHidden = React.forwardRef<HTMLElement, VisuallyHiddenProps>(
  ({ className, as: Component = 'span', ...props }, ref) => (
    <Component ref={ref} className={cn('sr-only', className)} {...props} />
  ),
);
VisuallyHidden.displayName = 'VisuallyHidden';

export { VisuallyHidden };
