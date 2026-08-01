'use client';

import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { progressIndicatorVariants } from './progressVariants';

export interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>,
    VariantProps<typeof progressIndicatorVariants> {}

const Progress = React.forwardRef<React.ElementRef<typeof ProgressPrimitive.Root>, ProgressProps>(
  ({ className, value, max = 100, variant, 'aria-label': ariaLabel, ...props }, ref) => {
    const percentage = ((value ?? 0) / max) * 100;

    return (
      <ProgressPrimitive.Root
        ref={ref}
        value={value}
        max={max}
        aria-label={ariaLabel ?? 'Progress'}
        className={cn(
          'relative h-2 w-full overflow-hidden rounded-full bg-base-300',
          className,
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(progressIndicatorVariants({ variant }))}
          style={{ transform: `translateX(-${100 - percentage}%)` }}
        />
      </ProgressPrimitive.Root>
    );
  },
);
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
