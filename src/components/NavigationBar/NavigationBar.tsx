import * as React from 'react';
import { Slot, Slottable } from '@radix-ui/react-slot';
import { cn } from '../../utils/cn';
import {
  navigationBarBadgeClass,
  navigationBarIconVariants,
  navigationBarItemClass,
  navigationBarLinkVariants,
  navigationBarListVariants,
  navigationBarVariants,
  type NavigationBarBreakpoint,
} from './navigationBarVariants';

// Union discriminated by `variant`: `bottomBelow` only exists for horizontal/vertical. The first
// branch accepts every variant so that `variant={dynamic}` without `bottomBelow` compiles.
export type NavigationBarVariantProps =
  | {
      /**
       * `'bottom'`: bottom bar, icon over text. `'horizontal'`: a row with icon beside text,
       * 44px high; scrolls sideways if it doesn't fit. `'vertical'`: a full-width column.
       * @default 'bottom'
       */
      variant?: 'bottom' | 'horizontal' | 'vertical';
      bottomBelow?: never;
    }
  | {
      variant: 'horizontal' | 'vertical';
      /** Uses the `'bottom'` form below this breakpoint (640 / 768 / 1024px). */
      bottomBelow?: NavigationBarBreakpoint;
    };

export type NavigationBarProps = React.HTMLAttributes<HTMLElement> &
  NavigationBarVariantProps & {
    /** Accessible name of the landmark: a page can have several `<nav>`. */
    'aria-label': string;
  };

// Not positioned on purpose: where the bar goes (fixed, sticky, in a grid) belongs to the
// consumer's layout. The safe-area padding does live here: it's the same for all of them.
// 'bottom' renders no data attributes: its DOM is the same as before the variants existed.
const NavigationBar = React.forwardRef<HTMLElement, NavigationBarProps>(
  ({ className, children, variant = 'bottom', bottomBelow, ...props }, ref) => {
    const below = variant === 'bottom' ? undefined : bottomBelow;
    return (
      <nav
        ref={ref}
        data-variant={variant === 'bottom' ? undefined : variant}
        data-bottom-below={below}
        className={cn(navigationBarVariants({ variant, bottomBelow: below }), className)}
        {...props}
      >
        <ul className={navigationBarListVariants({ variant, bottomBelow: below })}>{children}</ul>
      </nav>
    );
  },
);
NavigationBar.displayName = 'NavigationBar';

// Without a badge, badgeLabel is allowed so that `badge={count}` compiles when count is
// `number | undefined`, with no conditional spread in the consumer.
type NavigationBarItemBadgeProps =
  | { badge?: undefined; badgeLabel?: (count: number) => string }
  | { badge: number; badgeLabel: (count: number) => string };

export type NavigationBarItemProps = React.AnchorHTMLAttributes<HTMLAnchorElement> &
  NavigationBarItemBadgeProps & {
    /** Merges the item's props, icon and badge into the single child, e.g. a router's Link. */
    asChild?: boolean;
    /** Current section: sets `aria-current="page"` and shows the pill behind the icon. */
    active?: boolean;
    /** Decorative: the visible text names the item. Required because the pill sits behind it. */
    icon: React.ReactNode;
  };

// Slottable with no hooks of its own keeps this server-safe. Slot itself only calls useCallback
// (through useComposedRefs), which React also provides in the react-server environment.
const NavigationBarItem = React.forwardRef<HTMLAnchorElement, NavigationBarItemProps>(
  (
    { className, asChild = false, active = false, icon, badge, badgeLabel, children, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'a';
    const showBadge = badge !== undefined && badge > 0;

    return (
      // The variant comes from the parent's data attributes (see navigationBarVariants.ts), not
      // from Context: Context would make the item a client component.
      <li className={navigationBarItemClass}>
        <Comp
          ref={ref}
          aria-current={active ? 'page' : undefined}
          className={cn(navigationBarLinkVariants({ active }), className)}
          {...props}
        >
          <span aria-hidden className={navigationBarIconVariants({ active })}>
            {icon}
            {showBadge && <span className={navigationBarBadgeClass}>{badge}</span>}
          </span>
          <Slottable>{children}</Slottable>
          {/* A separate text node: a space inside the span is trimmed when computing the
              accessible name, which would read "Messages3 unread". */}
          {showBadge && (
            <>
              {' '}
              <span className="sr-only">{badgeLabel?.(badge)}</span>
            </>
          )}
        </Comp>
      </li>
    );
  },
);
NavigationBarItem.displayName = 'NavigationBarItem';

export { NavigationBar, NavigationBarItem };
