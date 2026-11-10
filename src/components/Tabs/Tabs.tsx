'use client';

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '../../utils/cn';

/**
 * Changes which content panel is shown. To change a value (a view, a filter), use
 * `ToggleGroup`.
 *
 * By default (`activationMode="automatic"`), moving focus with the arrows also shows the
 * panel. `activationMode="manual"` is better when showing a panel is expensive (it loads data or
 * renders a lot): the arrows only move focus and Space or Enter show the panel.
 */
const Tabs = TabsPrimitive.Root;

// -----------------------------------------------------------------------------
// List: segment/pill; bg-base-200 holding the triggers, same radius
// token as DropdownMenuContent (rounded-box). Meant for small groups (2-5
// options), not for a long row of dashboard tabs. Even so, 5 text tabs don't fit in a phone: it
// scrolls sideways, with no visible scrollbar.
// -----------------------------------------------------------------------------

// The list's p-1: exactly what the focus ring needs (ring-2 + ring-offset-2), and what keeps it
// from being clipped by the overflow. scroll-px-1 does the same when the browser scrolls on focus.
const TRIGGER_INSET = 4;

// Scrolls only the list. scrollIntoView, even with 'nearest', also scrolls the page when the list
// is off screen, as with a controlled value that changes from elsewhere.
function revealTrigger(list: HTMLElement, trigger: Element) {
  const listRect = list.getBoundingClientRect();
  const triggerRect = trigger.getBoundingClientRect();
  if (triggerRect.left - TRIGGER_INSET < listRect.left) {
    list.scrollLeft -= listRect.left - triggerRect.left + TRIGGER_INSET;
  } else if (triggerRect.right + TRIGGER_INSET > listRect.right) {
    list.scrollLeft += triggerRect.right + TRIGGER_INSET - listRect.right;
  }
}

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => {
  const listRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(ref, () => listRef.current as HTMLDivElement);

  // Radix doesn't expose the value outside its context, and Tabs can be controlled or not: the
  // data-state of the triggers is the only signal that covers every case.
  React.useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const revealActive = () => {
      const active = list.querySelector('[role="tab"][data-state="active"]');
      if (active) revealTrigger(list, active);
    };
    revealActive();
    const observer = new MutationObserver(revealActive);
    observer.observe(list, { subtree: true, attributes: true, attributeFilter: ['data-state'] });
    return () => observer.disconnect();
  }, []);

  return (
    <TabsPrimitive.List
      ref={listRef}
      className={cn(
        'inline-flex max-w-full items-center gap-1 overflow-x-auto overflow-y-hidden rounded-box bg-base-200 p-1 scroll-px-1',
        '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        className,
      )}
      {...props}
    />
  );
});
TabsList.displayName = TabsPrimitive.List.displayName;

// -----------------------------------------------------------------------------
// Trigger: the active state (data-state="active") uses bg-primary/text-primary-content,
// the same color criterion Chip applies to the "on" state (see chipVariants.ts:
// has-[[data-state=on]]:bg-primary). The has-* selector isn't needed here because
// data-state lives directly on the Trigger itself, not on a child.
// -----------------------------------------------------------------------------
const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-btn px-3 py-1.5 text-sm font-medium text-base-content/70 transition-colors',
      // Pressed looks like hover. Not on the active tab, where data-[state=active] wins the hover.
      'hover:text-base-content enabled:not-data-[state=active]:active:text-base-content',
      '[-webkit-tap-highlight-color:transparent]',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50',
      'data-[state=active]:bg-primary data-[state=active]:text-primary-content',
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

// -----------------------------------------------------------------------------
// Content: no Portal; unlike DropdownMenuContent/TooltipContent, a tab's
// content lives in the normal document flow.
// -----------------------------------------------------------------------------
const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
