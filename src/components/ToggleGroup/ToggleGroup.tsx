'use client';

import * as React from 'react';
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';
import { useControllableState } from '@radix-ui/react-use-controllable-state';
import { cn } from '../../utils/cn';
import { toggleGroupItemVariants, type ToggleGroupSize } from './toggleGroupVariants';

const ToggleGroupSizeContext = React.createContext<ToggleGroupSize>('md');

const groupClassName = 'inline-flex items-center gap-1 rounded-btn bg-base-200';

interface ToggleGroupSizeProps {
  /** Height of the items (32 / 44 / 48, Button's scale). Each item can override it. @default 'md' */
  size?: ToggleGroupSize;
}

export type ToggleGroupSingleProps = ToggleGroupPrimitive.ToggleGroupSingleProps &
  ToggleGroupSizeProps;
export type ToggleGroupMultipleProps = ToggleGroupPrimitive.ToggleGroupMultipleProps &
  ToggleGroupSizeProps;
export type ToggleGroupProps = ToggleGroupSingleProps | ToggleGroupMultipleProps;

// Radix never keeps its own state: the DS always passes it `value`. In single mode, Radix emits ''
// when clicking the active item; filtering it in onValueChange wouldn't be enough in uncontrolled
// mode, because Radix's internal state would already have changed.
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
 * Group of options that change a value (a view, a filter, a format). To change which
 * content panel is shown, use `Tabs`.
 *
 * - `type="single"`: `radiogroup` with `radio` items (`aria-checked`). Once a value is chosen,
 *   there's always one: clicking the active item doesn't turn it off and `onValueChange` never
 *   gets `''`. Before the first choice the value is `''` (unless `defaultValue`/`value`).
 * - `type="multiple"`: `toolbar` with `aria-pressed` items. It can be empty.
 *
 * Keyboard: a single tab stop; the arrows move focus **without selecting** and Space or
 * Enter select. In single mode this departs from the ARIA radio pattern (where the arrow
 * also selects) on purpose: changing the value usually fires a query, and going through the
 * options with the arrows must not fire one for each.
 *
 * `orientation`, `disabled` and `loop` go straight to Radix.
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
 * Option of a `ToggleGroup`. If it only shows an icon, it needs `aria-label` (for example,
 * `aria-label="List view"`): the icon doesn't provide an accessible name. `size` overrides the
 * group's.
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
