'use client';

import * as React from 'react';
import { Command } from 'cmdk';
import { useControllableState } from '@radix-ui/react-use-controllable-state';
import { CheckIcon, ChevronDownIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { cn } from '../../utils/cn';
import { Chip } from '../Chip';
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from '../Popover';
import {
  comboboxFieldVariants,
  comboboxItemVariants,
  comboboxMultipleTriggerVariants,
  comboboxSearchVariants,
  comboboxTriggerVariants,
  type ComboboxSize,
} from './comboboxVariants';

export interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/** Cuándo se ve la lista en `mode="inline"`. */
export type ComboboxListVisibility = 'always' | 'focus' | 'query';

interface ComboboxBaseProps {
  options: ComboboxOption[];
  /** Alto del disparador y del buscador (32 / 44 / 48, la escala de Select e Input). @default 'md' */
  size?: ComboboxSize;
  /** Id del botón en modo popover; en línea, del contenedor (cmdk fija el id del buscador). */
  id?: string;
  disabled?: boolean;
  /** Texto del disparador sin valor. @default 'Select...' */
  placeholder?: string;
  /** @default 'Search...' */
  searchPlaceholder?: string;
  /** Texto cuando el filtro no encuentra opciones. @default 'No results.' */
  emptyLabel?: string;
  /** Nombre accesible del ✕ de cada Chip (modo múltiple). @default (label) => `Remove ${label}` */
  removeLabel?: (label: string) => string;
  className?: string;
}

// Unión discriminada por `mode`, mismo patrón que `clearable`/`endIcon` en Input:
// `listVisibility` solo existe en línea (en el popover la lista se ve mientras está abierto).
// La primera rama admite los dos modos (no solo 'popover') para que `mode={dinámico}` sin
// `listVisibility` siga compilando.
export type ComboboxModeProps =
  | {
      /**
       * `'popover'`: un disparador con el estilo de Select abre el buscador y la lista.
       * `'inline'`: buscador y lista en el flujo del formulario. Dentro de un `Sheet` o `Dialog`,
       * usar `'inline'`. @default 'popover'
       */
      mode?: 'popover' | 'inline';
      listVisibility?: never;
    }
  | {
      mode: 'inline';
      /**
       * `'always'`: la lista se ve siempre. `'focus'`: mientras el buscador tiene el foco.
       * `'query'`: mientras tiene el foco y hay texto (sin contar espacios). Con `'focus'` y
       * `'query'`, Escape oculta la lista sin cerrar el `Sheet`/`Dialog` que la contiene.
       * @default 'always'
       */
      listVisibility?: ComboboxListVisibility;
    };

// Etiqueta visible (`label`) o solo para lectores de pantalla (`aria-label`): una de las dos.
// Es un string porque cmdk solo acepta un texto para nombrar el buscador y la lista.
export type ComboboxLabelProps =
  | {
      /** Etiqueta visible del campo. */
      label: string;
      'aria-label'?: never;
    }
  | {
      label?: never;
      /** Nombre accesible sin etiqueta visible. */
      'aria-label': string;
    };

export type ComboboxSingleProps = ComboboxBaseProps &
  ComboboxLabelProps &
  ComboboxModeProps & {
    multiple?: false;
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
  };

export type ComboboxMultipleProps = ComboboxBaseProps &
  ComboboxLabelProps &
  ComboboxModeProps & {
    multiple: true;
    value?: string[];
    defaultValue?: string[];
    onValueChange?: (value: string[]) => void;
  };

export type ComboboxProps = ComboboxSingleProps | ComboboxMultipleProps;

// Sin mayúsculas ni marcas diacríticas: "mexico" encuentra "México".
const normalize = (text: string) =>
  text.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase();

const defaultRemoveLabel = (label: string) => `Remove ${label}`;

interface ComboboxImplProps extends ComboboxBaseProps {
  mode?: 'popover' | 'inline';
  listVisibility?: ComboboxListVisibility;
  label?: string;
  'aria-label'?: string;
  multiple: boolean;
  selected: string[];
  onToggle: (value: string) => void;
  /** Quitar con el ✕ del Chip: en único vacía el valor (`onToggle` no deselecciona). */
  onRemove: (value: string) => void;
}

const ComboboxImpl = React.forwardRef<HTMLDivElement, ComboboxImplProps>(
  (
    {
      options,
      multiple,
      selected,
      onToggle,
      onRemove,
      mode = 'popover',
      listVisibility = 'always',
      size = 'md',
      id: idProp,
      label,
      'aria-label': ariaLabel,
      disabled,
      placeholder = 'Select...',
      searchPlaceholder = 'Search...',
      emptyLabel = 'No results.',
      removeLabel = defaultRemoveLabel,
      className,
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const id = idProp ?? generatedId;
    const valueId = `${id}-value`;
    const labelId = `${id}-label`;
    // Texto que nombra el buscador y la lista (prop `label` de cmdk).
    const accessibleLabel = label ?? ariaLabel ?? '';
    const inline = mode === 'inline';

    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState('');
    // Lista condicionada al foco (en línea con 'focus' o 'query'). `dismissed`: Escape la ocultó;
    // vuelve al escribir o al volver a enfocar.
    const collapsible = inline && listVisibility !== 'always';
    const [focused, setFocused] = React.useState(false);
    const [dismissed, setDismissed] = React.useState(false);
    const listVisible =
      !collapsible ||
      (focused && !dismissed && (listVisibility === 'focus' || search.trim() !== ''));

    const triggerRef = React.useRef<HTMLButtonElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const chipRefs = React.useRef(new Map<string, HTMLSpanElement>());
    // Valor del Chip que recibe el foco después de quitar otro; '' = el botón o el buscador.
    const pendingFocus = React.useRef<string | null>(null);

    const filtered = React.useMemo(() => {
      const query = normalize(search.trim());
      return query ? options.filter((option) => normalize(option.label).includes(query)) : options;
    }, [options, search]);

    const selectedOptions = selected
      .map((value) => options.find((option) => option.value === value))
      .filter((option): option is ComboboxOption => option !== undefined);

    // cmdk escribe aria-expanded="true" después de las props, así que no se puede pasar como prop.
    // React no vuelve a escribir el atributo mientras cmdk no cambie su valor (siempre true): el
    // que se fija acá se mantiene. En el HTML del servidor queda el "true" de cmdk hasta hidratar.
    React.useLayoutEffect(() => {
      if (collapsible) inputRef.current?.setAttribute('aria-expanded', String(listVisible));
    });

    // Radix (Dialog, Sheet, Popover) escucha Escape en document, en fase de captura: un handler en
    // el buscador llega tarde. Un listener en window, también en captura, corre antes; con
    // preventDefault, Radix no cierra la capa (DismissableLayer solo cierra si el evento no fue
    // prevenido). Solo está activo con la lista visible, así el segundo Escape cierra el contenedor.
    React.useEffect(() => {
      if (!collapsible || !listVisible) return;
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key !== 'Escape' || event.isComposing || event.target !== inputRef.current)
          return;
        event.preventDefault();
        setDismissed(true);
      };
      window.addEventListener('keydown', onKeyDown, { capture: true });
      return () => window.removeEventListener('keydown', onKeyDown, { capture: true });
    }, [collapsible, listVisible]);

    React.useEffect(() => {
      const target = pendingFocus.current;
      if (target === null) return;
      pendingFocus.current = null;
      const chipButton = target ? chipRefs.current.get(target)?.querySelector('button') : null;
      (chipButton ?? (inline ? inputRef.current : triggerRef.current))?.focus();
    }, [selected, inline]);

    // El foco pasa al siguiente elemento enfocable en el orden del DOM: el Chip siguiente o,
    // si era el último, el botón (el buscador en línea).
    const removeChip = (value: string) => {
      const index = selectedOptions.findIndex((option) => option.value === value);
      pendingFocus.current = selectedOptions[index + 1]?.value ?? '';
      onRemove(value);
    };

    const handleSelect = (value: string) => {
      onToggle(value);
      if (!multiple && !inline) {
        setOpen(false);
        setSearch('');
      }
      // Con 'query', vaciar el texto oculta la lista; con 'focus' sigue visible. El foco no se
      // mueve: el puntero no lo saca del buscador (onMouseDown de la lista).
      if (collapsible) setSearch('');
    };

    const chips = selectedOptions.map((option) => (
      <Chip
        key={option.value}
        ref={(node) => {
          if (node) chipRefs.current.set(option.value, node);
          else chipRefs.current.delete(option.value);
        }}
        variant="ghost"
        size={size}
        disabled={disabled || option.disabled}
        onRemove={() => removeChip(option.value)}
        removeLabel={removeLabel(option.label)}
      >
        {option.label}
      </Chip>
    ));

    const command = (
      <Command
        shouldFilter={false}
        label={accessibleLabel}
        defaultValue={multiple ? undefined : selected[0]}
        className={cn(
          'flex min-h-0 flex-col text-base-content',
          inline &&
            'overflow-hidden rounded-btn border border-base-300 bg-base-100 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2',
        )}
      >
        <div
          className={cn('flex items-center gap-2 px-3', listVisible && 'border-b border-base-300')}
        >
          <MagnifyingGlassIcon aria-hidden className="h-4 w-4 shrink-0 opacity-50" />
          <Command.Input
            ref={inputRef}
            value={search}
            onValueChange={(next) => {
              setSearch(next);
              setDismissed(false);
            }}
            onFocus={() => {
              setFocused(true);
              setDismissed(false);
            }}
            onBlur={() => setFocused(false)}
            placeholder={searchPlaceholder}
            disabled={disabled}
            className={comboboxSearchVariants({ size })}
          />
        </div>
        {/* Oculta (hidden), la lista sigue en el DOM para que aria-controls del buscador apunte a
            algo, pero sin opciones: así Enter y las flechas de cmdk no eligen ni resaltan nada
            invisible, y Command.Empty (que cmdk muestra cuando no hay opciones) no aparece.
            onMouseDown: el foco se queda en el buscador al usar el puntero en la lista. Sin esto
            pasaría a la lista (tabIndex -1) o al body, en múltiple se perdería el texto en curso
            como destino, y con 'focus'/'query' el blur ocultaría la lista antes del clic. */}
        <Command.List
          label={accessibleLabel || undefined}
          hidden={!listVisible}
          onMouseDown={(event) => event.preventDefault()}
          className="max-h-72 min-h-0 overflow-y-auto overscroll-contain p-1"
        >
          {listVisible && (
            <Command.Empty className="py-6 text-center text-sm text-base-content/70">
              {emptyLabel}
            </Command.Empty>
          )}
          {(listVisible ? filtered : []).map((option) => {
            const isSelected = selected.includes(option.value);
            return (
              <Command.Item
                key={option.value}
                value={option.value}
                disabled={disabled || option.disabled}
                onSelect={() => handleSelect(option.value)}
                // aria-selected lo usa cmdk para el ítem resaltado (y lo escribe después de las
                // props): el estado elegido va en aria-checked, que ARIA 1.2 admite en option.
                aria-checked={isSelected}
                className={comboboxItemVariants({ size })}
              >
                <CheckIcon
                  aria-hidden
                  className={cn('h-4 w-4 shrink-0', !isSelected && 'invisible')}
                />
                {option.label}
              </Command.Item>
            );
          })}
        </Command.List>
      </Command>
    );

    // Mismo estilo que la etiqueta de Input.
    const labelClassName = cn(
      'text-sm font-medium leading-none text-base-content',
      disabled && 'cursor-not-allowed opacity-70',
    );

    if (inline) {
      return (
        <div ref={ref} id={id} className={cn('flex w-full flex-col gap-1.5', className)}>
          {label !== undefined && (
            // cmdk fija el id de su input y su aria-labelledby, que apunta a su propia etiqueta
            // oculta (con el texto de `label`): una etiqueta visible no puede apuntarle con for.
            // Esta es solo visual: aria-hidden para que el lector no lea la etiqueta dos veces,
            // y el clic enfoca el buscador como lo haría un <label for>. No es enfocable, así que
            // no necesita equivalente de teclado.
            <span aria-hidden className={labelClassName} onClick={() => inputRef.current?.focus()}>
              {label}
            </span>
          )}
          {/* En único con lista condicionada, el Chip es lo único que muestra el valor cuando la
              lista está oculta. */}
          {(multiple || collapsible) && chips.length > 0 && (
            <div className="flex flex-wrap gap-1">{chips}</div>
          )}
          {command}
        </div>
      );
    }

    // Un <label for> sobre un botón reemplaza su contenido en el nombre accesible: el valor se
    // perdería. aria-labelledby junta la etiqueta y el valor; con aria-label, el botón se
    // referencia a sí mismo (aporta su aria-label).
    const triggerLabelledBy = `${label !== undefined ? labelId : id} ${valueId}`;

    const selectedText = selectedOptions.map((option) => option.label).join(', ');
    const chevron = <ChevronDownIcon aria-hidden className="h-4 w-4 shrink-0 opacity-50" />;

    const trigger = (
      <PopoverTrigger asChild>
        <button
          ref={triggerRef}
          type="button"
          id={id}
          disabled={disabled}
          aria-label={label !== undefined ? undefined : ariaLabel}
          aria-labelledby={triggerLabelledBy}
          data-combobox-trigger=""
          className={
            multiple ? comboboxMultipleTriggerVariants({ size }) : comboboxTriggerVariants({ size })
          }
        >
          {multiple && selectedOptions.length > 0 ? (
            <span id={valueId} className="sr-only">
              {selectedText}
            </span>
          ) : (
            <span
              id={valueId}
              className={cn('truncate', !selectedOptions.length && 'text-base-content/50')}
            >
              {selectedText || placeholder}
            </span>
          )}
          {chevron}
        </button>
      </PopoverTrigger>
    );

    return (
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setSearch('');
        }}
      >
        <div ref={ref} className={cn('flex w-full flex-col gap-1.5', className)}>
          {label !== undefined && (
            // Un clic activa el botón (comportamiento nativo de <label> sobre un botón), igual
            // que un clic en el campo.
            <label id={labelId} htmlFor={id} className={labelClassName}>
              {label}
            </label>
          )}
          {multiple ? (
            <PopoverAnchor asChild>
              <div
                data-disabled={disabled ? '' : undefined}
                className={comboboxFieldVariants({ size })}
              >
                {chips}
                {trigger}
              </div>
            </PopoverAnchor>
          ) : (
            trigger
          )}
        </div>
        <PopoverContent
          align="start"
          aria-labelledby={label !== undefined ? labelId : undefined}
          aria-label={label !== undefined ? undefined : ariaLabel}
          className="flex max-h-[var(--radix-popover-content-available-height)] w-[var(--radix-popover-trigger-width)] min-w-48 flex-col p-0"
        >
          {command}
        </PopoverContent>
      </Popover>
    );
  },
);
ComboboxImpl.displayName = 'ComboboxImpl';

const SingleCombobox = React.forwardRef<HTMLDivElement, ComboboxSingleProps>(
  ({ value: valueProp, defaultValue, onValueChange, ...props }, ref) => {
    const [value, setValue] = useControllableState({
      prop: valueProp,
      defaultProp: defaultValue ?? '',
      onChange: onValueChange,
    });
    return (
      <ComboboxImpl
        {...props}
        ref={ref}
        multiple={false}
        selected={value ? [value] : []}
        onToggle={setValue}
        onRemove={() => setValue('')}
      />
    );
  },
);
SingleCombobox.displayName = 'SingleCombobox';

const MultipleCombobox = React.forwardRef<HTMLDivElement, ComboboxMultipleProps>(
  ({ value: valueProp, defaultValue, onValueChange, ...props }, ref) => {
    const [value, setValue] = useControllableState({
      prop: valueProp,
      defaultProp: defaultValue ?? [],
      onChange: onValueChange,
    });
    return (
      <ComboboxImpl
        {...props}
        ref={ref}
        multiple
        selected={value}
        onToggle={(toggled) =>
          setValue(
            value.includes(toggled) ? value.filter((v) => v !== toggled) : [...value, toggled],
          )
        }
        onRemove={(removed) => setValue(value.filter((v) => v !== removed))}
      />
    );
  },
);
MultipleCombobox.displayName = 'MultipleCombobox';

/**
 * Campo de selección con buscador sobre una lista de opciones (`options`). El filtro busca el
 * texto en cualquier parte de la etiqueta, sin distinguir mayúsculas ni acentos, y conserva el
 * orden de `options`.
 *
 * - Modo único (default): `value: string` (`''` sin valor). Elegir una opción cierra el popover
 *   y devuelve el foco al disparador; elegir la actual no la deselecciona.
 * - `multiple`: `value: string[]`. El popover queda abierto al elegir; las opciones elegidas se
 *   muestran como `Chip` que se quitan con su ✕ (el foco pasa al Chip siguiente, o al botón).
 *
 * `mode="popover"` (default): el buscador es un `combobox` dentro de un popover (`dialog`) que
 * toma su nombre de la etiqueta del campo; Escape lo cierra y devuelve el foco. `mode="inline"`:
 * buscador y lista en el flujo del formulario; **dentro de un `Sheet` o `Dialog`, usar
 * `mode="inline"`**. `listVisibility` (`'always'` | `'focus'` | `'query'`) decide cuándo se ve la
 * lista en línea; con `'focus'`/`'query'`, el valor de único también se muestra como `Chip`.
 *
 * Requiere `label` (etiqueta visible, con el estilo de la de Input) o `aria-label`, no los dos.
 * El disparador anuncia la etiqueta y el valor actual; el popover, el buscador y la lista se
 * nombran con la etiqueta. Las opciones elegidas llevan `aria-checked="true"`.
 */
const Combobox = React.forwardRef<HTMLDivElement, ComboboxProps>((props, ref) =>
  props.multiple ? (
    <MultipleCombobox {...props} ref={ref} />
  ) : (
    <SingleCombobox {...props} ref={ref} />
  ),
);
Combobox.displayName = 'Combobox';

export { Combobox };
