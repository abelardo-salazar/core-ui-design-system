'use client';

import * as React from 'react';
import { type VariantProps } from 'class-variance-authority';
import { Cross2Icon } from '@radix-ui/react-icons';
import { cn } from '../../utils/cn';
import { inputVariants } from './inputVariants';

/** Props comunes a ambas ramas. Exportada para quien necesite extender Input con una interface
 * (una interface no puede extender la unión `InputProps`). */
export interface InputBaseProps
  extends
    Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    Omit<VariantProps<typeof inputVariants>, 'clearable'> {
  label?: string;
  error?: string;
  helperText?: string;
  startIcon?: React.ReactNode;
}

export interface InputWithEndIconProps extends InputBaseProps {
  clearable?: false;
  endIcon?: React.ReactNode;
  onClear?: never;
  clearLabel?: never;
}

export interface ClearableInputProps extends InputBaseProps {
  /** Muestra un botón para vaciar el campo mientras tenga valor. */
  clearable: boolean;
  /** Se llama después de vaciar el campo (y de disparar su onChange). */
  onClear?: () => void;
  /** aria-label del botón de limpiar. Default: "Clear". */
  clearLabel?: string;
  endIcon?: never;
}

// Unión discriminada por `clearable`: el botón de limpiar ocupa el lugar de endIcon, así que no
// conviven. Las props de la otra rama se declaran `?: never` en vez de omitirse para que el
// error salga de la asignabilidad y no del chequeo de props sobrantes, que contra una unión se
// relaja a "¿existe en ALGÚN miembro?" (el bug que obligó a Badge a usar sobrecargas).
// `clearable: boolean` (no `true`) para que `clearable={dinámico}` compile sin endIcon.
/**
 * Props de `Input`: unión discriminada por `clearable`.
 *
 * `Omit<InputProps, K>` NO preserva la exclusión `clearable`/`endIcon`: `Omit` no reparte sobre
 * uniones, colapsa las dos ramas en un solo objeto y `{ clearable: true, endIcon }` vuelve a
 * compilar. Para derivar props, repartir el Omit por rama:
 *
 * ```ts
 * type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
 * type MyProps = DistributiveOmit<InputProps, 'size'>;
 * ```
 *
 * o partir de `InputBaseProps`, que además sirve para `interface X extends ...` (una interface
 * no puede extender esta unión).
 */
export type InputProps = InputWithEndIconProps | ClearableInputProps;

// Setter nativo de `value`: React instala un tracker sobre la instancia, así que `input.value = ''`
// lo actualiza y el evento posterior se descarta como "sin cambio". Llamar al setter del
// prototipo lo esquiva y el evento `input` burbujeante llega al onChange de React, igual en
// modo controlado, no controlado y con `register` de react-hook-form.
function clearNativeInput(input: HTMLInputElement) {
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(input, '');
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      size,
      label,
      error,
      helperText,
      startIcon,
      endIcon,
      clearable,
      onClear,
      clearLabel = 'Clear',
      id,
      disabled,
      readOnly,
      placeholder,
      ...props
    },
    ref,
  ) => {
    // Generate a unique ID if one is not provided, for accessibility
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const descriptionId = `${inputId}-description`;

    // Determine if there is an error to activate the visual variant
    const hasError = !!error;
    const finalVariant = hasError ? 'error' : variant;

    // Sin botón con disabled/readOnly: el campo no se puede editar, vaciarlo tampoco.
    const showClear = !!clearable && !disabled && !readOnly;

    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const setRefs = React.useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    const handleClear = () => {
      const input = inputRef.current;
      if (!input) return;
      clearNativeInput(input);
      onClear?.();
      input.focus();
    };

    return (
      <div className="w-full flex flex-col gap-1.5">
        {/* 1. Accessible Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
              hasError ? 'text-error-focus' : 'text-base-content',
            )}
          >
            {label}
          </label>
        )}

        {/* 2. Wrapper for Input + Icons */}
        <div className="relative">
          {startIcon && (
            <div
              aria-hidden="true"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50 pointer-events-none [&_svg]:size-4"
            >
              {startIcon}
            </div>
          )}

          <input
            id={inputId}
            ref={setRefs}
            disabled={disabled}
            readOnly={readOnly}
            // La visibilidad del botón sale de :placeholder-shown (sin estado propio, así reset()/
            // setValue() de RHF, que cambian el valor sin eventos, no lo desincronizan), y esa
            // pseudo-clase solo existe con un placeholder no vacío.
            placeholder={showClear ? placeholder || ' ' : placeholder}
            // ARIA binding for screen readers
            aria-invalid={hasError}
            aria-describedby={hasError ? errorId : helperText ? descriptionId : undefined}
            className={cn(
              inputVariants({ variant: finalVariant, size, clearable: showClear, className }),
              // Adjust padding if there are icons
              startIcon && 'pl-10!',
              endIcon && 'pr-10!',
              // type="search" trae su propia ✕ en WebKit/Blink: se oculta para no duplicarla.
              showClear && 'peer [&::-webkit-search-cancel-button]:appearance-none',
            )}
            {...props}
          />

          {/* Sin manejo propio de Escape: Radix lo escucha en document en fase de captura, así
              que dentro de un Dialog/Sheet cerraría el modal en vez de limpiar. */}
          {showClear && (
            <button
              type="button"
              aria-label={clearLabel}
              onClick={handleClear}
              className="absolute right-0 top-0 flex h-full aspect-square items-center justify-center rounded-btn text-base-content/50 transition-colors hover:text-base-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary peer-placeholder-shown:hidden"
            >
              <Cross2Icon aria-hidden="true" className="size-4" />
            </button>
          )}

          {endIcon && (
            <div
              aria-hidden="true"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 pointer-events-none [&_svg]:size-4"
            >
              {endIcon}
            </div>
          )}
        </div>

        {/* 3. Error or Help Messages */}
        {hasError ? (
          <p id={errorId} className="text-xs text-error-focus font-medium">
            {error}
          </p>
        ) : helperText ? (
          <p id={descriptionId} className="text-xs text-base-content/65">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = 'Input';

export { Input };
