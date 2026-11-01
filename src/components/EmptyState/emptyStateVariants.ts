import { cva } from 'class-variance-authority';

// The padding lives only in `size`, not in the base: that way twMerge resolves the conflict
// with the consumer's className (`size="sm" className="py-2"` applies py-2). With an
// attribute variant (data-[size=sm]:py-6) the selector would be more specific and the
// className would lose in sm.
export const emptyStateVariants = cva(
  'group/empty-state flex w-full flex-col items-center gap-2 text-center',
  {
    variants: {
      size: {
        sm: 'px-4 py-6',
        md: 'px-6 py-12',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);
