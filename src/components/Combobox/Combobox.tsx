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

interface ComboboxBaseProps {
  options: ComboboxOption[];
  /**
   * `'popover'`: un disparador con el estilo de Select abre el buscador y la lista.
   * `'inline'`: buscador y lista siempre visibles. Dentro de un `Sheet` o `Dialog`, usar
   * `'inline'`. @default 'popover'
   */
  mode?: 'popover' | 'inline';
  /** Alto del disparador y del buscador (32 / 44 / 48, la escala de Select e Input). @default 'md' */
  size?: ComboboxSize;
  /**
   * Id del campo, para un `<label htmlFor>`. En modo popover va en el botón; en línea, en el
   * contenedor (cmdk fija el id del buscador), y la etiqueta igual nombra el buscador y lo enfoca
   * al hacer clic.
   */
  id?: string;
  /** Nombre accesible cuando no hay un `<label htmlFor>`. */
  'aria-label'?: string;
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

export interface ComboboxSingleProps extends ComboboxBaseProps {
  multiple?: false;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

export interface ComboboxMultipleProps extends ComboboxBaseProps {
  multiple: true;
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
}

export type ComboboxProps = ComboboxSingleProps | ComboboxMultipleProps;

// Sin mayúsculas ni marcas diacríticas: "mexico" encuentra "México".
const normalize = (text: string) =>
  text.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase();

const defaultRemoveLabel = (label: string) => `Remove ${label}`;

const findLabels = (node: HTMLElement | null, id: string) => {
  const root = node?.getRootNode() as Document | ShadowRoot | undefined;
  if (!root?.querySelectorAll) return [];
  return Array.from(root.querySelectorAll<HTMLLabelElement>(`label[for="${CSS.escape(id)}"]`));
};

// cmdk nombra su input y su lista solo con la prop `label` (string): escribe aria-labelledby del
// input después del spread de props. Por eso, además de los ids de los <label for> (para el
// disparador y el popover, que siguen los cambios del texto), se necesita su texto. Si un label
// no tiene id se le asigna uno. Se vuelve a leer con cada `refreshKey` (la apertura del popover).
function useFieldLabel(
  id: string,
  ariaLabel: string | undefined,
  rootRef: React.RefObject<HTMLElement | null>,
  refreshKey: unknown,
) {
  const [label, setLabel] = React.useState({ ids: '', text: ariaLabel ?? '' });

  React.useEffect(() => {
    const labels = findLabels(rootRef.current, id);
    const ids = labels
      .map((label, index) => {
        if (!label.id) label.id = `${id}-label${index ? `-${index}` : ''}`;
        return label.id;
      })
      .join(' ');
    const text =
      labels
        .map((label) => label.textContent?.trim())
        .filter(Boolean)
        .join(' ') ||
      ariaLabel ||
      '';
    setLabel((prev) => (prev.ids === ids && prev.text === text ? prev : { ids, text }));
  }, [id, ariaLabel, rootRef, refreshKey]);

  return label;
}

interface ComboboxImplProps extends ComboboxBaseProps {
  multiple: boolean;
  selected: string[];
  onToggle: (value: string) => void;
}

const ComboboxImpl = React.forwardRef<HTMLDivElement, ComboboxImplProps>(
  (
    {
      options,
      multiple,
      selected,
      onToggle,
      mode = 'popover',
      size = 'md',
      id: idProp,
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
    const inline = mode === 'inline';

    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState('');

    const rootRef = React.useRef<HTMLDivElement>(null);
    const triggerRef = React.useRef<HTMLButtonElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const chipRefs = React.useRef(new Map<string, HTMLSpanElement>());
    // Valor del Chip que recibe el foco después de quitar otro; '' = el botón o el buscador.
    const pendingFocus = React.useRef<string | null>(null);

    const label = useFieldLabel(id, ariaLabel, rootRef, open);

    const filtered = React.useMemo(() => {
      const query = normalize(search.trim());
      return query ? options.filter((option) => normalize(option.label).includes(query)) : options;
    }, [options, search]);

    const selectedOptions = selected
      .map((value) => options.find((option) => option.value === value))
      .filter((option): option is ComboboxOption => option !== undefined);

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
      onToggle(value);
    };

    const handleSelect = (value: string) => {
      onToggle(value);
      if (!multiple && !inline) {
        setOpen(false);
        setSearch('');
      }
    };

    // En línea, el id no puede ir en el buscador: cmdk escribe el id de su input después de las
    // props y lo usa para devolverle el foco al cambiar el ítem resaltado (getElementById), así
    // que reemplazarlo manda el foco a la lista. El id queda en el contenedor; la etiqueta nombra
    // el buscador por su texto (useFieldLabel) y un clic en ella lo enfoca, como haría el
    // <label for> nativo.
    React.useEffect(() => {
      if (!inline) return;
      const labels = findLabels(rootRef.current, id);
      const focusInput = () => inputRef.current?.focus();
      labels.forEach((label) => label.addEventListener('click', focusInput));
      return () => labels.forEach((label) => label.removeEventListener('click', focusInput));
    }, [id, inline]);

    const chips = selectedOptions.map((option) => (
      <Chip
        key={option.value}
        ref={(node) => {
          if (node) chipRefs.current.set(option.value, node);
          else chipRefs.current.delete(option.value);
        }}
        variant="ghost"
        size="sm"
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
        label={label.text}
        defaultValue={multiple ? undefined : selected[0]}
        className={cn(
          'flex min-h-0 flex-col text-base-content',
          inline &&
            'overflow-hidden rounded-btn border border-base-300 bg-base-100 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2',
        )}
      >
        <div className="flex items-center gap-2 border-b border-base-300 px-3">
          <MagnifyingGlassIcon aria-hidden className="h-4 w-4 shrink-0 opacity-50" />
          <Command.Input
            ref={inputRef}
            value={search}
            onValueChange={setSearch}
            placeholder={searchPlaceholder}
            disabled={disabled}
            className={comboboxSearchVariants({ size })}
          />
        </div>
        <Command.List
          label={label.text || undefined}
          className="max-h-72 min-h-0 overflow-y-auto overscroll-contain p-1"
        >
          <Command.Empty className="py-6 text-center text-sm text-base-content/70">
            {emptyLabel}
          </Command.Empty>
          {filtered.map((option) => {
            const isSelected = selected.includes(option.value);
            return (
              <Command.Item
                key={option.value}
                value={option.value}
                disabled={disabled || option.disabled}
                onSelect={() => handleSelect(option.value)}
                // El foco se queda en el buscador al elegir con el puntero: sin esto pasaría a la
                // lista (tabIndex -1), y en múltiple se perdería el texto en curso como destino.
                onMouseDown={(event) => event.preventDefault()}
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

    const setRootRef = (node: HTMLDivElement | null) => {
      rootRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    };

    if (inline) {
      return (
        <div ref={setRootRef} id={id} className={cn('flex w-full flex-col gap-2', className)}>
          {multiple && chips.length > 0 && <div className="flex flex-wrap gap-1">{chips}</div>}
          {command}
        </div>
      );
    }

    // Un <label for> sobre un botón reemplaza su contenido en el nombre accesible: el valor se
    // perdería. aria-labelledby junta la etiqueta y el valor; con aria-label, el botón se
    // referencia a sí mismo (aporta su aria-label). Antes del efecto que resuelve la etiqueta,
    // el <label for> nativo da al menos la etiqueta.
    const triggerLabelledBy = label.ids
      ? `${label.ids} ${valueId}`
      : ariaLabel
        ? `${id} ${valueId}`
        : undefined;

    const selectedText = selectedOptions.map((option) => option.label).join(', ');
    const chevron = <ChevronDownIcon aria-hidden className="h-4 w-4 shrink-0 opacity-50" />;

    const trigger = (
      <PopoverTrigger asChild>
        <button
          ref={triggerRef}
          type="button"
          id={id}
          disabled={disabled}
          aria-label={ariaLabel}
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
        {multiple ? (
          <PopoverAnchor asChild>
            <div
              ref={setRootRef}
              data-disabled={disabled ? '' : undefined}
              className={cn(comboboxFieldVariants({ size }), className)}
            >
              {chips}
              {trigger}
            </div>
          </PopoverAnchor>
        ) : (
          <div ref={setRootRef} className={cn('w-full', className)}>
            {trigger}
          </div>
        )}
        <PopoverContent
          align="start"
          aria-labelledby={label.ids || undefined}
          aria-label={label.ids ? undefined : ariaLabel}
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
 * buscador y lista siempre visibles; **dentro de un `Sheet` o `Dialog`, usar `mode="inline"`**.
 *
 * Etiquetar con `<label htmlFor={id}>` o con `aria-label`. El disparador anuncia la etiqueta y
 * el valor actual. Las opciones elegidas llevan `aria-checked="true"`.
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
