import { cva } from 'class-variance-authority';

export const progressIndicatorVariants = cva('h-full w-full flex-1 transition-transform', {
  variants: {
    variant: {
      primary: 'bg-primary',
      success: 'bg-success',
      warning: 'bg-warning',
      error: 'bg-error',
    },
  },
  defaultVariants: {
    variant: 'primary',
  },
});
