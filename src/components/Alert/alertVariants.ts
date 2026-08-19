import { cva } from 'class-variance-authority';

// Los tokens --info/--success/--warning no tienen variante "-content" ni override de dark
// mode en index.css (a diferencia de --error) — están pensados como acento, no como fondo
// sólido con texto encima. Por eso el contenedor usa el color a /10 de opacidad + borde a
// /30, y el texto del cuerpo queda en base-content (ver alertIconVariants para el acento
// pleno en el ícono). Se aplica el mismo criterio a error por consistencia visual entre las
// cuatro variantes, aunque error sí tenga tokens de sobra para fondo sólido.
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
