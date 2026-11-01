'use client';

import * as React from 'react';
import { useControllableState } from '@radix-ui/react-use-controllable-state';
import { MinusIcon, PlusIcon } from '@radix-ui/react-icons';
import { Button } from '../Button/Button';
import { Input } from '../Input/Input';
import { cn } from '../../utils/cn';

export interface QuantityStepperProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  // 'size' clashes with Input's size variant (string), not with the native attribute
  // (number); same Omit that InputProps already uses.
  'value' | 'defaultValue' | 'onChange' | 'type' | 'min' | 'max' | 'step' | 'size'
> {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  /** Increment/decrement per click. @default 1 */
  step?: number;
  disabled?: boolean;
  /** Accessible name of the − button. @default 'Decrease quantity' */
  decrementLabel?: string;
  /** Accessible name of the + button. @default 'Increase quantity' */
  incrementLabel?: string;
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
      decrementLabel = 'Decrease quantity',
      incrementLabel = 'Increase quantity',
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

    // Really disabled through Button's `disabled` prop, not a no-op in the handler:
    // the button must not get focus/clicks when there's nowhere left to move the value.
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
      // We let the field be empty while editing (select all + delete);
      // onBlur brings it back to a valid value. The controlled value is never empty.
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
          aria-label={decrementLabel}
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
          // role="spinbutton" (implicit from type="number") requires an accessible name; without a
          // visible label of its own, Storybook's a11y addon flags it as "Critical" (Form label).
          aria-label={ariaLabel ?? 'Quantity'}
          className={cn(
            // No height override here: Input md already gives 44px on its own (same family of
            // form controls as Button), aligned out of the box with the +/- buttons
            // (Button's size="icon", also 44px); before, it had to be overridden by hand with
            // className="h-11" because Input md measured 40px; not anymore.
            'w-full text-center',
            // The native number input has its own +/- arrows; we hide them so
            // they don't coexist visually with this component's custom buttons.
            '[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [appearance:textfield]',
          )}
        />

        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={!canIncrement}
          onClick={handleIncrement}
          aria-label={incrementLabel}
        >
          <PlusIcon />
        </Button>
      </div>
    );
  },
);

QuantityStepper.displayName = 'QuantityStepper';

export { QuantityStepper };
