import { cva } from 'class-variance-authority';

export const inputVariants = cva(
  // Base styles
  'flex w-full rounded-btn border bg-base-200 px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-base-content/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      // Visual state (borders and focus ring)
      variant: {
        default: 'border-base-300 focus-visible:ring-primary focus-visible:border-primary',
        error: 'border-error focus-visible:ring-error text-error placeholder:text-error/50',
      },
      // Sizes (height and padding)
      size: {
        sm: 'h-8 px-2 text-xs',
        md: 'h-10 px-3',
        lg: 'h-12 px-4 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
);
