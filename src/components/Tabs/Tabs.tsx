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
// options), not for a long row of dashboard tabs.
// -----------------------------------------------------------------------------
const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn('inline-flex items-center gap-1 rounded-box bg-base-200 p-1', className)}
    {...props}
  />
));
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
      'hover:text-base-content',
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
