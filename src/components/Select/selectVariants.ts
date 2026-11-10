import { cva, type VariantProps } from 'class-variance-authority';

// SelectTrigger. Same height scale as Input and Button, so they align in one row: sm 32px
// (compact, below the 44px touch target), md 44px, lg 48px. Height and padding live only in
// `size`; sm has no vertical padding, as in Input, so its content fits the 24px line. Text is 16px in every size, like Input: a <button> doesn't trigger iOS's focus zoom,
// but the form's fields must look alike.
//
// Error state from aria-invalid, in CSS: each aria-[invalid=true]: class carries one more
// attribute than the class it replaces (border-base-300, focus:ring-primary, and the
// data-[placeholder] color SelectField adds), so it wins by specificity, with no `!` and no
// dependence on the order of the CSS. Inert without aria-invalid="true".
//
// The `placeholder:` utility doesn't apply to a <button>: Radix marks the empty state with
// data-placeholder. It stays so the classes of the default trigger don't change.
export const selectTriggerVariants = cva(
  [
    'flex w-full items-center justify-between rounded-btn border border-base-300 bg-base-100 text-base placeholder:text-base-content/50',
    'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
    '[&>span]:line-clamp-1',
    'aria-[invalid=true]:border-error aria-[invalid=true]:text-error-focus aria-[invalid=true]:focus:ring-error aria-[invalid=true]:data-[placeholder]:text-error/50',
  ],
  {
    variants: {
      size: {
        sm: 'h-8 px-2',
        md: 'h-11 px-3 py-2',
        lg: 'h-12 px-4 py-2',
      },
    },
    defaultVariants: { size: 'md' },
  },
);

export type SelectTriggerSize = NonNullable<VariantProps<typeof selectTriggerVariants>['size']>;
