import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

// -----------------------------------------------------------------------------
// Heading Component
// -----------------------------------------------------------------------------

const headingVariants = cva(
  'font-bold tracking-tight text-base-content', // Base styles
  {
    variants: {
      level: {
        h1: 'text-4xl lg:text-5xl',
        h2: 'text-3xl lg:text-4xl first:mt-0',
        h3: 'text-2xl font-semibold',
        h4: 'text-xl font-semibold',
      },
    },
    defaultVariants: {
      level: 'h2',
    },
  },
);

export interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>, VariantProps<typeof headingVariants> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, level, as, ...props }, ref) => {
    // If 'as' is not provided, we default to the HTML tag matching the level (e.g. level="h1" -> <h1>)
    const Component = as || level || 'h2';

    return <Component ref={ref} className={cn(headingVariants({ level, className }))} {...props} />;
  },
);
Heading.displayName = 'Heading';

// -----------------------------------------------------------------------------
// Text / Paragraph Component
// -----------------------------------------------------------------------------

const textVariants = cva('text-base-content', {
  variants: {
    size: {
      sm: 'text-sm leading-5',
      md: 'text-base leading-7', // Optimized for readability
      lg: 'text-lg font-semibold',
      lead: 'text-xl text-base-content/80',
      muted: 'text-sm text-base-content/60',
    },
    weight: {
      normal: 'font-normal',
      medium: 'font-medium',
      bold: 'font-bold',
    },
  },
  defaultVariants: {
    size: 'md',
    weight: 'normal',
  },
});

export interface TextProps
  extends React.HTMLAttributes<HTMLParagraphElement>, VariantProps<typeof textVariants> {
  as?: React.ElementType;
}

const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ className, size, weight, as: Component = 'p', ...props }, ref) => {
    return (
      <Component ref={ref} className={cn(textVariants({ size, weight, className }))} {...props} />
    );
  },
);
Text.displayName = 'Text';

export { Heading, Text };
