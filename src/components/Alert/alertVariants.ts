import { cva } from 'class-variance-authority';

// The --info/--success/--warning tokens have no "-content" variant or dark mode override
// in tailwind.css (unlike --error); they're meant as an accent, not as a solid background
// with text on top. That's why the container uses the color at /10 opacity + a border at
// /30, and the body text stays base-content (see alertIconVariants for the full accent
// on the icon). The same criterion is applied to error for visual consistency across the
// four variants, even though error does have plenty of tokens for a solid background.
export const alertVariants = cva('relative flex w-full gap-3 rounded-box border p-4', {
  variants: {
    variant: {
      info: 'border-info/30 bg-info/10',
      success: 'border-success/30 bg-success/10',
      warning: 'border-warning/30 bg-warning/10',
      error: 'border-error/30 bg-error/10',
    },
  },
  defaultVariants: {
    variant: 'info',
  },
});

export const alertIconVariants = cva('h-5 w-5 shrink-0', {
  variants: {
    variant: {
      info: 'text-info',
      success: 'text-success',
      warning: 'text-warning',
      error: 'text-error',
    },
  },
  defaultVariants: {
    variant: 'info',
  },
});
