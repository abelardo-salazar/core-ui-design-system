'use client';

import * as React from 'react';
import * as SheetPrimitive from '@radix-ui/react-dialog';
import { Cross2Icon } from '@radix-ui/react-icons';
import { type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { sheetCloseVariants, sheetVariants } from './sheetVariants';

const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;
const SheetPortal = SheetPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      'fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className,
    )}
    {...props}
    ref={ref}
  />
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

export type SheetContentProps = React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content> &
  VariantProps<typeof sheetVariants>;

/**
 * Panel del Sheet: columna flex con `gap-4` entre hijos. Estructura recomendada:
 * `SheetHeader`, `SheetBody` y `SheetFooter`. El body hace scroll y header/footer quedan
 * fijos. Sin `SheetBody`, el panel entero hace scroll como respaldo, pero la ✕ se desplaza
 * con el contenido; lo correcto es usar `SheetBody`.
 *
 * `top` y `bottom` tienen un alto máximo de 85dvh; `left` y `right`, el alto completo.
 *
 * Los bordes que tocan el viewport respetan el safe area (`env(safe-area-inset-*)`). Solo
 * surte efecto si la app declara `viewport-fit=cover` (en Next.js:
 * `export const viewport = { viewportFit: 'cover' }`).
 */
const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ side = 'right', className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content ref={ref} className={cn(sheetVariants({ side }), className)} {...props}>
      {children}
      {/* Área táctil 44x44 (Apple HIG); posición y anillo en sheetCloseVariants. */}
      <SheetPrimitive.Close className={sheetCloseVariants({ side })}>
        <Cross2Icon className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </SheetPrimitive.Close>
    </SheetPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = SheetPrimitive.Content.displayName;

// El padding reserva el espacio de la ✕: 1.5rem (44px a 2px del borde, menos los 24px de
// padding del panel) más env(safe-area-inset-right), porque la ✕ se corre ese inset y el
// panel no siempre lo absorbe (con muesca en horizontal el título quedaba debajo). Se aplica
// en los cuatro lados en vez de leer un data-side del Content: en `left` el borde derecho es
// interior y sobra el inset, pero el header no queda acoplado al Content. Sin inset resuelve
// a los mismos 24px. En móvil el texto va centrado, así que se reserva en ambos lados para no
// descentrarlo.
const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex shrink-0 flex-col space-y-2 px-[calc(1.5rem_+_env(safe-area-inset-right))] text-center sm:pl-0 sm:text-left',
      className,
    )}
    {...props}
  />
);
SheetHeader.displayName = 'SheetHeader';

/**
 * Zona con scroll del Sheet; header y footer quedan fijos por estar fuera de ella. Los
 * márgenes negativos compensan el padding del panel para que el overflow no recorte los
 * anillos de foco de los controles en el borde (ring-2 + offset-2 = 4px en vertical) y la
 * barra de scroll quede pegada al borde del panel.
 */
const SheetBody = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('-mx-6 -my-1 min-h-0 flex-1 overflow-y-auto px-6 py-1', className)}
    {...props}
  />
);
SheetBody.displayName = 'SheetBody';

const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex shrink-0 flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      className,
    )}
    {...props}
  />
);
SheetFooter.displayName = 'SheetFooter';

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold text-base-content', className)}
    {...props}
  />
));
SheetTitle.displayName = SheetPrimitive.Title.displayName;

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn('text-sm text-base-content', className)}
    {...props}
  />
));
SheetDescription.displayName = SheetPrimitive.Description.displayName;

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetBody,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
