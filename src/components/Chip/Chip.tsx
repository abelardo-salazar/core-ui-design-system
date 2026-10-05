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
// Material para el ícono de borrar de un Chip). md/lg: solo ancho explícito — el alto NO se
// fija (a diferencia de versiones anteriores de este archivo): una altura explícita (h-8/h-11)
// no responde a items-stretch, así que el botón no se centraba con el Toggle y desbordaba el
// borde inferior de la raíz por ~1px. Sin altura propia, se estira igual que el Toggle/body y
// queda centrado — mismo mecanismo ya probado, no uno nuevo.
const CLOSE_BUTTON_SIZE: Record<ChipSize, string> = {
  sm: 'p-1.5',
  md: 'w-8',
  lg: 'w-11',
};

// Extiende el área de respuesta del botón de cierre hasta el borde EXTERIOR de la raíz (nunca
// más allá de su propia caja visual, así que el anillo de foco no cambia) siguiendo la curva de
// la píldora: rounded-r-full redondea solo las dos esquinas derechas con el mismo radio que la
// raíz (en vez de un rectángulo cuyas esquinas quedan fuera de la silueta visible — un toque ahí,
// antes de este fix, sí disparaba onRemove). Sin extensión a la izquierda: el gap-1 con el
// cuerpo sigue sin responder a propósito.
// sm reconstruye el padding histórico que la raíz reintroduce (rootDeadZoneRestore) — ese caso
// deliberadamente NO llega al borde en sí (ver comentario ahí: "el borde de 1px es inevitable y
// está bien" era la regla acordada para sm). md/lg sí llegan al borde — son tamaños nuevos, sin
// compromiso histórico, y la tarea pide explícitamente que el borde de 1px responda ahí.
const CLOSE_BUTTON_HIT_AREA: Record<ChipSize, string> = {
  sm: "relative after:content-[''] after:absolute after:rounded-r-full after:-top-0.5 after:-right-2.5 after:-bottom-0.5 after:left-0",
  md: "relative after:content-[''] after:absolute after:rounded-r-full after:-top-px after:-right-px after:-bottom-px after:left-0",
  lg: "relative after:content-[''] after:absolute after:rounded-r-full after:-top-px after:-right-px after:-bottom-px after:left-0",
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
    // lo heredó). El borde de 1px en sí queda deliberadamente fuera del área de respuesta en sm
    // (es inevitable y está bien, acordado al restaurar este aspecto) — ver CLOSE_BUTTON_HIT_AREA.
    const rootDeadZoneRestore = size === 'sm' && onRemove && 'py-0.5 pr-2.5';

    // Extiende el área de respuesta del Toggle hasta el borde EXTERIOR de la raíz, solo
    // verticalmente (inset-x-0: nunca invade el gap-1 ni la zona del botón de cierre) y con
    // radio — mismo criterio que CLOSE_BUTTON_HIT_AREA pero en el borde IZQUIERDO de la píldora,
    // donde vive el Toggle (sin el radio, las esquinas del rectángulo quedarían fuera de la
    // silueta visible, el mismo problema que tenía el botón de cierre sin rounded-r-full).
    // sm con botón de cierre: cubre la franja que rootDeadZoneRestore agranda (py-0.5) y que el
    // Toggle, al estirarse solo al alto de la fila (24px), no alcanzaba por sí solo — sin botón
    // de cierre, el Toggle ya llega exactamente al borde interior (nada que corregir), y el
    // borde en sí queda fuera a propósito, igual que en el ✕ de sm.
    // md/lg: cubre el borde en sí (1px) — con o sin botón de cierre al lado, el Toggle es un
    // control real que debe alcanzar el tamaño táctil completo por su cuenta. CON botón de
    // cierre, el extremo derecho del Toggle linda con el gap-1 (interior de la píldora): ahí
    // rounded-l-full es correcto, solo la esquina izquierda es exterior. SIN botón de cierre, el
    // extremo derecho del Toggle ES el extremo derecho de la píldora — las dos esquinas son
    // exteriores, así que necesita rounded-full completo (si no, esas esquinas quedan cuadradas
    // y responden en el hueco entre la curva y la esquina, fuera de la silueta visible).
    const toggleHitArea =
      size === 'sm'
        ? onRemove &&
          "relative after:content-[''] after:absolute after:rounded-l-full after:inset-x-0 after:-top-0.5 after:-bottom-0.5"
        : onRemove
          ? "relative after:content-[''] after:absolute after:rounded-l-full after:inset-x-0 after:-top-px after:-bottom-px"
          : "relative after:content-[''] after:absolute after:rounded-full after:inset-x-0 after:-top-px after:-bottom-px";

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
          toggleHitArea,
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
              CLOSE_BUTTON_HIT_AREA[size],
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
