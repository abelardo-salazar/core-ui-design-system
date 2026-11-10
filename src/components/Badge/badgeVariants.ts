import { cva } from 'class-variance-authority';

// The base has NO padding/height/text of its own: they live only in `size` (see below). If the
// base had its own px/py/text-* besides `size`, both sets of classes would coexist in the
// final className; which one "wins" depends on the order in which Tailwind emits the rules in
// the stylesheet, not on the order in the string, so it's an ambiguous tie instead of a
// real override. That's exactly what made the historical `size` bug (it never reached
// cva from Badge.tsx) invisible: the base alone already gave a plausible result.
export const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full border text-center font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-content',
        secondary: 'border-transparent bg-secondary text-secondary-content',
        // hover:text-error-focus-content is needed: --error is light and --error-focus is
        // dark (the opposite of the other variants), so text-error-content (black)
        // only gives enough contrast in the base state, not on hover. See tailwind.css. The
        // hover itself lives in compoundVariants (it only applies if interactive=true).
        destructive: 'border-transparent bg-error text-error-content',
        outline: 'text-base-content border-base-content/20',
        ghost: 'border-transparent bg-base-200 text-base-content',
      },

      // Badge's own scale (not Button's): compact, for a status label, not
      // a control. No fixed h-* (except icon): the height comes from border + vertical padding +
      // the line-height of the text-* itself, so there's never an h-* fighting the text if the
      // consumer changes className. Real heights measured in the browser (Storybook, see the PR):
      // sm ≈ 22px, md ≈ 26px, lg ≈ 30px, icon = exactly 24px (size-6).
      size: {
        sm: 'px-2.5 py-0.5 text-xs',
        md: 'px-3 py-1 text-xs',
        lg: 'px-3.5 py-1 text-sm',
        // Square, no horizontal padding: for a badge that's just an icon or a short number
        // (e.g. a counter), not a text label.
        icon: 'size-6',
      },

      // false (default): Badge is a <div>, without any interaction style; hover/focus on
      // a non-interactive <div> is dead CSS (:focus-visible never fires because a <div>
      // without tabIndex isn't focusable) and it also visually misleads whoever adds
      // onClick by hand. true: Badge is a real <button> (see Badge.tsx) and these classes DO
      // make sense. focus-visible (not focus:) is the convention in the rest of the DS.
      interactive: {
        true: 'select-none [-webkit-tap-highlight-color:transparent] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      },
    },

    // The hover depends on variant AND interactive at once (it makes no sense as part of
    // `variant` alone, because a non-interactive Badge must not show a hover). outline had no
    // hover before: an interactive element without visual feedback makes no sense, so it gets
    // one here (it wasn't defined for the non-interactive div, it was never noticed).
    compoundVariants: [
      {
        variant: 'default',
        interactive: true,
        class: 'hover:bg-primary-focus enabled:active:bg-primary-focus',
      },
      {
        variant: 'secondary',
        interactive: true,
        class: 'hover:bg-secondary-focus enabled:active:bg-secondary-focus',
      },
      {
        variant: 'destructive',
        interactive: true,
        class:
          'hover:bg-error-focus hover:text-error-focus-content enabled:active:bg-error-focus enabled:active:text-error-focus-content',
      },
      {
        variant: 'outline',
        interactive: true,
        class: 'hover:bg-base-200 enabled:active:bg-base-200',
      },
      {
        variant: 'ghost',
        interactive: true,
        class: 'hover:bg-base-300 enabled:active:bg-base-300',
      },
    ],

    defaultVariants: {
      variant: 'default',
      size: 'sm',
      interactive: false,
    },
  },
);
