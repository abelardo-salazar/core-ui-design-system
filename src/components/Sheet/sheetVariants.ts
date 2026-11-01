import { cva } from 'class-variance-authority';

// flex flex-col turns on the gap-4 between header, body and footer. overflow-y-auto is the
// fallback for those who don't use SheetBody (the ✕ moves with the content in that case).
// Safe area: each edge that touches the viewport uses max(1.5rem, env(safe-area-inset-*)); the
// inner edge keeps the base p-6. It only takes effect with viewportFit: 'cover'.
export const sheetVariants = cva(
  'fixed z-50 flex flex-col gap-4 overflow-y-auto bg-base-100 p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out',
  {
    variants: {
      side: {
        top: 'inset-x-0 top-0 max-h-[85dvh] border-b pt-[max(1.5rem,env(safe-area-inset-top))] pl-[max(1.5rem,env(safe-area-inset-left))] pr-[max(1.5rem,env(safe-area-inset-right))] data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
        bottom:
          'inset-x-0 bottom-0 max-h-[85dvh] border-t pb-[max(1.5rem,env(safe-area-inset-bottom))] pl-[max(1.5rem,env(safe-area-inset-left))] pr-[max(1.5rem,env(safe-area-inset-right))] data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
        left: 'inset-y-0 left-0 h-full w-3/4 border-r pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] pl-[max(1.5rem,env(safe-area-inset-left))] sm:max-w-sm data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
        right:
          'inset-y-0 right-0 h-full w-3/4 border-l pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] pr-[max(1.5rem,env(safe-area-inset-right))] sm:max-w-sm data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
      },
    },
    defaultVariants: {
      side: 'right',
    },
  },
);

// Position of the ✕. right-0.5/top-0.5 (2px) + the button's p-3.5 leave the icon 16px from the
// edge with a 44x44 touch area. On the edges that touch the viewport the full safe area is
// added, so the whole touch area stays outside the unsafe zone.
const closeTop = 'top-[calc(0.125rem_+_env(safe-area-inset-top))]';
const closeRight = 'right-[calc(0.125rem_+_env(safe-area-inset-right))]';

export const sheetCloseVariants = cva(
  // ring-inset without offset: the ring is drawn inside the touch area, so the panel's
  // overflow-y-auto doesn't clip it.
  'absolute rounded-sm p-3.5 opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary disabled:pointer-events-none data-[state=open]:bg-base-200 data-[state=open]:text-base-content/50',
  {
    variants: {
      side: {
        top: `${closeTop} ${closeRight}`,
        bottom: `top-0.5 ${closeRight}`,
        left: `${closeTop} right-0.5`,
        right: `${closeTop} ${closeRight}`,
      },
    },
    defaultVariants: {
      side: 'right',
    },
  },
);
