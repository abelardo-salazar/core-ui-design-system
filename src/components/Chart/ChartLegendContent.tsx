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
        // entry.value antes que entry.dataKey a propósito: mismo caso que
        // ChartTooltipContent — para Pie, dataKey es el mismo string en todas las porciones
        // (el campo que indica el valor numérico), y la única key que distingue cada porción
        // es `value` (el nombre resuelto por nameKey). Verificado con un Pie real: el payload
        // del legend trae dataKey:"value" repetido en cada entry y value:"design"/
        // "engineering" distinto por entry — con dataKey primero, todas las porciones
        // colapsaban a var(--color-value), que ChartContainer nunca inyecta.
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
