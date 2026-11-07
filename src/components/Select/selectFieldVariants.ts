import { cva, type VariantProps } from 'class-variance-authority';

// Classes SelectField adds on top of SelectTrigger, to look like Input. SelectTrigger has no size
// or error state of its own and its public API stays as is, so these override its base classes
// (h-11, px-3, text-sm, border-base-300, focus:ring-primary). The `!` makes that independent of
// tailwind-merge and of the order of the CSS, same as `pl-10!` in Input.
//
// The trigger's `placeholder:` utility doesn't apply: it's a <button>, and Radix marks the empty
// state with data-placeholder.
export const selectFieldTriggerVariants = cva('transition-colors', {
  variants: {
    // Same scale as Input. md is already SelectTrigger's own.
    size: {
      sm: 'h-8! px-2! text-xs!',
      md: '',
      lg: 'h-12! px-4! text-base!',
    },
    error: {
      false: 'focus-visible:border-primary data-[placeholder]:text-base-content/50',
      true: 'border-error! focus:ring-error! text-error-focus data-[placeholder]:text-error/50',
    },
  },
  defaultVariants: { size: 'md', error: false },
});

export type SelectFieldSize = NonNullable<VariantProps<typeof selectFieldTriggerVariants>['size']>;
