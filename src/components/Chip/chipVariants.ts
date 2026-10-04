import { cva } from 'class-variance-authority';

// El estado "on" (Toggle presionado) siempre gana sobre la variante de color de base —
// mismo criterio que el resto del DS usa para "esto está activo" (ver data-[state=checked]
// en Switch/Checkbox). Se aplica en la raíz vía has-[[data-state=on]] porque el data-state
// vive en el Toggle (hijo), no en el contenedor.
// La raíz NO lleva padding horizontal/vertical propio: lo lleva el cuerpo (span/Toggle) y el
// botón de cierre, en Chip.tsx, porque son ellos los que necesitan que su hit box real llene
// la píldora (ver comentario en Chip.tsx). items-stretch (en vez de items-center) es lo que
// permite que esos hijos se estiren hasta el alto completo de la fila.
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
      // sm no fija alto: igual que el comportamiento histórico (anterior a esta escala), el alto
      // lo determina el contenido/el botón de cierre. md/lg sí lo fijan porque lg es el tamaño
      // táctil (44px) y necesita ser predecible independientemente del contenido.
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
