import * as React from 'react';
import { Slot, Slottable } from '@radix-ui/react-slot';
import { cn } from '../../utils/cn';

export interface NavigationBarProps extends React.HTMLAttributes<HTMLElement> {
  /** Accessible name of the landmark: a page can have several `<nav>`. */
  'aria-label': string;
}

// Not positioned on purpose: where the bar goes (fixed, sticky, in a grid) belongs to the
// consumer's layout. The safe-area padding does live here: it's the same for all of them.
const NavigationBar = React.forwardRef<HTMLElement, NavigationBarProps>(
  ({ className, children, ...props }, ref) => (
    <nav
      ref={ref}
      className={cn(
        'border-t border-base-300 bg-base-100 pb-[env(safe-area-inset-bottom)]',
        className,
      )}
      {...props}
    >
      <ul className="flex">{children}</ul>
    </nav>
  ),
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
      <li className="min-w-0 flex-1">
        <Comp
          ref={ref}
          aria-current={active ? 'page' : undefined}
          className={cn(
            'flex min-h-14 w-full flex-col items-center justify-center gap-1 px-0.5 py-1.5 text-center text-xs leading-tight [overflow-wrap:anywhere]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary',
            active
              ? 'font-medium text-base-content'
              : 'text-base-content/70 pointer-fine:hover:bg-base-200 pointer-fine:hover:text-base-content',
            className,
          )}
          {...props}
        >
          <span
            aria-hidden
            className={cn(
              'relative flex h-8 w-14 items-center justify-center rounded-full [&_svg]:size-5',
              // The transparent border shows up in forced-colors mode, which removes backgrounds:
              // the indicator must not depend on color alone.
              active && 'border border-transparent bg-primary text-primary-content',
            )}
          >
            {icon}
            {showBadge && (
              <span className="absolute -top-1 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[0.625rem] font-semibold leading-none text-error-content ring-2 ring-base-100">
                {badge}
              </span>
            )}
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
