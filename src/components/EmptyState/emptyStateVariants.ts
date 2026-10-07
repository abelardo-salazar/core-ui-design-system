import { cva } from 'class-variance-authority';

// El padding vive solo en `size`, no en la base: así twMerge resuelve el conflicto con el
// className del consumidor (`size="sm" className="py-2"` aplica py-2). Con una variante por
// atributo (data-[size=sm]:py-6) el selector tendría más especificidad y el className
// perdería en sm.
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
