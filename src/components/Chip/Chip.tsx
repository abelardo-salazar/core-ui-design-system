'use client';

import * as React from 'react';
import * as TogglePrimitive from '@radix-ui/react-toggle';
import { Cross2Icon } from '@radix-ui/react-icons';
import { type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { chipVariants } from './chipVariants';

type ChipSize = NonNullable<VariantProps<typeof chipVariants>['size']>;

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

// Padding horizontal del cuerpo (span estático o Toggle). "right" solo se aplica cuando NO hay
// botón de cierre: si lo hay, la separación entre el texto y el botón la sigue dando el gap-1
// de la raíz, sin cambios — si el cuerpo también tuviera su propio pr, se duplicaría ese espacio.
// Escala propia de Chip (no la de Button), proporcional al font-size de cada tamaño.
const BODY_PADDING: Record<ChipSize, { left: string; right: string; vertical?: string }> = {
  sm: { left: 'pl-2.5', right: 'pr-2.5', vertical: 'py-0.5' },
  md: { left: 'pl-3', right: 'pr-3' },
  lg: { left: 'pl-4', right: 'pr-4' },
};

// sm: sin cambios respecto al botón de cierre actual (p-1.5 ya da el 24x24 de la spec de
// Material para el ícono de borrar de un Chip). md/lg: tamaño explícito en vez de derivado del
// padding, porque ahora se estiran (items-stretch en la raíz) hasta el alto completo de la
// píldora — lg es el tamaño táctil (44px).
const CLOSE_BUTTON_SIZE: Record<ChipSize, string> = {
  sm: 'p-1.5',
  md: 'h-8 w-8',
  lg: 'h-11 w-11',
};

// El ícono crece junto con el botón (no hay spec explícita para esto; es una decisión propia,
// proporcional al tamaño de texto de cada escalón).
const CLOSE_ICON_SIZE: Record<ChipSize, string> = {
  sm: 'h-3 w-3',
  md: 'h-3.5 w-3.5',
  lg: 'h-4 w-4',
};

const Chip = React.forwardRef<HTMLSpanElement, ChipProps>(
  (
    {
      className,
      variant,
      size: sizeProp,
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
    // VariantProps admite `null` (semántica de cva para "sin variante"), además de `undefined`
    // — un default en la desestructuración no cubre `null`, así que se resuelve acá.
    const size = sizeProp ?? 'sm';

    // El cuerpo solo se vuelve interactivo (Toggle real) si el consumidor participa del
    // protocolo de pressed/defaultPressed/onPressedChange. Sin eso, es texto plano.
    const isToggle = pressed !== undefined || defaultPressed !== undefined || onPressedChange !== undefined;

    const { left, right, vertical } = BODY_PADDING[size];
    // El padding vive acá (no en la raíz) para que el hit box real del Toggle/span llene la
    // píldora: antes, la raíz (no interactiva) tenía el padding y el Toggle de adentro medía
    // 0 — tocar el "aire" alrededor del texto no hacía nada.
    const bodyPadding = cn(left, !onRemove && right, vertical);

    // sm con botón de cierre es el único caso donde la raíz SÍ necesita padding propio: es la
    // única forma de reconstruir el alto/ancho histórico (30px / borde+10+texto+gap-1+24+10+borde)
    // sin volver a inflar el cuerpo (que ya tiene su propio padding, correcto, para el caso sin
    // botón). pr-2.5 reintroduce los 10px a la derecha del botón; py-0.5 reintroduce los 2px
    // arriba/abajo — ambos eran espacio "muerto" en el PR #30 (la raíz dejó de tenerlo, y nadie
    // lo heredó). El botón de cierre reclama esa zona como área de respuesta vía ::after (ver
    // closeButtonHitArea), sin cambiar su caja visual.
    const rootDeadZoneRestore = size === 'sm' && onRemove && 'py-0.5 pr-2.5';

    // Extiende el área de clic del botón de cierre (sm) hacia la zona que rootDeadZoneRestore
    // reintrodujo como padding de la raíz, SIN agrandar la caja real del botón — así el anillo
    // de foco sigue siendo el círculo de 24x24 de siempre, en la misma posición que tenía antes
    // del PR #30 (restaurar el padding de la raíz también restaura la posición del botón).
    // Sin extensión a la izquierda: el gap-1 entre el cuerpo y el botón se mantiene muerto a
    // propósito (es parte del aspecto histórico). Un ::after es parte del hit-testing de su
    // propio elemento, así que un clic ahí dispara el onClick del botón real.
    const closeButtonHitArea =
      size === 'sm' &&
      "relative after:content-[''] after:absolute after:-top-0.5 after:-right-2.5 after:-bottom-0.5 after:left-0";

    const body = isToggle ? (
      <TogglePrimitive.Root
        pressed={pressed}
        defaultPressed={defaultPressed}
        onPressedChange={onPressedChange}
        disabled={disabled}
        className={cn(
          'inline-flex items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          !disabled && 'cursor-pointer',
          bodyPadding,
        )}
      >
        {children}
      </TogglePrimitive.Root>
    ) : (
      <span className={cn('inline-flex items-center', bodyPadding)}>{children}</span>
    );

    return (
      // El contenedor raíz NUNCA es interactivo por sí mismo: si fuera un <button> o el propio
      // Toggle, y además tuviera el botón de cierre adentro, resultaría en <button><button/></button>,
      // HTML inválido. Por eso compone dos elementos interactivos independientes como hermanos.
      <span
        ref={ref}
        className={cn(chipVariants({ variant, size }), rootDeadZoneRestore, className)}
        {...props}
      >
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
              CLOSE_BUTTON_SIZE[size],
              closeButtonHitArea,
            )}
          >
            <Cross2Icon className={CLOSE_ICON_SIZE[size]} />
            <span className="sr-only">{removeLabel}</span>
          </button>
        )}
      </span>
    );
  },
);
Chip.displayName = 'Chip';

export { Chip };
