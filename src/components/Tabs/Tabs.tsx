'use client';

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '../../utils/cn';

const Tabs = TabsPrimitive.Root;

// -----------------------------------------------------------------------------
// List — segmento/píldora: bg-base-200 conteniendo los triggers, mismo radius
// token que DropdownMenuContent (rounded-box). Pensado para grupos chicos (2-5
// opciones), no para una fila larga de tabs de dashboard.
// -----------------------------------------------------------------------------
const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn('inline-flex items-center gap-1 rounded-box bg-base-200 p-1', className)}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

// -----------------------------------------------------------------------------
// Trigger — el estado activo (data-state="active") usa bg-primary/text-primary-content,
// el mismo criterio de color que Chip aplica al estado "on" (ver chipVariants.ts:
// has-[[data-state=on]]:bg-primary). Acá no hace falta el selector has-* porque
// data-state vive directo en el propio Trigger, no en un hijo.
// -----------------------------------------------------------------------------
const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-btn px-3 py-1.5 text-sm font-medium text-base-content/70 transition-colors',
      'hover:text-base-content',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50',
      'data-[state=active]:bg-primary data-[state=active]:text-primary-content',
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

// -----------------------------------------------------------------------------
// Content — sin Portal: a diferencia de DropdownMenuContent/TooltipContent, el
// contenido de un tab vive en el flujo normal del documento.
// -----------------------------------------------------------------------------
const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
