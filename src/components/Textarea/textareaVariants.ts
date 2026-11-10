import { cva } from 'class-variance-authority';

// 16px text: iOS Safari zooms in on focus below 16px.
export const textareaVariants = cva(
  'flex min-h-[80px] w-full rounded-btn border bg-base-100 px-3 py-2 text-base [-webkit-tap-highlight-color:transparent] placeholder:text-base-content/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-base-300 focus-visible:ring-primary focus-visible:border-primary',
        error: 'border-error focus-visible:ring-error text-error-focus placeholder:text-error/50',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);
