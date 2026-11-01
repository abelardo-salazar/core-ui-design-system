import * as React from 'react';
import * as AspectRatioPrimitive from '@radix-ui/react-aspect-ratio';

// No 'use client': the Radix primitive solves the layout with pure CSS (the padding-bottom
// trick), without hooks or state; server-safe, same criterion as ProgressRing/Separator/Slot.
export type AspectRatioProps = React.ComponentPropsWithoutRef<typeof AspectRatioPrimitive.Root>;

const AspectRatio = React.forwardRef<
  React.ElementRef<typeof AspectRatioPrimitive.Root>,
  AspectRatioProps
>((props, ref) => <AspectRatioPrimitive.Root ref={ref} {...props} />);
AspectRatio.displayName = AspectRatioPrimitive.Root.displayName;

export { AspectRatio };
