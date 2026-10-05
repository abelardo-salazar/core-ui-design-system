import { cva } from 'class-variance-authority';

// La base NO lleva padding/alto/texto propios: viven solo en `size` (ver abajo). Si la base
// tuviera su propio px/py/text-* además de `size`, ambos juegos de clases conviven en el
// className final — cuál "gana" depende del orden en que Tailwind emite las reglas en la
// hoja de estilos, no del orden en el string, así que es un empate ambiguo en vez de un
// override real. Esto es justo lo que hacía que el bug histórico de `size` (nunca llegaba a
// cva desde Badge.tsx) fuera invisible: la base sola ya daba un resultado plausible.
export const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full border text-center font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-content',
        secondary: 'border-transparent bg-secondary text-secondary-content',
        // hover:text-error-focus-content es necesario: --error es claro y --error-focus es
        // oscuro (al revés que en las demás variantes), así que text-error-content (negro)
        // solo da contraste suficiente en el estado base, no en hover. Ver index.css. El
        // hover en sí vive en compoundVariants (solo aplica si interactive=true).
        destructive: 'border-transparent bg-error text-error-content',
        outline: 'text-base-content border-base-content/20',
        ghost: 'border-transparent bg-base-200 text-base-content',
      },

      // Escala propia de Badge (no la de Button): compacta, para una etiqueta de estado, no
      // un control. Sin h-* fijas (salvo icon): el alto sale de borde + padding vertical +
      // line-height del propio text-*, así nunca queda un h-* peleando con el texto si el
      // consumidor cambia className. Alturas reales medidas en navegador (Storybook, ver PR):
      // sm ≈ 22px, md ≈ 26px, lg ≈ 30px, icon = 24px exactos (size-6).
      size: {
        sm: 'px-2.5 py-0.5 text-xs',
        md: 'px-3 py-1 text-xs',
        lg: 'px-3.5 py-1 text-sm',
        // Cuadrado, sin padding horizontal: para un badge que es solo un ícono o un número
        // corto (p. ej. un contador), no una etiqueta de texto.
        icon: 'size-6',
      },

      // false (default): Badge es un <div>, sin ningún estilo de interacción — hover/foco en
      // un <div> no interactivo es CSS muerto (nunca se dispara :focus-visible porque un <div>
      // sin tabIndex no es foco-able) y además engaña visualmente a quien sí le agrega
      // onClick a mano. true: Badge es un <button> real (ver Badge.tsx) y estas clases SÍ
      // tienen sentido. focus-visible (no focus:) es la convención del resto del DS.
      interactive: {
        true: 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      },
    },

    // El hover depende de variant Y de interactive a la vez (no tiene sentido como parte de
    // `variant` solo, porque un Badge no-interactivo no debe mostrar hover). outline no tenía
    // hover antes: un elemento interactivo sin feedback visual no tiene sentido, así que gana
    // uno acá (no estaba definido para el div no-interactivo, nunca se notaba).
    compoundVariants: [
      { variant: 'default', interactive: true, class: 'hover:bg-primary-focus' },
      { variant: 'secondary', interactive: true, class: 'hover:bg-secondary-focus' },
      {
        variant: 'destructive',
        interactive: true,
        class: 'hover:bg-error-focus hover:text-error-focus-content',
      },
      { variant: 'outline', interactive: true, class: 'hover:bg-base-200' },
      { variant: 'ghost', interactive: true, class: 'hover:bg-base-300' },
    ],

    defaultVariants: {
      variant: 'default',
      size: 'sm',
      interactive: false,
    },
  },
);
