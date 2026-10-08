import { cva, type VariantProps } from 'class-variance-authority';

// Misma escala de alto que Button (32 / 44 / 48) para que un ToggleGroup y un Button del mismo
// size queden alineados en una fila: el contenedor del grupo no tiene padding vertical, así que
// el grupo mide lo mismo que sus ítems.
export const toggleGroupItemVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-btn font-medium text-base-content/70 transition-colors cursor-pointer',
    'hover:text-base-content',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    // Mismo estado activo que TabsTrigger.
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
