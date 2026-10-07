import { cva } from 'class-variance-authority';

// flex flex-col activa el gap-4 entre header, body y footer. overflow-y-auto es el respaldo
// para quien no use SheetBody (la ✕ se desplaza con el contenido en ese caso).
// Safe area: cada borde que toca el viewport usa max(1.5rem, env(safe-area-inset-*)); el
// borde interior queda en el p-6 de la base. Solo surte efecto con viewportFit: 'cover'.
export const sheetVariants = cva(
  'fixed z-50 flex flex-col gap-4 overflow-y-auto bg-base-100 p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out',
  {
    variants: {
      side: {
        top: 'inset-x-0 top-0 max-h-[85dvh] border-b pt-[max(1.5rem,env(safe-area-inset-top))] pl-[max(1.5rem,env(safe-area-inset-left))] pr-[max(1.5rem,env(safe-area-inset-right))] data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
        bottom:
          'inset-x-0 bottom-0 max-h-[85dvh] border-t pb-[max(1.5rem,env(safe-area-inset-bottom))] pl-[max(1.5rem,env(safe-area-inset-left))] pr-[max(1.5rem,env(safe-area-inset-right))] data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
        left: 'inset-y-0 left-0 h-full w-3/4 border-r pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] pl-[max(1.5rem,env(safe-area-inset-left))] sm:max-w-sm data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
        right:
          'inset-y-0 right-0 h-full w-3/4 border-l pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] pr-[max(1.5rem,env(safe-area-inset-right))] sm:max-w-sm data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
      },
    },
    defaultVariants: {
      side: 'right',
    },
  },
);

// Posición de la ✕. right-0.5/top-0.5 (2px) + el p-3.5 del botón dejan el ícono a 16px del
// borde con un área táctil de 44x44. En los bordes que tocan el viewport se suma el safe area
// completo, para que toda el área táctil quede fuera de la zona insegura.
const closeTop = 'top-[calc(0.125rem_+_env(safe-area-inset-top))]';
const closeRight = 'right-[calc(0.125rem_+_env(safe-area-inset-right))]';

export const sheetCloseVariants = cva(
  // ring-inset sin separación: el anillo se dibuja dentro del área táctil, así que el
  // overflow-y-auto del panel no lo recorta.
  'absolute rounded-sm p-3.5 opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary disabled:pointer-events-none data-[state=open]:bg-base-200 data-[state=open]:text-base-content/50',
  {
    variants: {
      side: {
        top: `${closeTop} ${closeRight}`,
        bottom: `top-0.5 ${closeRight}`,
        left: `${closeTop} right-0.5`,
        right: `${closeTop} ${closeRight}`,
      },
    },
    defaultVariants: {
      side: 'right',
    },
  },
);
