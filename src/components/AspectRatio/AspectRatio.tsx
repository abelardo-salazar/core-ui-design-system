import * as React from 'react';
import * as AspectRatioPrimitive from '@radix-ui/react-aspect-ratio';

// Sin 'use client': la primitiva de Radix resuelve el layout vía CSS puro (padding-bottom
// trick), sin hooks ni estado — server-safe, mismo criterio que ProgressRing/Separator/Slot.
export type AspectRatioProps = React.ComponentPropsWithoutRef<typeof AspectRatioPrimitive.Root>;

const AspectRatio = React.forwardRef<
  React.ElementRef<typeof AspectRatioPrimitive.Root>,
  AspectRatioProps
>((props, ref) => <AspectRatioPrimitive.Root ref={ref} {...props} />);
AspectRatio.displayName = AspectRatioPrimitive.Root.displayName;

export { AspectRatio };
