import * as React from 'react';
import { cn } from '../../utils/cn';

// Server-safe: the root gets `size` as a prop and the parts read it through CSS (data-size on
// the root + group-data-[size=sm]/card on each part), not through a React context, which would
// make it client. A named group so it doesn't react to an external `group`. Each part has its
// md padding in the base and the sm override in the group variant, which weighs (0,2,0) and so
// wins over the base without tailwind-merge. A Card nested in an sm Card also gets sm:
// group-data matches any ancestor.
const SM_HEADER = 'group-data-[size=sm]/card:p-4';
// px/pb, not p-4: the variant's specificity would also beat the base's pt-0.
const SM_BODY = 'group-data-[size=sm]/card:px-4 group-data-[size=sm]/card:pb-4';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Padding of the parts: `md` 24px, `sm` 16px. @default 'md' */
  size?: 'md' | 'sm';
}

// -----------------------------------------------------------------------------
// Card Root
// -----------------------------------------------------------------------------
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, size = 'md', ...props }, ref) => (
    <div
      ref={ref}
      // Only for the parts (group-data); the root's own styles don't depend on the size.
      data-size={size}
      className={cn(
        // Base styles: rounded corners, border, background color, shadow
        'group/card rounded-box border border-base-300 bg-base-100 text-base-content shadow-sm',
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
// With size="sm" the padding adjustment wins over `className` by specificity: to change it in sm,
// use the same variant (for example, `group-data-[size=sm]/card:p-3`).
const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 p-6', SM_HEADER, className)}
      {...props}
    />
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
  <p ref={ref} className={cn('text-sm text-base-content', className)} {...props} />
));
CardDescription.displayName = 'CardDescription';

// -----------------------------------------------------------------------------
// Card Content (Main Body)
// -----------------------------------------------------------------------------
// With size="sm" the padding adjustment wins over `className` by specificity: to change it in sm,
// use the same variant (for example, `group-data-[size=sm]/card:p-3`).
const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', SM_BODY, className)} {...props} />
  ),
);
CardContent.displayName = 'CardContent';

// -----------------------------------------------------------------------------
// Card Footer (Actions area)
// -----------------------------------------------------------------------------
// With size="sm" the padding adjustment wins over `className` by specificity: to change it in sm,
// use the same variant (for example, `group-data-[size=sm]/card:p-3`).
const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center p-6 pt-0', SM_BODY, className)} {...props} />
  ),
);
CardFooter.displayName = 'CardFooter';

// Export all components
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
