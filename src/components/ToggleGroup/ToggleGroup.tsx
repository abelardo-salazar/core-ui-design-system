'use client';

import * as React from 'react';
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';
import { useControllableState } from '@radix-ui/react-use-controllable-state';
import { cn } from '../../utils/cn';
import { toggleGroupItemVariants, type ToggleGroupSize } from './toggleGroupVariants';

const ToggleGroupSizeContext = React.createContext<ToggleGroupSize>('md');

const groupClassName = 'inline-flex items-center gap-1 rounded-btn bg-base-200';

interface ToggleGroupSizeProps {
  /** Alto de los ítems (32 / 44 / 48, la escala de Button). Cada ítem puede sobrescribirlo. @default 'md' */
  size?: ToggleGroupSize;
}

export type ToggleGroupSingleProps = ToggleGroupPrimitive.ToggleGroupSingleProps &
  ToggleGroupSizeProps;
export type ToggleGroupMultipleProps = ToggleGroupPrimitive.ToggleGroupMultipleProps &
  ToggleGroupSizeProps;
export type ToggleGroupProps = ToggleGroupSingleProps | ToggleGroupMultipleProps;

// Radix nunca guarda estado propio: el DS le pasa siempre `value`. En modo único, Radix emite ''
// al hacer clic sobre el ítem activo; filtrarlo en onValueChange no alcanzaría en modo no
// controlado, porque el estado interno de Radix ya habría cambiado.
const SingleToggleGroup = React.forwardRef<HTMLDivElement, ToggleGroupSingleProps>(
  (
    { value: valueProp, defaultValue, onValueChange, size = 'md', className, children, ...props },
    ref,
  ) => {
    const [value, setValue] = useControllableState({
      prop: valueProp,
      defaultProp: defaultValue ?? '',
      onChange: onValueChange,
    });

    return (
      <ToggleGroupPrimitive.Root
        {...props}
        ref={ref}
        type="single"
        value={value}
        onValueChange={(next) => {
          if (next) setValue(next);
        }}
        className={cn(groupClassName, className)}
      >
        <ToggleGroupSizeContext.Provider value={size}>{children}</ToggleGroupSizeContext.Provider>
      </ToggleGroupPrimitive.Root>
    );
  },
);
SingleToggleGroup.displayName = 'SingleToggleGroup';

const MultipleToggleGroup = React.forwardRef<HTMLDivElement, ToggleGroupMultipleProps>(
  (
    { value: valueProp, defaultValue, onValueChange, size = 'md', className, children, ...props },
    ref,
  ) => {
    const [value, setValue] = useControllableState({
      prop: valueProp,
      defaultProp: defaultValue ?? [],
      onChange: onValueChange,
    });

    return (
      <ToggleGroupPrimitive.Root
        {...props}
        ref={ref}
        type="multiple"
        value={value}
        onValueChange={setValue}
        className={cn(groupClassName, className)}
      >
        <ToggleGroupSizeContext.Provider value={size}>{children}</ToggleGroupSizeContext.Provider>
      </ToggleGroupPrimitive.Root>
    );
  },
);
MultipleToggleGroup.displayName = 'MultipleToggleGroup';

/**
 * Grupo de opciones que cambian un valor (una vista, un filtro, un formato). Para cambiar qué
 * panel de contenido se ve, usar `Tabs`.
 *
 * - `type="single"`: `radiogroup` con ítems `radio` (`aria-checked`). Una vez elegido un valor,
 *   siempre hay uno: el clic sobre el ítem activo no lo desactiva y `onValueChange` nunca recibe
 *   `''`. Antes de la primera elección el valor es `''` (salvo `defaultValue`/`value`).
 * - `type="multiple"`: `toolbar` con ítems `aria-pressed`. Puede quedar vacío.
 *
 * Teclado: un solo punto de tabulación; las flechas mueven el foco **sin seleccionar** y Space o
 * Enter seleccionan. En modo único esto se aparta del patrón de radio de ARIA (donde la flecha
 * también selecciona) a propósito: cambiar el valor suele disparar una consulta, y recorrer las
 * opciones con las flechas no debe disparar una por cada una.
 *
 * `orientation`, `disabled` y `loop` pasan directo a Radix.
 */
const ToggleGroup = React.forwardRef<HTMLDivElement, ToggleGroupProps>((props, ref) =>
  props.type === 'single' ? (
    <SingleToggleGroup {...props} ref={ref} />
  ) : (
    <MultipleToggleGroup {...props} ref={ref} />
  ),
);
ToggleGroup.displayName = 'ToggleGroup';

export interface ToggleGroupItemProps
  extends React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item>, ToggleGroupSizeProps {}

/**
 * Opción de un `ToggleGroup`. Si solo muestra un ícono, necesita `aria-label` (por ejemplo,
 * `aria-label="Vista de lista"`): el ícono no da nombre accesible. `size` sobrescribe el del
 * grupo.
 */
const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  ToggleGroupItemProps
>(({ className, size, ...props }, ref) => {
  const groupSize = React.useContext(ToggleGroupSizeContext);
  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(toggleGroupItemVariants({ size: size ?? groupSize }), className)}
      {...props}
    />
  );
});
ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName;

export { ToggleGroup, ToggleGroupItem };
