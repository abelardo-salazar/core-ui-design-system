import { cva } from 'class-variance-authority';

export const inputVariants = cva(
  // Base styles
  'flex w-full rounded-btn border bg-base-100 px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-base-content/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      // Visual state (borders and focus ring)
      variant: {
        default: 'border-base-300 focus-visible:ring-primary focus-visible:border-primary',
        error: 'border-error focus-visible:ring-error text-error-focus placeholder:text-error/50',
      },
      // Sizes (height and padding). md = 44px: alinea con Button md y el trigger de Select
      // (misma familia de controles de formulario) — sm (32px) y lg (48px) no cambian.
      size: {
        sm: 'h-8 px-2 text-xs',
        md: 'h-11 px-3',
        lg: 'h-12 px-4 text-base',
      },
      // Reserva a la derecha el ancho del botón de limpiar (cuadrado del alto del input), así
      // que se deriva del tamaño en compoundVariants en vez de un pr fijo.
      clearable: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      { clearable: true, size: 'sm', class: 'pr-8' },
      { clearable: true, size: 'md', class: 'pr-11' },
      { clearable: true, size: 'lg', class: 'pr-12' },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'md',
      clearable: false,
    },
  },
);
