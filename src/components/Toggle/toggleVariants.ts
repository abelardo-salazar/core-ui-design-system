import { cva, type VariantProps } from 'class-variance-authority';

// Grows from the center only as far as 44px, so a control that already measures more doesn't
// reach further than its own box: the fewer neighbors it can overlap, the better. Follows the
// silhouette with rounded-btn. Why sm extends here and Button sm doesn't: ARCHITECTURE.md
// § Objetivo táctil de 44px.
const SM_HIT_AREA =
  "relative after:content-[''] after:absolute after:left-1/2 after:top-1/2 after:size-full after:min-h-11 after:min-w-11 after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-btn";

// Same height scale as Button (32 / 44 / 48), so they line up in a row. Outline unpressed and
// primary pressed: same criterion as Chip for "this is active". The padding lives only in the
// compound variants, because iconOnly replaces it with a square width.
export const toggleVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-btn border font-medium transition-colors cursor-pointer select-none [-webkit-tap-highlight-color:transparent]',
    'border-base-content/20 bg-transparent text-base-content enabled:hover:bg-base-200 enabled:active:bg-base-200',
    'data-[state=on]:border-transparent data-[state=on]:bg-primary data-[state=on]:text-primary-content data-[state=on]:enabled:hover:bg-primary-focus data-[state=on]:enabled:active:bg-primary-focus',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
    '[&_svg]:size-4 [&_svg]:shrink-0',
  ],
  {
    variants: {
      size: {
        sm: ['h-8 text-xs', SM_HIT_AREA],
        md: 'h-11 text-sm',
        lg: 'h-12 text-base',
      },
      iconOnly: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      { size: 'sm', iconOnly: false, className: 'px-3' },
      { size: 'md', iconOnly: false, className: 'px-4' },
      { size: 'lg', iconOnly: false, className: 'px-6' },
      { size: 'sm', iconOnly: true, className: 'w-8' },
      { size: 'md', iconOnly: true, className: 'w-11' },
      { size: 'lg', iconOnly: true, className: 'w-12' },
    ],
    defaultVariants: {
      size: 'md',
      iconOnly: false,
    },
  },
);

export type ToggleSize = NonNullable<VariantProps<typeof toggleVariants>['size']>;
