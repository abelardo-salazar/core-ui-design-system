import { cva } from 'class-variance-authority';

// The "on" state (Toggle pressed) always wins over the base color variant; same criterion
// the rest of the DS uses for "this is active" (see data-[state=checked] in
// Switch/Checkbox). It's applied on the root via has-[[data-state=on]] because data-state
// lives on the Toggle (child), not on the container.
// The root has NO horizontal/vertical padding of its own: the body (span/Toggle) and the
// close button have it, in Chip.tsx, because they are the ones that need their real hit box
// to fill the pill (see the comment in Chip.tsx). items-stretch (instead of items-center) is
// what lets those children stretch to the full height of the row.
export const chipVariants = cva(
  'inline-flex items-stretch gap-1 rounded-full border font-semibold transition-colors has-[[data-state=on]]:border-transparent has-[[data-state=on]]:bg-primary has-[[data-state=on]]:text-primary-content',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-content',
        secondary: 'border-transparent bg-secondary text-secondary-content',
        outline: 'text-base-content border-base-content/20',
        ghost: 'border-transparent bg-base-200 text-base-content',
      },
      // sm doesn't set a height: same as the historical behavior (before this scale), the height
      // is set by the content/the close button. md/lg do set it because lg is the touch size
      // (44px) and needs to be predictable regardless of the content.
      size: {
        sm: 'text-xs',
        md: 'text-sm h-8',
        lg: 'text-base h-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'sm',
    },
  },
);
