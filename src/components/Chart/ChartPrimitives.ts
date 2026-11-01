// Direct re-exports from recharts: they are data/structure pieces (chart type, axes,
// grid, responsive container) with nothing to theme, same criterion already used in Popover
// re-exporting PopoverTrigger/PopoverAnchor without wrapping them.
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
// Tooltip and Legend weren't in the task's original list, but without re-exporting them
// ChartTooltipContent/ChartLegendContent would be unusable: they go exactly inside
// <ChartTooltip content={<ChartTooltipContent .../>} /> and <ChartLegend content={<ChartLegendContent
// .../>} />, and the consumer has no other way to import these recharts pieces from
// this DS. Renamed to ChartTooltip/ChartLegend (instead of plain Tooltip/Legend): an
// export * at the root level (src/index.ts) clashes at compile time with the DS's own Tooltip
// (Radix, src/components/Tooltip); a real TS2308 error, not a naming preference.
// Legend doesn't collide today, but it's renamed anyway for consistency with the Chart*
// prefix of the rest of this module.
export { Tooltip as ChartTooltip, Legend as ChartLegend } from 'recharts';
export type { TooltipProps as ChartTooltipProps, LegendProps as ChartLegendProps } from 'recharts';

// Pie/Ring: "Ring" (donut) isn't a component of its own; it's achieved by composing Pie with
// innerRadius/outerRadius (the hole) and a center text for the total (see
// RingChartExample in Chart.stories.tsx). In recharts@3.10.1, Cell is still the
// documented way to color each slice individually; it's marked @deprecated in its
// .d.ts in favor of a shape/content prop on Pie, but it's still fully functional in this
// version and it's what this task explicitly asks for; the complexity of a custom shape
// renderer isn't worth it for v1.
//
// Label is re-exported too (a structure piece, same criterion as the rest of this
// file), but note: <Label position="center"> does NOT work for a Ring's center text in
// this version; tested against a real Pie, it renders nothing. Cause (Label.js, Recharts' own
// comment citing its issue #6030): for position="center" specifically, Label
// resolves the viewBox against the *cartesian* context instead of the *polar* one (a "quick
// fix" documented as such in its own code); a PieChart without axes never provides that
// cartesian context, so it stays undefined. It's a real bug/quirk of recharts@3.10.1, not a
// usage error; see the full detail in RingChartExample's comment.
export { Pie, Cell, Label, PieChart } from 'recharts';
export type { PieProps, CellProps, LabelProps } from 'recharts';
