'use client';

import * as React from 'react';
import { useControllableState } from '@radix-ui/react-use-controllable-state';
import { MinusIcon, PlusIcon } from '@radix-ui/react-icons';
import { Button } from '../Button/Button';
import { Input } from '../Input/Input';
import { cn } from '../../utils/cn';

export interface QuantityStepperProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    // 'size' choca con la variante de tamaño de Input (string), no con el atributo nativo
    // (number) — mismo Omit que ya usa InputProps.
    'value' | 'defaultValue' | 'onChange' | 'type' | 'min' | 'max' | 'step' | 'size'
  > {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  /** Incremento/decremento por click. @default 1 */
  step?: number;
  disabled?: boolean;
}

function clamp(rawValue: number, min: number, max: number) {
  return Math.min(max, Math.max(min, rawValue));
}

const QuantityStepper = React.forwardRef<HTMLInputElement, QuantityStepperProps>(
  (
    {
      value,
      defaultValue,
      onChange,
      min = -Infinity,
      max = Infinity,
      step = 1,
      disabled = false,
      className,
      id,
      'aria-label': ariaLabel,
      ...props
    },
    ref,
  ) => {
    const [currentValue, setCurrentValue] = useControllableState<number>({
      prop: value,
      defaultProp: defaultValue ?? (Number.isFinite(min) ? min : 0),
      onChange,
    });

    const safeValue = currentValue ?? 0;

    // Deshabilitado real vía prop `disabled` de Button, no un no-op en el handler:
    // el botón no debe recibir foco/click cuando ya no hay a dónde mover el valor.
    const canDecrement = !disabled && safeValue - step >= min;
    const canIncrement = !disabled && safeValue + step <= max;

    const handleDecrement = () => {
      setCurrentValue(clamp(safeValue - step, min, max));
    };

    const handleIncrement = () => {
      setCurrentValue(clamp(safeValue + step, min, max));
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const raw = event.target.value;
      // Permitimos que el campo quede vacío mientras se edita (seleccionar todo + borrar);
      // onBlur lo devuelve a un valor válido. El valor controlado nunca llega a estar vacío.
      if (raw === '') return;
      const parsed = Number(raw);
      if (Number.isNaN(parsed)) return;
      setCurrentValue(clamp(parsed, min, max));
    };

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      if (event.target.value === '') {
        setCurrentValue(clamp(0, min, max));
      }
    };

    return (
      <div className={cn('inline-flex items-center gap-1', className)} role="group">
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={!canDecrement}
          onClick={handleDecrement}
          aria-label="Decrease quantity"
        >
          <MinusIcon />
        </Button>

        <Input
          {...props}
          ref={ref}
          id={id}
          type="number"
          min={Number.isFinite(min) ? min : undefined}
          max={Number.isFinite(max) ? max : undefined}
          step={step}
          disabled={disabled}
          value={safeValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          // role="spinbutton" (implícito de type="number") exige nombre accesible; sin label
          // visible propio, el a11y addon de Storybook lo marca "Critical" (Form label).
          aria-label={ariaLabel ?? 'Quantity'}
          className={cn(
            'w-full text-center',
            // h-11: alinea la altura del input con los botones +/- (size="icon" de Button,
            // 44px tras el fix de touch target) — Input no tiene un size md/lg que dé
            // exactamente 44px, así que se pisa la altura puntualmente acá vía className
            // (cn/twMerge) sin tocar Input.tsx ni sus variants.
            'h-11',
            // El input number nativo trae sus propias flechas de +/-; las ocultamos para
            // que no convivan visualmente con los botones custom de este componente.
            '[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [appearance:textfield]',
          )}
        />

        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={!canIncrement}
          onClick={handleIncrement}
          aria-label="Increase quantity"
        >
          <PlusIcon />
        </Button>
      </div>
    );
  },
);

QuantityStepper.displayName = 'QuantityStepper';

export { QuantityStepper };
