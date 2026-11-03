import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';

// Same props and DOM as the @radix-ui/react-aspect-ratio primitive it replaces (see
// ARCHITECTURE.md § Separator y AspectRatio propios), including the
// data-radix-aspect-ratio-wrapper attribute, which consumers may target from CSS.
export type AspectRatioProps = React.ComponentPropsWithoutRef<'div'> & {
  /** Renders the single child instead of the inner div, merging props, styles and refs into it. */
  asChild?: boolean;
  /** Width / height (e.g. `16 / 9`). Defaults to 1. */
  ratio?: number;
};

// The padding-bottom trick: a percentage padding is relative to the width, so the wrapper keeps
// the ratio with CSS alone, and the inner element fills it. Named render function and no
// displayName, like the Radix primitive (its displayName was undefined, and the DS copied it).
const AspectRatio = React.forwardRef<HTMLDivElement, AspectRatioProps>(function AspectRatio(
  { ratio = 1, style, asChild = false, ...props },
  ref,
) {
  const Comp = asChild ? Slot : 'div';
  return (
    <div
      style={{ position: 'relative', width: '100%', paddingBottom: `${100 / ratio}%` }}
      data-radix-aspect-ratio-wrapper=""
    >
      <Comp
        {...props}
        ref={ref}
        style={{ ...style, position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
      />
    </div>
  );
});

export { AspectRatio };
