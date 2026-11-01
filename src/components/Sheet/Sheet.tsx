'use client';

import * as React from 'react';
import * as SheetPrimitive from '@radix-ui/react-dialog';
import { Cross2Icon } from '@radix-ui/react-icons';
import { type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { sheetCloseVariants, sheetVariants } from './sheetVariants';

const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;
const SheetPortal = SheetPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      'fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className,
    )}
    {...props}
    ref={ref}
  />
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

export type SheetContentProps = React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content> &
  VariantProps<typeof sheetVariants> & {
    /** Accessible name of the ✕ button. @default 'Close' */
    closeLabel?: string;
  };

/**
 * Sheet panel: flex column with `gap-4` between children. Recommended structure:
 * `SheetHeader`, `SheetBody` and `SheetFooter`. The body scrolls and header/footer stay
 * fixed. Without `SheetBody`, the whole panel scrolls as a fallback, but the ✕ moves
 * with the content; the right way is to use `SheetBody`.
 *
 * `top` and `bottom` have a max height of 85dvh; `left` and `right`, the full height.
 *
 * The edges that touch the viewport respect the safe area (`env(safe-area-inset-*)`). It
 * only takes effect if the app declares `viewport-fit=cover` (in Next.js:
 * `export const viewport = { viewportFit: 'cover' }`).
 */
const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ side = 'right', className, children, closeLabel = 'Close', ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content ref={ref} className={cn(sheetVariants({ side }), className)} {...props}>
      {children}
      {/* 44x44 touch area (Apple HIG); position and ring in sheetCloseVariants. */}
      <SheetPrimitive.Close className={sheetCloseVariants({ side })}>
        <Cross2Icon className="h-4 w-4" />
        <span className="sr-only">{closeLabel}</span>
      </SheetPrimitive.Close>
    </SheetPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = SheetPrimitive.Content.displayName;

// The padding reserves the ✕'s space: 1.5rem (44px at 2px from the edge, minus the panel's
// 24px of padding) plus env(safe-area-inset-right), because the ✕ shifts by that inset and the
// panel doesn't always absorb it (with a notch in landscape the title ended up under it). It's
// applied on all four sides instead of reading a data-side from the Content: in `left` the right
// edge is inner and the inset is extra, but the header isn't coupled to the Content. Without an
// inset it resolves to the same 24px. On mobile the text is centered, so it's reserved on both
// sides so it isn't off-center.
const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex shrink-0 flex-col space-y-2 px-[calc(1.5rem_+_env(safe-area-inset-right))] text-center sm:pl-0 sm:text-left',
      className,
    )}
    {...props}
  />
);
SheetHeader.displayName = 'SheetHeader';

/**
 * Scrolling area of the Sheet; header and footer stay fixed because they're outside it. The
 * negative margins compensate for the panel padding so the overflow doesn't clip the
 * focus rings of controls at the edge (ring-2 + offset-2 = 4px vertically) and the
 * scrollbar sits against the panel edge.
 */
const SheetBody = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('-mx-6 -my-1 min-h-0 flex-1 overflow-y-auto px-6 py-1', className)}
    {...props}
  />
);
SheetBody.displayName = 'SheetBody';

const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex shrink-0 flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      className,
    )}
    {...props}
  />
);
SheetFooter.displayName = 'SheetFooter';

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold text-base-content', className)}
    {...props}
  />
));
SheetTitle.displayName = SheetPrimitive.Title.displayName;

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn('text-sm text-base-content', className)}
    {...props}
  />
));
SheetDescription.displayName = SheetPrimitive.Description.displayName;

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetBody,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
