import * as React from 'react';
import {
  InfoCircledIcon,
  CheckCircledIcon,
  ExclamationTriangleIcon,
  CrossCircledIcon,
} from '@radix-ui/react-icons';
import { type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { alertVariants, alertIconVariants } from './alertVariants';

type AlertVariant = NonNullable<VariantProps<typeof alertVariants>['variant']>;

// error/warning son "algo salió mal" → asertivo (interrumpe al lector de pantalla).
// info/success son "así está el estado" → cortés (espera a que termine lo que se esté
// leyendo). Derivado de la variante, no una prop: no hay override, no surgió una razón
// concreta para necesitarlo durante la implementación.
const ROLE_BY_VARIANT: Record<AlertVariant, 'alert' | 'status'> = {
  info: 'status',
  success: 'status',
  warning: 'alert',
  error: 'alert',
};

const DEFAULT_ICON_BY_VARIANT: Record<AlertVariant, React.ComponentType<React.ComponentProps<typeof InfoCircledIcon>>> = {
  info: InfoCircledIcon,
  success: CheckCircledIcon,
  warning: ExclamationTriangleIcon,
  error: CrossCircledIcon,
};

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  /**
   * Reemplaza el ícono default de la variante (patrón compositivo, igual que `fallback` en
   * Image). Si no se pasa (`undefined`), se usa el ícono default de `variant`. Si se pasa
   * cualquier valor -- incluido `null` o `false` -- se usa tal cual, lo que permite ocultar
   * el ícono explícitamente sin una prop separada.
   */
  icon?: React.ReactNode;
}

// -----------------------------------------------------------------------------
// Alert Root
// -----------------------------------------------------------------------------
const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, icon, children, ...props }, ref) => {
    const resolvedVariant = variant ?? 'info';
    const role = ROLE_BY_VARIANT[resolvedVariant];
    const DefaultIcon = DEFAULT_ICON_BY_VARIANT[resolvedVariant];

    const resolvedIcon =
      icon !== undefined ? icon : <DefaultIcon className={cn(alertIconVariants({ variant }))} aria-hidden />;

    return (
      <div
        ref={ref}
        role={role}
        className={cn(alertVariants({ variant }), className)}
        {...props}
      >
        {resolvedIcon}
        <div className="flex-1 space-y-1">{children}</div>
      </div>
    );
  },
);
Alert.displayName = 'Alert';

// -----------------------------------------------------------------------------
// Alert Title
// -----------------------------------------------------------------------------
// Deliberadamente un <div>, no un <h*>: a diferencia de CardTitle, un Alert puede aparecer
// en cualquier punto del árbol (inyectado por un formulario, un toast, etc.) sin que el
// componente pueda saber qué nivel de heading le corresponde ahí. Forzar un nivel fijo
// podría romper el orden de headings de la página consumidora.
const AlertTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('font-medium leading-none tracking-tight', className)} {...props} />
  ),
);
AlertTitle.displayName = 'AlertTitle';

// -----------------------------------------------------------------------------
// Alert Description
// -----------------------------------------------------------------------------
const AlertDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div className={cn('text-sm text-base-content [&_p]:leading-relaxed', className)} ref={ref} {...props} />
  ),
);
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };
