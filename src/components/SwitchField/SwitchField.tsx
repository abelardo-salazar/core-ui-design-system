'use client';

import * as React from 'react';
import { SelectionField, type SelectionFieldTextProps } from '../SelectionField/SelectionField';
import { Switch, type SwitchProps } from '../Switch';

export type SwitchFieldProps = Omit<SwitchProps, 'children' | 'asChild'> & SelectionFieldTextProps;

/**
 * Switch in a row that is a touch target as a whole, at least 48px high: text on the left,
 * control on the right. Accepts the props of `Switch`, and the `ref` goes to it. `className`
 * applies to the row.
 */
const SwitchField = React.forwardRef<React.ElementRef<typeof Switch>, SwitchFieldProps>(
  ({ id, label, description, className, 'aria-describedby': describedBy, ...props }, ref) => (
    <SelectionField
      id={id}
      label={label}
      description={description}
      disabled={props.disabled}
      className={className}
      aria-describedby={describedBy}
      rowClassName="items-center justify-between gap-3 py-2"
      controlPosition="end"
      renderControl={(controlProps) => <Switch {...controlProps} {...props} ref={ref} />}
    />
  ),
);
SwitchField.displayName = 'SwitchField';

export { SwitchField };
