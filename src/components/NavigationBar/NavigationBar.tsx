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
// The badge sits on the icon's span, so a badge requires the icon key. Its type stays ReactNode,
// as before: narrowing it would break a consumer passing a ReactNode variable.
type NavigationBarItemBadgeProps =
  | {
      badge?: undefined;
      badgeLabel?: (count: number) => string;
      /**
       * Decorative: the visible text names the item. Optional: without it the item is text only,
       * with no space reserved. In the 'bottom' form the active indicator is the pill behind the
       * icon; without an icon it's an underline under the text. Required with `badge`.
       */
      icon?: React.ReactNode;
    }
  | {
      badge: number;
      badgeLabel: (count: number) => string;
      /** Required with `badge`: the badge is placed on the icon. */
      icon: React.ReactNode;
    };

export type NavigationBarItemProps = React.AnchorHTMLAttributes<HTMLAnchorElement> &
  NavigationBarItemBadgeProps & {
    /** Merges the item's props, icon and badge into the single child, e.g. a router's Link. */
    asChild?: boolean;
    /**
     * Current section: sets `aria-current="page"` and shows an indicator that doesn't depend on
     * color alone (the pill, the border or, without an icon in the 'bottom' form, the underline).
     */
    active?: boolean;
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
    // `icon={cond && <X />}` with cond false renders nothing: it counts as no icon.
    const withIcon = icon != null && typeof icon !== 'boolean';

    return (
      // The variant comes from the parent's data attributes (see navigationBarVariants.ts), not
      // from Context: Context would make the item a client component.
      <li className={navigationBarItemClass}>
        <Comp
          ref={ref}
          aria-current={active ? 'page' : undefined}
          // One call for both branches (Slot and <a>); withIcon is local, never spread to the DOM.
          className={cn(navigationBarLinkVariants({ active, withIcon }), className)}
          {...props}
        >
          {withIcon && (
            <span aria-hidden className={navigationBarIconVariants({ active })}>
              {icon}
              {showBadge && <span className={navigationBarBadgeClass}>{badge}</span>}
            </span>
          )}
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
