import * as React from 'react';
import { cn } from '../../utils/cn';

// -----------------------------------------------------------------------------
// Card Root
// -----------------------------------------------------------------------------
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        // Base styles: rounded corners, border, background color, shadow
        'rounded-box border border-base-300 bg-base-100 text-base-content shadow-sm',
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = 'Card';

// -----------------------------------------------------------------------------
// Card Header (Container for Title + Description)
// -----------------------------------------------------------------------------
const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
  ),
);
CardHeader.displayName = 'CardHeader';

// -----------------------------------------------------------------------------
// Card Title (H3 typography)
// -----------------------------------------------------------------------------
const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    // eslint-disable-next-line jsx-a11y/heading-has-content
    <h3
      ref={ref}
      className={cn('font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  ),
);
CardTitle.displayName = 'CardTitle';

// -----------------------------------------------------------------------------
// Card Description (Muted text)
// -----------------------------------------------------------------------------
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-base-content/60', className)} {...props} />
));
CardDescription.displayName = 'CardDescription';

// -----------------------------------------------------------------------------
// Card Content (Main Body)
// -----------------------------------------------------------------------------
const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  ),
);
CardContent.displayName = 'CardContent';

// -----------------------------------------------------------------------------
// Card Footer (Actions area)
// -----------------------------------------------------------------------------
const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
  ),
);
CardFooter.displayName = 'CardFooter';

// Export all components
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
