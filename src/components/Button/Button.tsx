import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { ReloadIcon } from '@radix-ui/react-icons'; // Importamos el icono
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
    const Comp = asChild ? Slot : 'button';
    const classes = cn(buttonVariants({ variant, size, fullWidth, className }));

    if (asChild) {
      return (
        <Comp
          className={classes}
          ref={ref}
          aria-disabled={isLoading || disabled}
          data-loading={isLoading}
          {...props}
        >
          {children}
        </Comp>
      );
    }

    return (
      <button className={classes} disabled={isLoading || disabled} ref={ref} {...props}>
        {isLoading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
        {!isLoading && startIcon && <span className="mr-2">{startIcon}</span>}
        {children}
        {!isLoading && endIcon && <span className="ml-2">{endIcon}</span>}
      </button>
    );
  },
);

Button.displayName = 'Button';

export { Button };
