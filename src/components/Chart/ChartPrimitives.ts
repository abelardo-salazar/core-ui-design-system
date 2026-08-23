// Re-exports directos de recharts: son piezas de datos/estructura (tipo de chart, ejes,
// grilla, contenedor responsive) sin nada que tematizar, mismo criterio ya usado en Popover
// re-exportando PopoverTrigger/PopoverAnchor sin envolverlos.
//
// Alcance v1 confirmado: solo Bar/Line/Area. Pie y RadialBar (ring/donut) quedan
// deliberadamente afuera para una tarea futura — no agregar sus re-exports acá todavía.
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
