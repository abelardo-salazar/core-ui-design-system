import { cva } from 'class-variance-authority';

export const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs text-center font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-content hover:bg-primary-focus',
        secondary:
          'border-transparent bg-secondary text-secondary-content hover:bg-secondary-focus',
        destructive: 'border-transparent bg-error text-error-content hover:bg-error-focus',
        outline: 'text-base-content border-base-content/20',
        ghost: 'border-transparent bg-base-200 text-base-content hover:bg-base-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);
