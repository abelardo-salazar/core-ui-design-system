import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { buttonVariants } from './buttonVariants';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      asChild = false,
      isLoading = false,
      startIcon,
      endIcon,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    // If asChild is true, use Radix's Slot component.
    // If false, use a native 'button'.
    const Comp = asChild ? Slot : 'button';

    // Compute base classes
    const classes = cn(buttonVariants({ variant, size, fullWidth, className }));

    // ARCHITECTURE NOTE:
    // If we use asChild, we assume the user passes a single child element
    // that will receive the styles. In that case, automatically injecting
    // icons/spinner becomes complex because Slot expects a single direct child.

    // Strategy:
    // 1. If NOT asChild: Render the full internal structure (Spinner, Icons, Text).
    // 2. If asChild: Render 'children' as-is. The user is responsible
    //    for placing content inside their child component (e.g., <Link>Text</Link>).

    if (asChild) {
      return (
        <Comp
          className={classes}
          ref={ref}
          // We force aria-disabled if loading or disabled to maintain accessibility
          aria-disabled={isLoading || disabled}
          // If it's Slot, pass data-attributes for conditional styling if needed
          data-loading={isLoading}
          {...props}
        >
          {children}
        </Comp>
      );
    }

    return (
      <button className={classes} disabled={isLoading || disabled} ref={ref} {...props}>
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {!isLoading && startIcon && <span className="mr-2">{startIcon}</span>}
        {children}
        {!isLoading && endIcon && <span className="ml-2">{endIcon}</span>}
      </button>
    );
  },
);

Button.displayName = 'Button';

export { Button };
