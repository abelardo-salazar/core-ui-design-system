import * as React from 'react';
import { type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { progressRingVariants } from './progressRingVariants';

export interface ProgressRingProps
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>,
    VariantProps<typeof progressRingVariants> {
  value: number;
  max?: number;
  /** Ring diameter in px. */
  size?: number;
  strokeWidth?: number;
  /** Shows the percentage centered inside the ring. Opt-in: at small sizes the label doesn't fit. */
  showValueLabel?: boolean;
}

function ProgressRing({
  className,
  value,
  max = 100,
  variant,
  size = 64,
  strokeWidth = 6,
  showValueLabel = false,
  'aria-label': ariaLabel,
  ...props
}: ProgressRingProps) {
  const clampedValue = Math.min(Math.max(value, 0), max);
  const percentage = (clampedValue / max) * 100;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const center = size / 2;

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={ariaLabel ?? 'Progress'}
      {...props}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={strokeWidth}
          className="fill-none stroke-base-300"
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn('fill-none', progressRingVariants({ variant }))}
        />
      </svg>
      {showValueLabel && (
        <span className="absolute text-sm font-semibold text-base-content">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
}

export { ProgressRing };
