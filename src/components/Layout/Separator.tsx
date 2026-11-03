import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const separatorVariants = cva('shrink-0 bg-base-300', {
  variants: {
    orientation: {
      horizontal: 'h-[1px] w-full',
      vertical: 'h-full w-[1px]',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
  },
});

// Same props and DOM as the @radix-ui/react-separator primitive it replaces (see
// ARCHITECTURE.md § Separator y AspectRatio propios). No hooks or state: server-safe.
type SeparatorProps = React.ComponentPropsWithoutRef<'div'> & {
  /** Renders the single child instead of a div, merging props, classes and refs into it. */
  asChild?: boolean;
  /** Either `vertical` or `horizontal`. Defaults to `horizontal`. */
  orientation?: 'horizontal' | 'vertical';
  /**
   * Whether the separator is purely visual. When true (the default) it gets role="none" and is
   * left out of the accessibility tree; when false, role="separator".
   */
  decorative?: boolean;
};

// Named render function and no displayName, like the Radix primitive (its displayName was
// undefined, and the DS copied it).
const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(function Separator(
  { className, orientation = 'horizontal', decorative = true, asChild = false, ...props },
  ref,
) {
  // A value outside the union (JS consumers) falls back to horizontal in the attributes; cva
  // still gets the raw value, so no orientation classes are applied.
  const validOrientation = orientation === 'vertical' ? 'vertical' : 'horizontal';
  // horizontal is the implicit aria-orientation of role="separator", so it's omitted.
  const semanticProps = decorative
    ? { role: 'none' }
    : {
        'aria-orientation': validOrientation === 'vertical' ? ('vertical' as const) : undefined,
        role: 'separator',
      };
  const Comp = asChild ? Slot : 'div';
  return (
    <Comp
      data-orientation={validOrientation}
      {...semanticProps}
      className={cn(separatorVariants({ orientation, className }))}
      {...props}
      ref={ref}
    />
  );
});

export { Separator };
