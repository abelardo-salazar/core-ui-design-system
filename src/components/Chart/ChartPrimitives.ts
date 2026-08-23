// Re-exports directos de recharts: son piezas de datos/estructura (tipo de chart, ejes,
// grilla, contenedor responsive) sin nada que tematizar, mismo criterio ya usado en Popover
// re-exportando PopoverTrigger/PopoverAnchor sin envolverlos.
export { BarChart, Bar } from 'recharts';
export type { BarProps } from 'recharts';
export { LineChart, Line } from 'recharts';
export type { LineProps } from 'recharts';
export { AreaChart, Area } from 'recharts';
export type { AreaProps } from 'recharts';
export { XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
export type {
  XAxisProps,
  YAxisProps,
  CartesianGridProps,
  ResponsiveContainerProps,
} from 'recharts';
// Tooltip y Legend no estaban en el listado original de la tarea, pero sin re-exportarlos
// ChartTooltipContent/ChartLegendContent quedarían inusables: van exactamente dentro de
// <ChartTooltip content={<ChartTooltipContent .../>} /> y <ChartLegend content={<ChartLegendContent
// .../>} />, y el consumidor no tiene otra vía para importar estas piezas de recharts desde
// este DS. Renombradas a ChartTooltip/ChartLegend (en vez de Tooltip/Legend a secas): un
// export * a nivel raíz (src/index.ts) choca en tiempo de compilación con el Tooltip propio
// del DS (Radix, src/components/Tooltip) — error real de TS2308, no una preferencia de
// nombres. Legend no colisiona hoy, pero se renombra igual por consistencia con el prefijo
// Chart* del resto de este módulo.
export { Tooltip as ChartTooltip, Legend as ChartLegend } from 'recharts';
export type { TooltipProps as ChartTooltipProps, LegendProps as ChartLegendProps } from 'recharts';

// Pie/Ring: "Ring" (donut) no es un componente propio — se logra componiendo Pie con
// innerRadius/outerRadius (el hueco) y un texto central para el total (ver
// RingChartExample en Chart.stories.tsx). Cell sigue siendo, en recharts@3.10.1, la vía
// documentada para colorear cada porción individualmente — está marcado @deprecated en su
// .d.ts a favor de un prop shape/content en Pie, pero sigue totalmente funcional en esta
// versión y es la que pide explícitamente esta tarea; no vale la pena la complejidad de un
// renderer de shape custom para v1.
//
// Label se re-exporta igual (pieza de estructura, mismo criterio que el resto de este
// archivo), pero ojo: <Label position="center"> NO sirve para el texto central de un Ring en
// esta versión — probado contra un Pie real, no renderiza nada. Causa (Label.js, comentario
// propio de Recharts citando su issue #6030): para position="center" específicamente, Label
// resuelve el viewBox contra el contexto *cartesiano* en vez del *polar* ("quick fix"
// documentado como tal en su propio código) — un PieChart sin ejes nunca provee ese contexto
// cartesiano, así que queda undefined. Es un bug/quirk real de recharts@3.10.1, no un error
// de uso — ver el detalle completo en el comentario de RingChartExample.
export { Pie, Cell, Label, PieChart } from 'recharts';
export type { PieProps, CellProps, LabelProps } from 'recharts';
