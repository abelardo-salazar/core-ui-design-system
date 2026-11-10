import { cva, type VariantProps } from 'class-variance-authority';

// Breakpoint maps are static on purpose: Tailwind only generates classes that appear literally
// in the source, so `max-${bp}:` built at runtime would produce nothing.

export const navigationBarVariants = cva('bg-base-100', {
  variants: {
    variant: {
      bottom: 'border-t border-base-300 pb-[env(safe-area-inset-bottom)]',
      // The group and the data-variant attribute (set in the component) let NavigationBarItem
      // style itself for the variant without Context, which would make it a client component.
      horizontal: 'group/navigation-bar border-b border-base-300',
      vertical: 'group/navigation-bar border-e border-base-300',
    },
    // Back to the 'bottom' form below the breakpoint. Only with horizontal/vertical (types).
    bottomBelow: {
      sm: 'max-sm:border-0 max-sm:border-t max-sm:pb-[env(safe-area-inset-bottom)]',
      md: 'max-md:border-0 max-md:border-t max-md:pb-[env(safe-area-inset-bottom)]',
      lg: 'max-lg:border-0 max-lg:border-t max-lg:pb-[env(safe-area-inset-bottom)]',
    },
  },
  defaultVariants: { variant: 'bottom' },
});

export const navigationBarListVariants = cva('flex', {
  variants: {
    variant: {
      bottom: '',
      // Native scroll without a visible bar; focusing an item out of view scrolls it in.
      horizontal: 'overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
      vertical: 'flex-col',
    },
    bottomBelow: {
      sm: 'max-sm:flex-row max-sm:overflow-visible',
      md: 'max-md:flex-row max-md:overflow-visible',
      lg: 'max-lg:flex-row max-lg:overflow-visible',
    },
  },
  defaultVariants: { variant: 'bottom' },
});

export type NavigationBarVariant = NonNullable<
  VariantProps<typeof navigationBarVariants>['variant']
>;
export type NavigationBarBreakpoint = NonNullable<
  VariantProps<typeof navigationBarVariants>['bottomBelow']
>;

// --- NavigationBarItem ---------------------------------------------------------------------
// The item doesn't receive the variant: its base classes are the 'bottom' form, and the other
// forms hang from the parent's group (`group-data-[variant=...]`), inert in 'bottom' because
// that <nav> has no group. `group-data-[variant]` alone matches horizontal and vertical.
// The bottomBelow restores carry the same specificity as the variant classes and come later
// (Tailwind emits media variants after), so they win below the breakpoint. All three sit on
// every item; only the one matching the parent's data-bottom-below applies.

export const navigationBarItemClass = [
  'min-w-0 flex-1',
  'group-data-[variant]/navigation-bar:flex-none',
  'group-data-[bottom-below=sm]/navigation-bar:max-sm:flex-1',
  'group-data-[bottom-below=md]/navigation-bar:max-md:flex-1',
  'group-data-[bottom-below=lg]/navigation-bar:max-lg:flex-1',
].join(' ');

// Restores, per breakpoint, every link property that horizontal/vertical change.
const linkBottomBelow = {
  sm: 'group-data-[bottom-below=sm]/navigation-bar:max-sm:h-auto group-data-[bottom-below=sm]/navigation-bar:max-sm:min-h-14 group-data-[bottom-below=sm]/navigation-bar:max-sm:flex-col group-data-[bottom-below=sm]/navigation-bar:max-sm:justify-center group-data-[bottom-below=sm]/navigation-bar:max-sm:gap-1 group-data-[bottom-below=sm]/navigation-bar:max-sm:border-0 group-data-[bottom-below=sm]/navigation-bar:max-sm:px-0.5 group-data-[bottom-below=sm]/navigation-bar:max-sm:py-1.5 group-data-[bottom-below=sm]/navigation-bar:max-sm:text-center group-data-[bottom-below=sm]/navigation-bar:max-sm:text-xs group-data-[bottom-below=sm]/navigation-bar:max-sm:whitespace-normal group-data-[bottom-below=sm]/navigation-bar:max-sm:[overflow-wrap:anywhere] group-data-[bottom-below=sm]/navigation-bar:max-sm:aria-[current=page]:[scroll-initial-target:none]',
  md: 'group-data-[bottom-below=md]/navigation-bar:max-md:h-auto group-data-[bottom-below=md]/navigation-bar:max-md:min-h-14 group-data-[bottom-below=md]/navigation-bar:max-md:flex-col group-data-[bottom-below=md]/navigation-bar:max-md:justify-center group-data-[bottom-below=md]/navigation-bar:max-md:gap-1 group-data-[bottom-below=md]/navigation-bar:max-md:border-0 group-data-[bottom-below=md]/navigation-bar:max-md:px-0.5 group-data-[bottom-below=md]/navigation-bar:max-md:py-1.5 group-data-[bottom-below=md]/navigation-bar:max-md:text-center group-data-[bottom-below=md]/navigation-bar:max-md:text-xs group-data-[bottom-below=md]/navigation-bar:max-md:whitespace-normal group-data-[bottom-below=md]/navigation-bar:max-md:[overflow-wrap:anywhere] group-data-[bottom-below=md]/navigation-bar:max-md:aria-[current=page]:[scroll-initial-target:none]',
  lg: 'group-data-[bottom-below=lg]/navigation-bar:max-lg:h-auto group-data-[bottom-below=lg]/navigation-bar:max-lg:min-h-14 group-data-[bottom-below=lg]/navigation-bar:max-lg:flex-col group-data-[bottom-below=lg]/navigation-bar:max-lg:justify-center group-data-[bottom-below=lg]/navigation-bar:max-lg:gap-1 group-data-[bottom-below=lg]/navigation-bar:max-lg:border-0 group-data-[bottom-below=lg]/navigation-bar:max-lg:px-0.5 group-data-[bottom-below=lg]/navigation-bar:max-lg:py-1.5 group-data-[bottom-below=lg]/navigation-bar:max-lg:text-center group-data-[bottom-below=lg]/navigation-bar:max-lg:text-xs group-data-[bottom-below=lg]/navigation-bar:max-lg:whitespace-normal group-data-[bottom-below=lg]/navigation-bar:max-lg:[overflow-wrap:anywhere] group-data-[bottom-below=lg]/navigation-bar:max-lg:aria-[current=page]:[scroll-initial-target:none]',
};

export const navigationBarLinkVariants = cva(
  [
    // No -webkit-touch-callout: it would remove the link's open-in-new-tab menu (ARCHITECTURE).
    'select-none [-webkit-tap-highlight-color:transparent]',
    // 'bottom' form: icon over text, at least 56px.
    'flex min-h-14 w-full flex-col items-center justify-center gap-1 px-0.5 py-1.5 text-center text-xs leading-tight [overflow-wrap:anywhere]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary',
    // horizontal and vertical: icon beside text, at least 44px.
    'group-data-[variant]/navigation-bar:min-h-11 group-data-[variant]/navigation-bar:flex-row group-data-[variant]/navigation-bar:gap-3 group-data-[variant]/navigation-bar:px-3 group-data-[variant]/navigation-bar:text-sm',
    // horizontal: one line, exactly 44px; the list scrolls if the items don't fit.
    'group-data-[variant=horizontal]/navigation-bar:h-11 group-data-[variant=horizontal]/navigation-bar:py-0 group-data-[variant=horizontal]/navigation-bar:whitespace-nowrap group-data-[variant=horizontal]/navigation-bar:[overflow-wrap:normal]',
    // horizontal: the scrolling row starts showing the current item. CSS only, so the item stays
    // server-safe; browsers without scroll-initial-target ignore it. It acts on the container's
    // first render only, not when the current item changes with the nav already mounted.
    'group-data-[variant=horizontal]/navigation-bar:aria-[current=page]:[scroll-initial-target:nearest]',
    // vertical: full width, text at the start, wraps instead of hiding.
    'group-data-[variant=vertical]/navigation-bar:justify-start group-data-[variant=vertical]/navigation-bar:py-2 group-data-[variant=vertical]/navigation-bar:text-start',
    linkBottomBelow.sm,
    linkBottomBelow.md,
    linkBottomBelow.lg,
  ],
  {
    variants: {
      active: {
        // A real border, not a shadow or a pseudo-element background: it's what survives in
        // forced-colors mode. The inactive items have no border (a transparent one would show
        // there too). In vertical, ps-2.5 + the 2px border keep the text where ps-3 puts it.
        true: 'font-medium text-base-content group-data-[variant=horizontal]/navigation-bar:border-b-2 group-data-[variant=horizontal]/navigation-bar:border-primary group-data-[variant=vertical]/navigation-bar:border-s-2 group-data-[variant=vertical]/navigation-bar:border-primary group-data-[variant=vertical]/navigation-bar:ps-2.5',
        false:
          // active: without pointer-fine: on touch, pressing gives the feedback hover gives with a mouse.
          'text-base-content/70 pointer-fine:hover:bg-base-200 pointer-fine:hover:text-base-content active:bg-base-200 active:text-base-content',
      },
    },
    defaultVariants: { active: false },
  },
);

export const navigationBarIconVariants = cva(
  [
    'relative flex h-8 w-14 items-center justify-center rounded-full [&_svg]:size-5',
    'group-data-[variant]/navigation-bar:size-5',
    'group-data-[bottom-below=sm]/navigation-bar:max-sm:h-8 group-data-[bottom-below=sm]/navigation-bar:max-sm:w-14',
    'group-data-[bottom-below=md]/navigation-bar:max-md:h-8 group-data-[bottom-below=md]/navigation-bar:max-md:w-14',
    'group-data-[bottom-below=lg]/navigation-bar:max-lg:h-8 group-data-[bottom-below=lg]/navigation-bar:max-lg:w-14',
  ],
  {
    variants: {
      active: {
        // The pill only exists in the 'bottom' form. Its transparent border shows up in
        // forced-colors mode, which removes backgrounds: the indicator must not depend on color.
        true: [
          'border border-transparent bg-primary text-primary-content',
          'group-data-[variant]/navigation-bar:border-0 group-data-[variant]/navigation-bar:bg-transparent group-data-[variant]/navigation-bar:text-current',
          'group-data-[bottom-below=sm]/navigation-bar:max-sm:border group-data-[bottom-below=sm]/navigation-bar:max-sm:bg-primary group-data-[bottom-below=sm]/navigation-bar:max-sm:text-primary-content',
          'group-data-[bottom-below=md]/navigation-bar:max-md:border group-data-[bottom-below=md]/navigation-bar:max-md:bg-primary group-data-[bottom-below=md]/navigation-bar:max-md:text-primary-content',
          'group-data-[bottom-below=lg]/navigation-bar:max-lg:border group-data-[bottom-below=lg]/navigation-bar:max-lg:bg-primary group-data-[bottom-below=lg]/navigation-bar:max-lg:text-primary-content',
        ],
        false: '',
      },
    },
    defaultVariants: { active: false },
  },
);

export const navigationBarBadgeClass = [
  'absolute -top-1 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[0.625rem] font-semibold leading-none text-error-content ring-2 ring-base-100',
  // Beside the 20px icon instead of over the pill.
  'group-data-[variant]/navigation-bar:-top-1.5 group-data-[variant]/navigation-bar:-right-1.5',
  'group-data-[bottom-below=sm]/navigation-bar:max-sm:-top-1 group-data-[bottom-below=sm]/navigation-bar:max-sm:right-1.5',
  'group-data-[bottom-below=md]/navigation-bar:max-md:-top-1 group-data-[bottom-below=md]/navigation-bar:max-md:right-1.5',
  'group-data-[bottom-below=lg]/navigation-bar:max-lg:-top-1 group-data-[bottom-below=lg]/navigation-bar:max-lg:right-1.5',
].join(' ');
