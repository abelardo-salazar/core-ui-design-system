import { cva, type VariantProps } from 'class-variance-authority';

// Same height scale as Button (32 / 44 / 48) so a ToggleGroup and a Button of the same
// size line up in a row: the group container has no vertical padding, so
// the group measures the same as its items.
export const toggleGroupItemVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-btn font-medium text-base-content/70 transition-colors cursor-pointer select-none',
    // Pressed looks like hover. Not on the pressed item, where data-[state=on] wins the hover.
    'hover:text-base-content enabled:not-data-[state=on]:active:text-base-content',
    '[-webkit-tap-highlight-color:transparent]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    // Same active state as TabsTrigger.
    'data-[state=on]:bg-primary data-[state=on]:text-primary-content',
    '[&_svg]:size-4 [&_svg]:shrink-0',
  ],
  {
    variants: {
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-11 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

export type ToggleGroupSize = NonNullable<VariantProps<typeof toggleGroupItemVariants>['size']>;
