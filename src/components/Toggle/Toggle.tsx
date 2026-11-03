'use client';

import * as React from 'react';
import * as TogglePrimitive from '@radix-ui/react-toggle';
import { cn } from '../../utils/cn';
import { toggleVariants, type ToggleSize } from './toggleVariants';

type ToggleBaseProps = Omit<
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root>,
  'children' | 'asChild' | 'aria-label'
> & {
  /** Height (32 / 44 / 48, Button's scale). `sm` responds in 44px. @default 'md' */
  size?: ToggleSize;
};

export type ToggleWithTextProps = ToggleBaseProps & {
  children: React.ReactNode;
  /** Decorative: hidden from assistive technology, the text names the control. */
  icon?: React.ReactNode;
  'aria-label'?: string;
};

export type ToggleIconOnlyProps = ToggleBaseProps & {
  children?: undefined;
  icon: React.ReactNode;
  /** Required: without text, the icon doesn't provide an accessible name. */
  'aria-label': string;
};

// Discriminated by children: "icon only" is decided by the types, so a Toggle with no accessible
// name is a compile error rather than something to catch in review.
export type ToggleProps = ToggleWithTextProps | ToggleIconOnlyProps;

/**
 * Button that stays on or off, with `aria-pressed`. For several related options, use
 * `ToggleGroup`; for a tag that is filtered or removed, `Chip`.
 */
const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({ className, size, icon, children, ...props }, ref) => {
    const iconOnly = children === undefined || children === null;

    return (
      <TogglePrimitive.Root
        ref={ref}
        className={cn(toggleVariants({ size, iconOnly }), className)}
        {...props}
      >
        {icon !== undefined && icon !== null && (
          <span aria-hidden="true" className="inline-flex shrink-0">
            {icon}
          </span>
        )}
        {children}
      </TogglePrimitive.Root>
    );
  },
);
Toggle.displayName = 'Toggle';

export { Toggle };
