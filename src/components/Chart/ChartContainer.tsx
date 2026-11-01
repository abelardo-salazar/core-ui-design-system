'use client';

import * as React from 'react';
import { ResponsiveContainer } from './ChartPrimitives';
import type { ChartConfig } from './chartConfig';
import { cn } from '../../utils/cn';

export interface ChartContainerProps extends React.ComponentPropsWithoutRef<'div'> {
  /** Maps each series dataKey to a DS color token. See ChartConfig. */
  config: ChartConfig;
  children: React.ComponentProps<typeof ResponsiveContainer>['children'];
}

const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ config, className, style, children, ...props }, ref) => {
    // Each `config` entry is turned into a `--color-<dataKey>` custom property that
    // points to the real DS token (`--color-primary`, `--color-secondary`, etc., defined
    // in tailwind.css). The data pieces (Bar/Line/Area) reference this variable through
    // fill/stroke (e.g. fill="var(--color-desktop)"), not a fixed color, so they inherit the
    // chosen token and respond to light/dark on their own.
    //
    // This is simpler than shadcn/ui's original ChartContainer recipe, which also
    // injects a <style> block duplicated per theme (":root" / ".dark"): there it's needed
    // because its `config` accepts raw hex/hsl colors with no notion of theme. Here the config
    // only accepts DS tokens, and those tokens already change value on their own when `.dark`
    // is applied (see src/tailwind.css); there's nothing to duplicate.
    const chartStyle = React.useMemo(() => {
      const vars: Record<string, string> = {};
      for (const [dataKey, { color }] of Object.entries(config)) {
        vars[`--color-${dataKey}`] = `var(--color-${color})`;
      }
      return vars;
    }, [config]);

    return (
      <div
        ref={ref}
        // aspect-video: the same default ResponsiveContainer needs to have a concrete
        // height without asking the consumer for a height in px. Overridable through className
        // (e.g. "h-64" instead of letting the aspect-ratio decide the height).
        // text-xs: base size of the axis tick labels; Recharts doesn't bring one of its own.
        className={cn('aspect-video w-full text-xs', className)}
        style={{ ...chartStyle, ...style } as React.CSSProperties}
        {...props}
      >
        <ResponsiveContainer>{children}</ResponsiveContainer>
      </div>
    );
  },
);
ChartContainer.displayName = 'ChartContainer';

export { ChartContainer };
