import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  // rounded-btn NO vive acá: solo en shape.default (ver abajo) — mismo motivo que el bug de
  // Badge.size: si la base y una variante aplican el mismo grupo de utilidades (acá,
  // border-radius) a la vez, cuál "gana" depende del orden en que Tailwind emite las reglas
  // en la hoja de estilos, no de con qué variante se llamó a cva. shape SIEMPRE resuelve a
  // 'default' o 'pill' (nunca ausente: defaultVariants lo garantiza), así que no hace falta
  // ningún fallback en la base.
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 aria-disabled:opacity-50  [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-content hover:bg-primary-focus shadow-sm',
        secondary: 'bg-secondary text-secondary-content hover:bg-secondary-focus shadow-sm',
        outline:
          'border border-base-300 bg-transparent text-base-content hover:bg-base-200 shadow-sm',
        ghost: 'hover:bg-base-200 text-base-content hover:text-base-content',
        link: 'text-primary underline-offset-4 hover:underline decoration-primary',
        // hover:text-error-focus-content es necesario: --error es claro y --error-focus es
        // oscuro (al revés que en las demás variantes), así que text-error-content (negro)
        // solo da contraste suficiente en el estado base, no en hover. Ver index.css.
        destructive:
          'bg-error text-error-content hover:bg-error-focus hover:text-error-focus-content shadow-sm',
      },
      // md = 44px: alinea con Input md y el trigger de Select (misma familia de controles de
      // formulario, ver inputVariants.ts/Select.tsx) — antes los tres medían 40px, pero una
      // fila campo+botón con size="icon" (ya 44px desde el fix de touch target) quedaba
      // desalineada 4px contra el propio Button md. sm (32px) y lg (48px) no cambian: la
      // escala queda 32 / 44 / 48, lg se distingue de md por padding y tamaño de texto, no
      // solo por 4px de alto.
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-11 px-4 py-2',
        lg: 'h-12 px-8 text-base',
        // 44x44 (Apple HIG) en vez del h-10 w-10 (40x40) anterior — el ícono en sí no cambia de
        // tamaño porque [&_svg]:size-4 en la clase base ya lo fija independientemente del size.
        icon: 'h-11 w-11',
      },
      fullWidth: {
        true: 'w-full',
      },
      // Con size="icon", pill da un círculo (border-radius: 9999px sobre una caja cuadrada de
      // 44x44) — el anillo de foco sigue la forma del elemento sin necesitar cambios propios,
      // porque usa el mismo border-radius vía la caja a la que se aplica el box-shadow.
      shape: {
        default: 'rounded-btn',
        pill: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
      shape: 'default',
    },
  },
);
