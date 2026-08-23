'use client';

import * as React from 'react';
import { ResponsiveContainer } from './ChartPrimitives';
import type { ChartConfig } from './chartConfig';
import { cn } from '../../utils/cn';

export interface ChartContainerProps extends React.ComponentPropsWithoutRef<'div'> {
  /** Mapea cada dataKey de la serie a un token de color del DS. Ver ChartConfig. */
  config: ChartConfig;
  children: React.ComponentProps<typeof ResponsiveContainer>['children'];
}

const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ config, className, style, children, ...props }, ref) => {
    // Cada entrada de `config` se traduce a una custom property `--color-<dataKey>` que
    // apunta al token real del DS (`--color-primary`, `--color-secondary`, etc — definidas
    // en index.css). Las piezas de datos (Bar/Line/Area) referencian esta variable vía
    // fill/stroke (ej. fill="var(--color-desktop)"), no un color fijo, así heredan el token
    // elegido y responden solas a claro/oscuro.
    //
    // Esto es más simple que el recipe original de ChartContainer de shadcn/ui, que además
    // inyecta un bloque <style> duplicado por tema (":root" / ".dark"): ahí hace falta
    // porque su `config` admite colores hex/hsl crudos sin noción de tema. Acá el config
    // solo acepta tokens del DS, y esos tokens ya cambian de valor solos al aplicarse `.dark`
    // (ver src/index.css) — no hay nada que duplicar.
    const chartStyle = React.useMemo(() => {
      const vars: Record<string, string> = {};
      for (const [dataKey, { color }] of Object.entries(config)) {
        vars[`--color-${dataKey}`] = `var(--color-${color})`;
      }
      return vars;
    }, [config]);

    return (
      <div
        ref={ref}
        // aspect-video: mismo default que ResponsiveContainer necesita para tener una altura
        // concreta sin pedirle un alto en px al consumidor. Sobreescribible via className
        // (ej. "h-64" en vez de dejar que el aspect-ratio decida la altura).
        // text-xs: tamaño base de las tick labels de los ejes; Recharts no trae uno propio.
        className={cn('aspect-video w-full text-xs', className)}
        style={{ ...chartStyle, ...style } as React.CSSProperties}
        {...props}
      >
        <ResponsiveContainer>{children}</ResponsiveContainer>
      </div>
    );
  },
);
ChartContainer.displayName = 'ChartContainer';

export { ChartContainer };
