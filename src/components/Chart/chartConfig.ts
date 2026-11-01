import type { ReactNode } from 'react';

// Real DS color tokens (see src/tailwind.css, the `@theme` and `:root` blocks). It deliberately
// doesn't include `error`: that token is reserved for error states (Alert, Button
// destructive), not for telling data series apart in a chart. It doesn't include `neutral`
// either: in dark mode `--neutral` is pure white, indistinguishable from the chart text/axes.
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
 * Maps each series `dataKey` to a DS color token (and optionally a readable
 * label). `ChartContainer` uses this object to inject `--color-<dataKey>` as a CSS
 * variable; `ChartTooltipContent`/`ChartLegendContent` use it to resolve the label and color
 * of each entry. It deliberately doesn't accept loose hex values: forcing the token
 * is what guarantees the chart follows the DS palette and responds to light/dark.
 */
export type ChartConfig = Record<
  string,
  {
    label?: ReactNode;
    color: ChartColorToken;
  }
>;
