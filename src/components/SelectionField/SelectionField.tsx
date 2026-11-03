'use client';

import * as React from 'react';
import { cn } from '../../utils/cn';

export interface SelectionFieldTextProps {
  /** Text that names the control. */
  label: React.ReactNode;
  /** Second line, linked with aria-describedby. With `disabled`, the place for the reason. */
  description?: React.ReactNode;
}

interface SelectionFieldControlProps {
  id: string;
  'aria-labelledby': string;
  'aria-describedby': string | undefined;
}

interface SelectionFieldProps extends SelectionFieldTextProps {
  id?: string;
  disabled?: boolean;
  className?: string;
  'aria-describedby'?: string;
  /** Layout of the row: control and text. */
  rowClassName: string;
  controlPosition: 'start' | 'end';
  renderControl: (props: SelectionFieldControlProps) => React.ReactNode;
}

// Internal, not exported from the barrel: the row shared by SwitchField and CheckboxField.
//
// The whole row is a <label> so that it's all a touch target, which also puts the description
// inside it. aria-labelledby points only to the label text: naming the control through the
// <label> would read the description twice, in the name and through aria-describedby.
//
// htmlFor is explicit so the row doesn't depend on which labelable descendant comes first: inside
// a <form>, Radix adds a hidden input next to the control.
function SelectionField({
  id: idProp,
  label,
  description,
  disabled,
  className,
  'aria-describedby': describedBy,
  rowClassName,
  controlPosition,
  renderControl,
}: SelectionFieldProps) {
  const generatedId = React.useId();
  const id = idProp ?? generatedId;
  const labelId = `${id}-label`;
  const descriptionId = `${id}-description`;
  const hasDescription = description !== undefined && description !== null;

  const control = renderControl({
    id,
    'aria-labelledby': labelId,
    'aria-describedby':
      [describedBy, hasDescription ? descriptionId : undefined].filter(Boolean).join(' ') ||
      undefined,
  });

  return (
    <label
      htmlFor={id}
      className={cn(
        'flex min-h-12 w-full',
        rowClassName,
        disabled ? 'cursor-not-allowed' : 'cursor-pointer',
        className,
      )}
    >
      {controlPosition === 'start' && control}
      <span className="flex min-w-0 flex-col gap-0.5">
        {/* Only the label is dimmed: the description may hold the reason, it must stay legible. */}
        <span
          id={labelId}
          className={cn('text-sm font-medium text-base-content', disabled && 'opacity-50')}
        >
          {label}
        </span>
        {hasDescription && (
          <span id={descriptionId} className="text-xs text-base-content/70">
            {description}
          </span>
        )}
      </span>
      {controlPosition === 'end' && control}
    </label>
  );
}

export { SelectionField };
