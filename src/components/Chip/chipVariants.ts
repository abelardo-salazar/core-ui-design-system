import { cva } from 'class-variance-authority';

// El estado "on" (Toggle presionado) siempre gana sobre la variante de color de base —
// mismo criterio que el resto del DS usa para "esto está activo" (ver data-[state=checked]
// en Switch/Checkbox). Se aplica en la raíz vía has-[[data-state=on]] porque el data-state
// vive en el Toggle (hijo), no en el contenedor.
export const chipVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors has-[[data-state=on]]:border-transparent has-[[data-state=on]]:bg-primary has-[[data-state=on]]:text-primary-content',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-content',
        secondary: 'border-transparent bg-secondary text-secondary-content',
        outline: 'text-base-content border-base-content/20',
        ghost: 'border-transparent bg-base-200 text-base-content',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);
