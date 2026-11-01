import * as React from 'react';
import { cn } from '../../utils/cn';
import { emptyStateVariants } from './emptyStateVariants';

// Server-safe: the root gets `size` as a prop and resolves it with cva; the parts get it
// through CSS (data-size on the root + group-data-[size=…]/empty-state on each part), not
// through a React context, which would make it client. A named group so it doesn't react to an
// external `group`. Each part has its base in md and the sm override in a variant, which
// Tailwind emits after the base utilities: that's why it wins over the consumer's className
// (see the parts' JSDoc).

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /** `sm` for tables and cards; `md` for a whole page. */
  size?: 'sm' | 'md';
}

/**
 * Empty state: icon, title, description and actions, centered.
 *
 * It's a `div` without `role`. An empty state that shows up after a user action (for
 * example, a filter with no results) isn't announced on its own: use `announce()`.
 */
const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, size = 'md', ...props }, ref) => (
    <div
      ref={ref}
      // Only for the parts (group-data); the root is styled with cva.
      data-size={size}
      className={cn(emptyStateVariants({ size }), className)}
      {...props}
    />
  ),
);
EmptyState.displayName = 'EmptyState';

/**
 * Decorative icon: `aria-hidden` goes after the spread so it can't be undone. Sets
 * the SVG size from the container.
 *
 * With `size="sm"` the size adjustments win over `className` by specificity, not by
 * order: the variant selector (`.class:is(:where(.group/empty-state)[data-size=sm] *)`)
 * weighs (0,2,0) and a lone class (0,1,0). It's the cost of staying server-safe. To
 * change them in sm, use the same variant in `className` (for example,
 * `group-data-[size=sm]/empty-state:size-8`): twMerge sees it as a conflict and drops the
 * DS adjustment.
 */
const EmptyStateIcon = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'mb-2 flex size-12 items-center justify-center rounded-full bg-base-200 text-base-content/65 [&_svg]:size-6',
        'group-data-[size=sm]/empty-state:mb-1 group-data-[size=sm]/empty-state:size-10 group-data-[size=sm]/empty-state:[&_svg]:size-5',
        className,
      )}
      {...props}
      aria-hidden="true"
    />
  ),
);
EmptyStateIcon.displayName = 'EmptyStateIcon';

export interface EmptyStateTitleProps extends React.HTMLAttributes<
  HTMLParagraphElement | HTMLHeadingElement
> {
  /**
   * `p` by default: the component doesn't know its context, so it doesn't impose a heading
   * level. Pass `h2`–`h6` when the empty state fills a section or page.
   */
  as?: 'p' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

/**
 * Empty state title. Renders a `p` unless `as` sets a heading.
 *
 * With `size="sm"` the size adjustments win over `className` by specificity, not by
 * order: the variant selector (`.class:is(:where(.group/empty-state)[data-size=sm] *)`)
 * weighs (0,2,0) and a lone class (0,1,0). It's the cost of staying server-safe. To
 * change them in sm, use the same variant in `className` (for example,
 * `group-data-[size=sm]/empty-state:text-base`): twMerge sees it as a conflict and drops the
 * DS adjustment.
 */
const EmptyStateTitle = React.forwardRef<
  HTMLParagraphElement | HTMLHeadingElement,
  EmptyStateTitleProps
>(({ className, as: Component = 'p', ...props }, ref) => (
  <Component
    ref={ref}
    className={cn(
      'max-w-md text-lg font-semibold text-base-content',
      'group-data-[size=sm]/empty-state:max-w-xs group-data-[size=sm]/empty-state:text-sm',
      className,
    )}
    {...props}
  />
));
EmptyStateTitle.displayName = 'EmptyStateTitle';

/**
 * Secondary text of the empty state.
 *
 * With `size="sm"` the size adjustments win over `className` by specificity, not by
 * order: the variant selector (`.class:is(:where(.group/empty-state)[data-size=sm] *)`)
 * weighs (0,2,0) and a lone class (0,1,0). It's the cost of staying server-safe. To
 * change them in sm, use the same variant in `className` (for example,
 * `group-data-[size=sm]/empty-state:max-w-sm`): twMerge sees it as a conflict and drops the
 * DS adjustment.
 */
const EmptyStateDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      'max-w-md text-sm text-base-content/65 group-data-[size=sm]/empty-state:max-w-xs',
      className,
    )}
    {...props}
  />
));
EmptyStateDescription.displayName = 'EmptyStateDescription';

/**
 * Buttons or links of the empty state, centered.
 *
 * With `size="sm"` the size adjustments win over `className` by specificity, not by
 * order: the variant selector (`.class:is(:where(.group/empty-state)[data-size=sm] *)`)
 * weighs (0,2,0) and a lone class (0,1,0). It's the cost of staying server-safe. To
 * change them in sm, use the same variant in `className` (for example,
 * `group-data-[size=sm]/empty-state:mt-3`): twMerge sees it as a conflict and drops the
 * DS adjustment.
 */
const EmptyStateActions = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'mt-4 flex flex-wrap items-center justify-center gap-2 group-data-[size=sm]/empty-state:mt-2',
        className,
      )}
      {...props}
    />
  ),
);
EmptyStateActions.displayName = 'EmptyStateActions';

export { EmptyState, EmptyStateIcon, EmptyStateTitle, EmptyStateDescription, EmptyStateActions };
