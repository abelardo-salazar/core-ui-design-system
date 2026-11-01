import type { TooltipContentProps } from 'recharts';
import type { ChartConfig } from './chartConfig';
import { cn } from '../../utils/cn';

export interface ChartTooltipContentProps extends Pick<
  TooltipContentProps,
  'active' | 'payload' | 'label'
> {
  className?: string;
  /** Same config passed to ChartContainer; resolves label and color by dataKey. */
  config: ChartConfig;
  hideLabel?: boolean;
  /** @default 'dot' */
  indicator?: 'dot' | 'line';
}

// Used through Recharts' <Tooltip content={<ChartTooltipContent config={chartConfig} />} />:
// Recharts clones this element and injects active/payload/label on each render (see
// renderContent in its Tooltip.js: cloneElement, not a separate component you instantiate).
// No 'use client': it uses no hooks, it's purely presentational.
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
    // Same floating surface as Popover/DropdownMenu: bg-base-100, rounded-box,
    // border-base-300, shadow-md. Recharts' default tooltip (inline contentStyle with
    // hardcoded #fff/#ccc) uses no DS token and doesn't respond to dark mode.
    <div
      className={cn(
        'grid min-w-32 gap-1.5 rounded-box border border-base-300 bg-base-100 px-2.5 py-1.5 text-xs shadow-md',
        className,
      )}
    >
      {!hideLabel && label != null ? (
        <p className="font-medium text-base-content">{label}</p>
      ) : null}
      <div className="grid gap-1">
        {payload.map((entry, index) => {
          // entry.name before entry.dataKey on purpose: for cartesian series
          // (Bar/Line/Area) both usually match (Recharts sets name = dataKey if no
          // explicit `name` is passed, see getTooltipNameProp in ChartUtils.js), but for Pie
          // dataKey is the same string in ALL the slices (the field holding the value,
          // e.g. "value"); there the only key that tells each slice apart is `name` (resolved
          // by Recharts through nameKey). Using dataKey first would collapse all the slices of
          // a Pie into a single key that doesn't exist in `config` (verified with a real Pie: the
          // payload has dataKey:"value" repeated in every entry, name:"design"/"engineering"
          // different per entry).
          const key = String(entry.name ?? entry.dataKey ?? index);
          const itemConfig = config[key];
          const itemLabel = itemConfig?.label ?? entry.name ?? key;

          return (
            <div key={key} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    'shrink-0 rounded-[2px]',
                    indicator === 'dot' ? 'size-2' : 'h-0.5 w-3',
                  )}
                  style={{ backgroundColor: `var(--color-${key})` }}
                />
                <span className="text-base-content/65">{itemLabel}</span>
              </div>
              <span className="font-mono font-medium text-base-content">
                {String(entry.value ?? '')}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
ChartTooltipContent.displayName = 'ChartTooltipContent';

export { ChartTooltipContent };
