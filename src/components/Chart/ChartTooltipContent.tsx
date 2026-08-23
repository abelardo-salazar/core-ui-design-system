import type { TooltipContentProps } from 'recharts';
import type { ChartConfig } from './chartConfig';
import { cn } from '../../utils/cn';

export interface ChartTooltipContentProps
  extends Pick<TooltipContentProps, 'active' | 'payload' | 'label'> {
  className?: string;
  /** Mismo config pasado a ChartContainer — resuelve label y color por dataKey. */
  config: ChartConfig;
  hideLabel?: boolean;
  /** @default 'dot' */
  indicator?: 'dot' | 'line';
}

// Se usa vía <Tooltip content={<ChartTooltipContent config={chartConfig} />} /> de Recharts:
// Recharts clona este elemento e inyecta active/payload/label en cada render (ver
// renderContent en su Tooltip.js — cloneElement, no un componente aparte que uno instancia).
// No tiene 'use client': no usa hooks, es puramente presentacional.
function ChartTooltipContent({
  active,
  payload,
  label,
  className,
  config,
  hideLabel = false,
  indicator = 'dot',
}: ChartTooltipContentProps) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    // Misma superficie flotante que Popover/DropdownMenu: bg-base-100, rounded-box,
    // border-base-300, shadow-md. El tooltip default de Recharts (contentStyle inline con
    // #fff/#ccc hardcodeados) no usa ningún token del DS y no responde a modo oscuro.
    <div
      className={cn(
        'grid min-w-32 gap-1.5 rounded-box border border-base-300 bg-base-100 px-2.5 py-1.5 text-xs shadow-md',
        className,
      )}
    >
      {!hideLabel && label != null ? <p className="font-medium text-base-content">{label}</p> : null}
      <div className="grid gap-1">
        {payload.map((entry, index) => {
          const key = String(entry.dataKey ?? entry.name ?? index);
          const itemConfig = config[key];
          const itemLabel = itemConfig?.label ?? entry.name ?? key;

          return (
            <div key={key} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <span
                  className={cn('shrink-0 rounded-[2px]', indicator === 'dot' ? 'size-2' : 'h-0.5 w-3')}
                  style={{ backgroundColor: `var(--color-${key})` }}
                />
                <span className="text-base-content/65">{itemLabel}</span>
              </div>
              <span className="font-mono font-medium text-base-content">{String(entry.value ?? '')}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
ChartTooltipContent.displayName = 'ChartTooltipContent';

export { ChartTooltipContent };
