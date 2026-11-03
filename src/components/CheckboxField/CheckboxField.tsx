'use client';

import * as React from 'react';
import { Checkbox, type CheckboxProps } from '../Checkbox';
import { SelectionField, type SelectionFieldTextProps } from '../SelectionField/SelectionField';

export type CheckboxFieldProps = Omit<CheckboxProps, 'children' | 'asChild'> &
  SelectionFieldTextProps;

/**
 * Checkbox in a row that is a touch target as a whole, at least 48px high: control on the left.
 * Accepts the props of `Checkbox`, and the `ref` goes to it. `className` applies to the row.
 */
const CheckboxField = React.forwardRef<React.ElementRef<typeof Checkbox>, CheckboxFieldProps>(
  ({ id, label, description, className, 'aria-describedby': describedBy, ...props }, ref) => (
    <SelectionField
      id={id}
      label={label}
      description={description}
      disabled={props.disabled}
      className={className}
      aria-describedby={describedBy}
      // items-start keeps the box on the first line when the text wraps. py-3.5 + the 20px line
      // of the label add up to 48px, so a single line stays centered.
      rowClassName="items-start gap-3 py-3.5"
      controlPosition="start"
      // Checkbox has no cursor of its own; its disabled:cursor-not-allowed still wins when disabled.
      renderControl={(controlProps) => (
        <Checkbox {...controlProps} {...props} className="cursor-pointer" ref={ref} />
      )}
    />
  ),
);
CheckboxField.displayName = 'CheckboxField';

export { CheckboxField };
