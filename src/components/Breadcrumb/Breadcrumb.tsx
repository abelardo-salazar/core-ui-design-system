import * as React from 'react';
import { Slot, Slottable } from '@radix-ui/react-slot';
import { ChevronRightIcon } from '@radix-ui/react-icons';
import { cn } from '../../utils/cn';

// Server-safe by construction: no hooks, no handlers of its own, no Context. Slot only calls
// useCallback (through useComposedRefs), which React also provides in the react-server
// environment (see NavigationBarItem).

export type BreadcrumbProps = React.HTMLAttributes<HTMLElement> & {
  /** Accessible name of the landmark, with no default: a page can have several `<nav>`. */
  'aria-label': string;
};

// The links inherit their resting color (text-base-content/70) from the list, so neither branch
// of the item repeats it. Rows wrap on purpose: no collapse to "…", no scroll, no state.
// gap-y-6 (24px) is exactly what the links' vertical hit area adds (12px above + 12px below), so
// two wrapped lines' areas touch without overlapping.
const listClass = 'flex flex-wrap items-center gap-y-6 text-sm text-base-content/70';

/** Breadcrumb trail: a `<nav>` with an ordered list of `BreadcrumbItem`. */
const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ className, children, ...props }, ref) => (
    // Not positioned and with no spacing of its own: that belongs to the consumer's layout.
    <nav ref={ref} className={className} {...props}>
      <ol className={listClass}>{children}</ol>
    </nav>
  ),
);
Breadcrumb.displayName = 'Breadcrumb';

type BreadcrumbLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  active?: false;
  /** Merges the item's props into the single child, e.g. a router's Link. */
  asChild?: boolean;
};

type BreadcrumbCurrentProps = React.HTMLAttributes<HTMLSpanElement> & {
  /** Current page: renders text (not a link) with `aria-current="page"`. */
  active: true;
  href?: never;
  asChild?: never;
};

export type BreadcrumbItemProps = BreadcrumbLinkProps | BreadcrumbCurrentProps;

// The separator sits at the start of each item, so it stays with the link it precedes: a wrapped
// line starts with "› Destino" and never ends with a dangling chevron. The item doesn't know its
// position (no Context): the first one's separator is hidden from the <li>'s group with
// :first-child. An SVG with aria-hidden outside the link, never CSS generated content, which
// some screen readers announce. It flips in RTL.
const itemClass = 'group/breadcrumb-item inline-flex min-w-0 items-center';
const separatorClass = 'mx-1.5 size-3.5 shrink-0 group-first/breadcrumb-item:hidden rtl:rotate-180';

const linkClass = [
  'relative min-w-0 rounded-sm [overflow-wrap:anywhere] underline-offset-4 transition-colors',
  // No -webkit-touch-callout: it would remove the link's open-in-new-tab menu (ARCHITECTURE).
  '[-webkit-tap-highlight-color:transparent]',
  // active: without pointer-fine: on touch, pressing gives the feedback hover gives with a mouse.
  'pointer-fine:hover:text-base-content pointer-fine:hover:underline active:text-base-content active:underline',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
  // 44px hit area in height only (20px line + 12px per side), without changing the look. Not in
  // width: it would overlap the neighbors on the same line. It overflows the <nav> by 12px above
  // and below (README).
  "after:absolute after:inset-x-0 after:-inset-y-3 after:content-['']",
].join(' ');

const currentClass = 'min-w-0 font-medium text-base-content [overflow-wrap:anywhere]';

const BreadcrumbItem = React.forwardRef<HTMLElement, BreadcrumbItemProps>((props, ref) => {
  const separator = <ChevronRightIcon aria-hidden className={separatorClass} />;

  if (props.active) {
    // active is taken out so it never reaches the DOM as an attribute.
    const { className, active, ...rest } = props;
    void active;
    return (
      <li className={itemClass}>
        {separator}
        <span
          ref={ref as React.Ref<HTMLSpanElement>}
          aria-current="page"
          className={cn(currentClass, className)}
          {...rest}
        />
      </li>
    );
  }

  const { className, active, asChild = false, children, ...rest } = props;
  void active;
  const Comp = asChild ? Slot : 'a';
  return (
    <li className={itemClass}>
      {separator}
      <Comp
        ref={ref as React.Ref<HTMLAnchorElement>}
        className={cn(linkClass, className)}
        {...rest}
      >
        <Slottable>{children}</Slottable>
      </Comp>
    </li>
  );
});
BreadcrumbItem.displayName = 'BreadcrumbItem';

export { Breadcrumb, BreadcrumbItem };
