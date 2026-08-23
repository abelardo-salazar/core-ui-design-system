import type { DefaultLegendContentProps } from 'recharts';
import type { ChartConfig } from './chartConfig';
import { cn } from '../../utils/cn';

export interface ChartLegendContentProps extends Pick<DefaultLegendContentProps, 'payload'> {
  className?: string;
  /** Mismo config pasado a ChartContainer — resuelve label y color por dataKey. */
  config: ChartConfig;
}

// Se usa vía <Legend content={<ChartLegendContent config={chartConfig} />} /> de Recharts,
// mismo mecanismo de cloneElement que ChartTooltipContent. Sin hooks, sin 'use client'.
function ChartLegendContent({ payload, className, config }: ChartLegendContentProps) {
  if (!payload?.length) {
    return null;
  }

  return (
    <div className={cn('flex flex-wrap items-center justify-center gap-4', className)}>
      {payload.map((entry, index) => {
        const key = String(entry.dataKey ?? entry.value ?? index);
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
