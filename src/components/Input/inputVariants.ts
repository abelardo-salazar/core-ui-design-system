import { cva } from 'class-variance-authority';

export const inputVariants = cva(
  // Base styles
  'flex w-full rounded-btn border bg-base-100 px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-base-content/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      // Visual state (borders and focus ring)
      variant: {
        default: 'border-base-300 focus-visible:ring-primary focus-visible:border-primary',
        error: 'border-error focus-visible:ring-error text-error-focus placeholder:text-error/50',
      },
      // Sizes (height and padding). md = 44px: lines up with Button md and the Select trigger
      // (same family of form controls); sm (32px) and lg (48px) don't change.
      size: {
        sm: 'h-8 px-2 text-xs',
        md: 'h-11 px-3',
        lg: 'h-12 px-4 text-base',
      },
      // Reserves on the right the width of the clear button (a square of the input's height), so
      // it's derived from the size in compoundVariants instead of a fixed pr.
      clearable: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      { clearable: true, size: 'sm', class: 'pr-8' },
      { clearable: true, size: 'md', class: 'pr-11' },
      { clearable: true, size: 'lg', class: 'pr-12' },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'md',
      clearable: false,
    },
  },
);
