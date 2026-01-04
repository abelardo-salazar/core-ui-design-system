import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-btn text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-content hover:bg-primary-focus shadow-sm',
        secondary: 'bg-secondary text-secondary-content hover:bg-secondary-focus shadow-sm',
        outline:
          'border border-base-300 bg-transparent text-base-content hover:bg-base-200 shadow-sm',
        ghost: 'hover:bg-base-200 text-base-content hover:text-base-content',
        link: 'text-primary underline-offset-4 hover:underline decoration-primary',
        destructive: 'bg-error text-error-content hover:bg-error-focus shadow-sm',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 py-2',
        lg: 'h-12 px-8 text-base',
        icon: 'h-10 w-10',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  },
);
