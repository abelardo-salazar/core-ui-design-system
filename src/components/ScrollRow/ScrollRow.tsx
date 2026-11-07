'use client';

import * as React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { cn } from '../../utils/cn';
import { buttonVariants } from '../Button/buttonVariants';

export type ScrollRowLabels = {
  /** Name of the button that scrolls back. */
  previous: string;
  /** Name of the button that scrolls forward. */
  next: string;
};

const DEFAULT_LABELS: ScrollRowLabels = { previous: 'Previous items', next: 'Next items' };

export type ScrollRowProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'aria-label' | 'aria-labelledby' | 'role'
> & {
  /** Name of the region: required, a row of items needs to say what it holds. */
  'aria-label': string;
  // Never: JSX doesn't check excess hyphenated attributes, and the region is named by aria-label.
  'aria-labelledby'?: never;
  /** Previous/next buttons, only with a fine pointer (a touch screen swipes). @default false */
  controls?: boolean;
  /** Texts of the buttons, merged with the defaults in English. */
  labels?: Partial<ScrollRowLabels>;
};

type Control = 'previous' | 'next';

// One pixel of slack: scroll positions are fractional on zoomed or high-density screens.
const EDGE_SLACK = 1;

/**
 * Horizontal row that scrolls sideways with snap points: a named region with a list whose children
 * are `ScrollRowItem`s. The scrollbar is hidden with a coarse pointer. The `ref` goes to the region.
 */
const ScrollRow = React.forwardRef<HTMLDivElement, ScrollRowProps>(
  ({ className, controls = false, labels: labelsProp, children, ...props }, ref) => {
    const labels = { ...DEFAULT_LABELS, ...labelsProp };
    const listRef = React.useRef<HTMLUListElement>(null);
    const regionRef = React.useRef<HTMLDivElement | null>(null);
    const previousRef = React.useRef<HTMLButtonElement>(null);
    const nextRef = React.useRef<HTMLButtonElement>(null);
    const [edges, setEdges] = React.useState({ previous: false, next: false });

    const setRefs = React.useCallback(
      (node: HTMLDivElement | null) => {
        regionRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    // Which button can scroll, from the list's scroll position. Updated on scroll, when the list
    // or an item changes size, and when items are added or removed.
    React.useEffect(() => {
      const list = listRef.current;
      if (!controls || !list) return;

      const update = () => {
        const previous = list.scrollLeft > EDGE_SLACK;
        const next = list.scrollLeft + list.clientWidth < list.scrollWidth - EDGE_SLACK;
        setEdges((current) =>
          current.previous === previous && current.next === next ? current : { previous, next },
        );
      };

      // Observing the items too: the list keeps its size when one grows, its scrollWidth doesn't.
      const resize = new ResizeObserver(update);
      const observeAll = () => {
        resize.disconnect();
        resize.observe(list);
        Array.from(list.children).forEach((item) => resize.observe(item));
      };
      const mutation = new MutationObserver(() => {
        observeAll();
        update();
      });

      observeAll();
      mutation.observe(list, { childList: true });
      list.addEventListener('scroll', update, { passive: true });
      return () => {
        resize.disconnect();
        mutation.disconnect();
        list.removeEventListener('scroll', update);
      };
    }, [controls]);

    // A button disappears at its end. If it had the focus, the focus goes to the other one, or to
    // the region if neither is left (the items now fit). Layout effect: no frame without focus.
    const focusedControl = React.useRef<Control | null>(null);
    React.useLayoutEffect(() => {
      const control = focusedControl.current;
      if (!control || edges[control]) return;
      focusedControl.current = null;
      const other = control === 'previous' ? nextRef.current : previousRef.current;
      (other ?? regionRef.current)?.focus();
    }, [edges]);

    const scroll = (direction: -1 | 1) => {
      const list = listRef.current;
      if (!list) return;
      const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      // One visible width; the snap points then align the first item.
      list.scrollBy({ left: direction * list.clientWidth, behavior: reduce ? 'auto' : 'smooth' });
    };

    const controlProps = (control: Control) => ({
      type: 'button' as const,
      ref: control === 'previous' ? previousRef : nextRef,
      'aria-label': labels[control],
      onFocus: () => {
        focusedControl.current = control;
      },
      // Only a real blur clears it: a button removed while focused may also fire blur, detached.
      onBlur: (event: React.FocusEvent<HTMLButtonElement>) => {
        if (event.currentTarget.isConnected) focusedControl.current = null;
      },
      onClick: () => scroll(control === 'previous' ? -1 : 1),
      className: cn(
        buttonVariants({ variant: 'outline', size: 'icon', shape: 'pill' }),
        // Only with a fine pointer: a touch screen swipes. bg-base-100 so the items don't show
        // through the button over them.
        'absolute top-1/2 z-10 hidden -translate-y-1/2 bg-base-100 pointer-fine:inline-flex',
        control === 'previous' ? 'left-1' : 'right-1',
      ),
    });

    return (
      <div
        ref={setRefs}
        role="region"
        // Focusable only by script, as the last place for the focus of a removed button.
        tabIndex={controls ? -1 : undefined}
        className={cn('relative min-w-0 focus:outline-none', className)}
        {...props}
      >
        {controls && edges.previous && (
          <button {...controlProps('previous')}>
            <ChevronLeftIcon aria-hidden="true" />
          </button>
        )}
        {/* p-1 and scroll-px-1, as in TabsList: room for the items' focus ring (ring-2 +
            ring-offset-2) so the overflow doesn't clip it, also when the browser scrolls on focus
            or snaps. */}
        <ul
          ref={listRef}
          className={cn(
            'flex snap-x snap-mandatory gap-3 overflow-x-auto overflow-y-hidden p-1 scroll-px-1',
            'pointer-coarse:[scrollbar-width:none] pointer-coarse:[&::-webkit-scrollbar]:hidden',
          )}
        >
          {children}
        </ul>
        {controls && edges.next && (
          <button {...controlProps('next')}>
            <ChevronRightIcon aria-hidden="true" />
          </button>
        )}
      </div>
    );
  },
);
ScrollRow.displayName = 'ScrollRow';

export type ScrollRowItemProps = React.LiHTMLAttributes<HTMLLIElement>;

/** An item of `ScrollRow`: keeps its width and is a snap point by its start. */
const ScrollRowItem = React.forwardRef<HTMLLIElement, ScrollRowItemProps>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn('shrink-0 snap-start', className)} {...props} />
  ),
);
ScrollRowItem.displayName = 'ScrollRowItem';

export { ScrollRow, ScrollRowItem };
