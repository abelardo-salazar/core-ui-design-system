import { cva } from 'class-variance-authority';

export const inputVariants = cva(
  // Base styles. 16px text in every size: iOS Safari zooms in on focus below 16px.
  'flex w-full rounded-btn border bg-base-100 px-3 text-base transition-colors file:border-0 file:bg-transparent file:text-base file:font-medium placeholder:text-base-content/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
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
        // Vertical padding only in md/lg: in sm, py-2 would leave 14px of content for the 24px
        // line of 16px text.
        sm: 'h-8 px-2',
        md: 'h-11 px-3 py-2',
        lg: 'h-12 px-4 py-2',
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
