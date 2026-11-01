import type { DefaultLegendContentProps } from 'recharts';
import type { ChartConfig } from './chartConfig';
import { cn } from '../../utils/cn';

export interface ChartLegendContentProps extends Pick<DefaultLegendContentProps, 'payload'> {
  className?: string;
  /** Same config passed to ChartContainer; resolves label and color by dataKey. */
  config: ChartConfig;
}

// Used through Recharts' <Legend content={<ChartLegendContent config={chartConfig} />} />,
// same cloneElement mechanism as ChartTooltipContent. No hooks, no 'use client'.
function ChartLegendContent({ payload, className, config }: ChartLegendContentProps) {
  if (!payload?.length) {
    return null;
  }

  return (
    <div className={cn('flex flex-wrap items-center justify-center gap-4', className)}>
      {payload.map((entry, index) => {
        // entry.value before entry.dataKey on purpose: same case as
        // ChartTooltipContent; for Pie, dataKey is the same string in all the slices
        // (the field holding the numeric value), and the only key that tells each slice apart
        // is `value` (the name resolved by nameKey). Verified with a real Pie: the legend
        // payload has dataKey:"value" repeated in every entry and value:"design"/
        // "engineering" different per entry; with dataKey first, all the slices
        // collapsed into var(--color-value), which ChartContainer never injects.
        const key = String(entry.value ?? entry.dataKey ?? index);
        const itemConfig = config[key];
        const itemLabel = itemConfig?.label ?? entry.value ?? key;

        return (
          <div key={key} className="flex items-center gap-1.5">
            <span
              className="size-2 shrink-0 rounded-[2px]"
              style={{ backgroundColor: `var(--color-${key})` }}
            />
            <span className="text-xs text-base-content/65">{itemLabel}</span>
          </div>
        );
      })}
    </div>
  );
}
ChartLegendContent.displayName = 'ChartLegendContent';

export { ChartLegendContent };
