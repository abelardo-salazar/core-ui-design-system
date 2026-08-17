'use client';

import * as React from 'react';
import * as TogglePrimitive from '@radix-ui/react-toggle';
import { Cross2Icon } from '@radix-ui/react-icons';
import { type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { chipVariants } from './chipVariants';

export interface ChipProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'onSelect'>,
    VariantProps<typeof chipVariants> {
  /** Toggle controlado. Junto con onPressedChange, activa el modo interactivo del cuerpo (Radix Toggle real). */
  pressed?: boolean;
  /** Toggle no controlado. */
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  /** Si se pasa, agrega un botón de cierre (X) independiente del cuerpo del chip. */
  onRemove?: () => void;
  /** Label accesible del botón de cierre. */
  removeLabel?: string;
  disabled?: boolean;
}

const Chip = React.forwardRef<HTMLSpanElement, ChipProps>(
  (
    {
      className,
      variant,
      pressed,
      defaultPressed,
      onPressedChange,
      onRemove,
      removeLabel = 'Remove',
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    // El cuerpo solo se vuelve interactivo (Toggle real) si el consumidor participa del
    // protocolo de pressed/defaultPressed/onPressedChange. Sin eso, es texto plano.
    const isToggle = pressed !== undefined || defaultPressed !== undefined || onPressedChange !== undefined;

    const body = isToggle ? (
      <TogglePrimitive.Root
        pressed={pressed}
        defaultPressed={defaultPressed}
        onPressedChange={onPressedChange}
        disabled={disabled}
        className={cn(
          'rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          !disabled && 'cursor-pointer',
        )}
      >
        {children}
      </TogglePrimitive.Root>
    ) : (
      <span>{children}</span>
    );

    return (
      // El contenedor raíz NUNCA es interactivo por sí mismo: si fuera un <button> o el propio
      // Toggle, y además tuviera el botón de cierre adentro, resultaría en <button><button/></button>,
      // HTML inválido. Por eso compone dos elementos interactivos independientes como hermanos.
      <span ref={ref} className={cn(chipVariants({ variant }), className)} {...props}>
        {body}
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            className={cn(
              'inline-flex shrink-0 items-center justify-center rounded-full opacity-70 transition-opacity hover:opacity-100',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
            )}
          >
            <Cross2Icon className="h-3 w-3" />
            <span className="sr-only">{removeLabel}</span>
          </button>
        )}
      </span>
    );
  },
);
Chip.displayName = 'Chip';

export { Chip };
