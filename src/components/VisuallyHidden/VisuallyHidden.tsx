import * as React from 'react';
import { cn } from '../../utils/cn';

export interface VisuallyHiddenProps extends React.HTMLAttributes<HTMLElement> {
  /** Element to render. `span` by default; use `div` to wrap block content. */
  as?: React.ElementType;
}

/**
 * Hides its content from view but keeps it available to screen readers
 * (`sr-only`). For example, for a `SheetTitle` or `DialogTitle` the design doesn't show.
 */
const VisuallyHidden = React.forwardRef<HTMLElement, VisuallyHiddenProps>(
  ({ className, as: Component = 'span', ...props }, ref) => (
    <Component ref={ref} className={cn('sr-only', className)} {...props} />
  ),
);
VisuallyHidden.displayName = 'VisuallyHidden';

export { VisuallyHidden };
