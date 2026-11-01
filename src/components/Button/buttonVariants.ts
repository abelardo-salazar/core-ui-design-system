import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  // rounded-btn does NOT live here: only in shape.default (see below), for the same reason as
  // the Badge.size bug: if the base and a variant apply the same group of utilities (here,
  // border-radius) at once, which one "wins" depends on the order in which Tailwind emits the
  // rules in the stylesheet, not on which variant cva was called with. shape ALWAYS resolves to
  // 'default' or 'pill' (never absent: defaultVariants guarantees it), so the base needs no
  // fallback.
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 aria-disabled:opacity-50  [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-content hover:bg-primary-focus shadow-sm',
        secondary: 'bg-secondary text-secondary-content hover:bg-secondary-focus shadow-sm',
        outline:
          'border border-base-300 bg-transparent text-base-content hover:bg-base-200 shadow-sm',
        ghost: 'hover:bg-base-200 text-base-content hover:text-base-content',
        link: 'text-primary underline-offset-4 hover:underline decoration-primary',
        // hover:text-error-focus-content is needed: --error is light and --error-focus is
        // dark (the opposite of the other variants), so text-error-content (black)
        // only gives enough contrast in the base state, not on hover. See tailwind.css.
        destructive:
          'bg-error text-error-content hover:bg-error-focus hover:text-error-focus-content shadow-sm',
      },
      // md = 44px: lines up with Input md and the Select trigger (same family of form
      // controls, see inputVariants.ts/Select.tsx). Before, all three measured 40px, but a
      // field+button row with size="icon" (already 44px since the touch target fix) was
      // 4px off against Button md itself. sm (32px) and lg (48px) don't change: the
      // scale is 32 / 44 / 48; lg differs from md by padding and text size, not
      // just by 4px of height.
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-11 px-4 py-2',
        lg: 'h-12 px-8 text-base',
        // 44x44 (Apple HIG) instead of the previous h-10 w-10 (40x40); the icon itself doesn't
        // change size because [&_svg]:size-4 in the base class already sets it regardless of size.
        icon: 'h-11 w-11',
      },
      fullWidth: {
        true: 'w-full',
      },
      // With size="icon", pill gives a circle (border-radius: 9999px on a 44x44 square
      // box); the focus ring follows the element's shape without changes of its own,
      // because it uses the same border-radius through the box the box-shadow is applied to.
      shape: {
        default: 'rounded-btn',
        pill: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
      shape: 'default',
    },
  },
);
