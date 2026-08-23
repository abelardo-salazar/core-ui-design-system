import type { ReactNode } from 'react';

// Tokens de color reales del DS (ver src/index.css, bloque `@theme` y `:root`). Deliberadamente
// no incluye `error`: ese token está reservado para estados de error (Alert, Button
// destructive), no para diferenciar series de datos en un chart. Tampoco incluye `neutral`:
// en modo oscuro `--neutral` es blanco puro, indistinguible del texto/ejes del chart.
export const CHART_COLOR_TOKENS = [
  'primary',
  'secondary',
  'accent',
  'success',
  'warning',
  'info',
] as const;

export type ChartColorToken = (typeof CHART_COLOR_TOKENS)[number];

/**
 * Mapea cada `dataKey` de una serie a un token de color del DS (y opcionalmente una label
 * legible). `ChartContainer` usa este objeto para inyectar `--color-<dataKey>` como variable
 * CSS; `ChartTooltipContent`/`ChartLegendContent` lo usan para resolver la label y el color
 * de cada entrada. No acepta valores hexadecimales sueltos a propósito — forzar el token
 * es lo que garantiza que el chart seguya la paleta del DS y responda a claro/oscuro.
 */
export type ChartConfig = Record<
  string,
  {
    label?: ReactNode;
    color: ChartColorToken;
  }
>;
