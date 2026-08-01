import { cva } from 'class-variance-authority';

export const progressRingVariants = cva('transition-[stroke-dashoffset]', {
  variants: {
    variant: {
      primary: 'stroke-primary',
      success: 'stroke-success',
      warning: 'stroke-warning',
      error: 'stroke-error',
    },
  },
  defaultVariants: {
    variant: 'primary',
  },
});
