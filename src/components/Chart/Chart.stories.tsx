import type { Meta, StoryObj } from '@storybook/react';
import { expect, fireEvent, waitFor, within } from 'storybook/test';
import { ChartContainer } from './ChartContainer';
import { ChartTooltipContent } from './ChartTooltipContent';
import { ChartLegendContent } from './ChartLegendContent';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ChartLegend,
  ChartTooltip,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from './ChartPrimitives';
import type { ChartConfig } from './chartConfig';

// dataKeys without accents (escritorio/movil) on purpose: they are identifiers also used in
// "var(--color-<dataKey>)" and in DOM attributes; the accented label ("Móvil") lives
// separately, only in config.movil.label, which is the only thing shown on screen.
const chartConfig: ChartConfig = {
  escritorio: { label: 'Escritorio', color: 'primary' },
  movil: { label: 'Móvil', color: 'secondary' },
};

const data = [
  { month: 'Ene', escritorio: 186, movil: 80 },
  { month: 'Feb', escritorio: 305, movil: 200 },
  { month: 'Mar', escritorio: 237, movil: 120 },
  { month: 'Abr', escritorio: 73, movil: 190 },
  { month: 'May', escritorio: 209, movil: 130 },
  { month: 'Jun', escritorio: 214, movil: 140 },
];

// Fixed size in px, through an inline style instead of the h-72/aspect-video classes a real
// consumer would use. ResponsiveContainer needs its ancestor to have a real CSS height
// (not 0) to measure anything with its ResizeObserver; the test environment of
// @storybook/addon-vitest (Vitest browser mode) doesn't load Tailwind's compiled utilities
// into the test document (verified: the computed aspect-ratio stayed "auto" and height
// "0px" despite the classes), so Tailwind classes aren't enough to size it here. The inline
// style doesn't depend on any stylesheet, so it's the only deterministic way for this case;
// it isn't representative of real use (see Storybook with a real browser, where
// `className="aspect-video ..."` does work).
const testSize = { width: 600, height: 300 };

// Simulates a mousemove over the center of the chart's plot area. Recharts computes the
// active point from native mousemove/mouseover events captured by RechartsWrapper, and
// dispatches the state update (Redux) through requestAnimationFrame (internal throttle,
// see mouseEventsMiddleware.js), which is why we need to wait a frame after the event.
// userEvent.hover() (verified) isn't enough here: it only guarantees pointerenter/mouseenter,
// not a mousemove with clientX/clientY, which is what Recharts needs to resolve the active
// index; fireEvent with explicit coordinates does fire it reliably.
async function hoverChartCenter(svg: SVGSVGElement) {
  const rect = svg.getBoundingClientRect();
  const clientX = rect.left + rect.width / 2;
  const clientY = rect.top + rect.height / 2;
  fireEvent.mouseOver(svg, { clientX, clientY, bubbles: true });
  fireEvent.mouseMove(svg, { clientX, clientY, bubbles: true });
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
}

const meta: Meta<typeof ChartContainer> = {
  title: 'Components/Chart',
  component: ChartContainer,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof ChartContainer>;

// 1. BarChart: confirms that ChartContainer injects --color-<dataKey> according to config, and
// that ChartTooltipContent appears with the right surface and tokens on hover.
export const BarChartExample: Story = {
  render: () => (
    <ChartContainer config={chartConfig} className="max-w-2xl" style={testSize}>
      <BarChart data={data}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent config={chartConfig} />} />
        <ChartLegend content={<ChartLegendContent config={chartConfig} />} />
        {/* isAnimationActive=false only in this test demo: Recharts animates the entry
        (height 0 -> real) by default; without it, the hover can land on a <path>
        that has no area yet during the first frame. Doesn't apply to a real consumer. */}
        <Bar
          dataKey="escritorio"
          fill="var(--color-escritorio)"
          radius={4}
          isAnimationActive={false}
        />
        <Bar dataKey="movil" fill="var(--color-movil)" radius={4} isAnimationActive={false} />
      </BarChart>
    </ChartContainer>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // ChartContainer is the first div of the render (the one wrapping ResponsiveContainer).
    const container = canvasElement.querySelector('div') as HTMLElement;
    await expect(container.style.getPropertyValue('--color-escritorio')).toBe(
      'var(--color-primary)',
    );
    await expect(container.style.getPropertyValue('--color-movil')).toBe('var(--color-secondary)');

    // ResponsiveContainer measures its real size through ResizeObserver asynchronously: on the
    // first render (before it fires) it renders a 0x0 div with no chart inside
    // yet. We have to wait for the <svg> to appear before looking for the legend/tooltip.
    await waitFor(() =>
      expect(canvasElement.querySelector('svg.recharts-surface')).toBeInTheDocument(),
    );
    const svg = canvasElement.querySelector('svg.recharts-surface') as SVGSVGElement;

    // The legend uses ChartLegendContent: config labels, not the raw dataKeys.
    await expect(canvas.getByText('Escritorio')).toBeInTheDocument();
    await expect(canvas.getByText('Móvil')).toBeInTheDocument();

    await hoverChartCenter(svg);

    // Recharts' default tooltip doesn't appear in the DOM until the first mousemove.
    // ChartTooltipContent replaces that content, mounted inside .recharts-tooltip-wrapper
    // (each series label is repeated in the legend, which is why it's searched within that
    // wrapper instead of with a bare getAllByText; the order of both in the DOM isn't guaranteed).
    await waitFor(() =>
      expect(
        canvasElement.querySelector('.recharts-tooltip-wrapper')?.getAttribute('style'),
      ).toContain('visibility: visible'),
    );
    const tooltipWrapper = canvasElement.querySelector('.recharts-tooltip-wrapper') as HTMLElement;
    const tooltipSurface = within(tooltipWrapper).getByText('Escritorio').closest('.bg-base-100');
    await expect(tooltipSurface?.className.split(' ')).toEqual(
      expect.arrayContaining(['bg-base-100', 'rounded-box', 'border-base-300', 'shadow-md']),
    );
  },
};

// 2. LineChart: same kind of check as BarChart, on a different chart type.
export const LineChartExample: Story = {
  render: () => (
    <ChartContainer config={chartConfig} className="max-w-2xl" style={testSize}>
      <LineChart data={data}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent config={chartConfig} />} />
        <ChartLegend content={<ChartLegendContent config={chartConfig} />} />
        <Line
          dataKey="escritorio"
          stroke="var(--color-escritorio)"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
        <Line
          dataKey="movil"
          stroke="var(--color-movil)"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ChartContainer>
  ),
  play: async ({ canvasElement }) => {
    const container = canvasElement.querySelector('div') as HTMLElement;
    await expect(container.style.getPropertyValue('--color-escritorio')).toBe(
      'var(--color-primary)',
    );
    await expect(container.style.getPropertyValue('--color-movil')).toBe('var(--color-secondary)');

    await waitFor(() =>
      expect(canvasElement.querySelector('svg.recharts-surface')).toBeInTheDocument(),
    );
    const svg = canvasElement.querySelector('svg.recharts-surface') as SVGSVGElement;
    await hoverChartCenter(svg);

    await waitFor(() =>
      expect(
        canvasElement.querySelector('.recharts-tooltip-wrapper')?.getAttribute('style'),
      ).toContain('visibility: visible'),
    );
    const tooltipWrapper = canvasElement.querySelector('.recharts-tooltip-wrapper') as HTMLElement;
    const tooltipSurface = within(tooltipWrapper).getByText('Móvil').closest('.bg-base-100');
    await expect(tooltipSurface?.className.split(' ')).toEqual(
      expect.arrayContaining(['bg-base-100', 'rounded-box', 'border-base-300', 'shadow-md']),
    );
  },
};

// 3. AreaChart: v1 scope (Bar/Line/Area). Smoke test: confirms render and CSS vars; the
// tooltip/legend behavior is already covered in detail by the two cases above.
export const AreaChartExample: Story = {
  render: () => (
    <ChartContainer config={chartConfig} className="max-w-2xl" style={testSize}>
      <AreaChart data={data}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent config={chartConfig} />} />
        <Area
          dataKey="escritorio"
          type="natural"
          fill="var(--color-escritorio)"
          stroke="var(--color-escritorio)"
          fillOpacity={0.2}
        />
        <Area
          dataKey="movil"
          type="natural"
          fill="var(--color-movil)"
          stroke="var(--color-movil)"
          fillOpacity={0.2}
        />
      </AreaChart>
    </ChartContainer>
  ),
  play: async ({ canvasElement }) => {
    const container = canvasElement.querySelector('div') as HTMLElement;
    await expect(container.style.getPropertyValue('--color-escritorio')).toBe(
      'var(--color-primary)',
    );
    await expect(container.style.getPropertyValue('--color-movil')).toBe('var(--color-secondary)');

    await waitFor(() =>
      expect(canvasElement.querySelector('svg.recharts-surface')).toBeInTheDocument(),
    );
  },
};

// Config and data shared by PieChartExample and RingChartExample: 4 categories, each one
// with its own token. Unlike Bar/Line/Area (one config entry per *series*),
// here it's one entry per *slice*.
const teamConfig: ChartConfig = {
  design: { label: 'Design', color: 'primary' },
  engineering: { label: 'Engineering', color: 'secondary' },
  product: { label: 'Product', color: 'accent' },
  sales: { label: 'Sales', color: 'success' },
};

const teamData = [
  { team: 'design', headcount: 28 },
  { team: 'engineering', headcount: 42 },
  { team: 'product', headcount: 19 },
  { team: 'sales', headcount: 17 },
];

// Simulates a mousemove over a Pie slice. Unlike Bar/Line/Area ("axis" tooltip,
// fired by a mousemove anywhere in the plot area, see hoverChartCenter), PieChart uses
// defaultTooltipEventType "item" (verified in PieChart.js): each
// <path class="recharts-pie-sector"> has its own onMouseEnter, and the Redux dispatch is
// synchronous (without mouseMoveAction's rAF throttle), but it requires mouseover: a native
// mouseenter doesn't fire React's synthetic onMouseEnter (which actually listens to
// mouseover/mouseout and computes enter/leave itself).
async function hoverFirstPieSector(canvasElement: HTMLElement) {
  await waitFor(() =>
    expect(canvasElement.querySelector('.recharts-pie-sector')).toBeInTheDocument(),
  );
  const sector = canvasElement.querySelector('.recharts-pie-sector') as SVGElement;
  fireEvent.mouseOver(sector, { bubbles: true });
  fireEvent.mouseMove(sector, { bubbles: true });
  await new Promise((resolve) => requestAnimationFrame(resolve));
}

// 4. Pie: config per slice (not per series). Confirms that ChartTooltipContent/
// ChartLegendContent resolve each slice by `name`/`value`, not by `dataKey` (the same
// string for all the slices of a Pie; see the comment in both components).
export const PieChartExample: Story = {
  render: () => (
    <ChartContainer config={teamConfig} className="max-w-md" style={testSize}>
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent config={teamConfig} />} />
        <ChartLegend content={<ChartLegendContent config={teamConfig} />} />
        <Pie data={teamData} dataKey="headcount" nameKey="team" isAnimationActive={false}>
          {teamData.map((entry) => (
            <Cell key={entry.team} fill={`var(--color-${entry.team})`} />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const container = canvasElement.querySelector('div') as HTMLElement;
    await expect(container.style.getPropertyValue('--color-design')).toBe('var(--color-primary)');
    await expect(container.style.getPropertyValue('--color-engineering')).toBe(
      'var(--color-secondary)',
    );
    await expect(container.style.getPropertyValue('--color-product')).toBe('var(--color-accent)');
    await expect(container.style.getPropertyValue('--color-sales')).toBe('var(--color-success)');

    // The legend uses the config labels ("Design"), not the raw ids of the data ("design").
    await expect(canvas.getByText('Design')).toBeInTheDocument();
    await expect(canvas.getByText('Engineering')).toBeInTheDocument();

    await hoverFirstPieSector(canvasElement);

    // teamData[0] is "design" -> first <Cell>/sector in the DOM.
    await waitFor(() =>
      expect(
        canvasElement.querySelector('.recharts-tooltip-wrapper')?.getAttribute('style'),
      ).toContain('visibility: visible'),
    );
    const tooltipWrapper = canvasElement.querySelector('.recharts-tooltip-wrapper') as HTMLElement;
    const withinTooltip = within(tooltipWrapper);
    await expect(withinTooltip.getByText('Design')).toBeInTheDocument();
    await expect(withinTooltip.getByText('28')).toBeInTheDocument();
    const swatch = tooltipWrapper.querySelector('span[style]') as HTMLElement;
    await expect(swatch.style.backgroundColor).toBe('var(--color-design)');
  },
};

// 5. Ring (donut): Pie with innerRadius/outerRadius + center text with the total.
// "Ring" isn't a new component: it's a direct composition of pieces already re-exported.
//
// The center text does NOT use <Label position="center">: tested against a real Pie, it
// renders nothing. Cause (Label.js, Recharts' own comment citing its issue #6030):
// for position="center" specifically, Label resolves the viewBox against the *cartesian*
// context instead of the *polar* one (a "quick fix" documented as such in its own code); a
// PieChart without axes never provides that cartesian context, so it stays undefined and the
// component renders nothing. It's a real bug/quirk of recharts@3.10.1, not a usage error.
// The fix is simpler than the original: a raw <text x="50%" y="50%"> as a child of <Pie>
// (Pie renders its children as they are, without filtering them; see Pie.js). The percentages
// resolve against the viewport of the <svg> itself, with no JS and without knowing the
// container size; it's still 100% inline SVG, no positioned div on top of the chart.
export const RingChartExample: Story = {
  render: () => {
    const total = teamData.reduce((sum, item) => sum + item.headcount, 0);

    return (
      <ChartContainer config={teamConfig} className="max-w-md" style={testSize}>
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent config={teamConfig} />} />
          <Pie
            data={teamData}
            dataKey="headcount"
            nameKey="team"
            innerRadius={55}
            outerRadius={85}
            isAnimationActive={false}
          >
            {teamData.map((entry) => (
              <Cell key={entry.team} fill={`var(--color-${entry.team})`} />
            ))}
            <text x="50%" y="50%" textAnchor="middle">
              <tspan x="50%" dy="-0.3em" className="fill-base-content text-2xl font-bold">
                {total}
              </tspan>
              <tspan x="50%" dy="1.4em" className="fill-base-content/65 text-xs">
                Personas
              </tspan>
            </text>
          </Pie>
        </PieChart>
      </ChartContainer>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // The total (28+42+19+17=106) shows as center text without an absolute overlay: it's a real
    // <tspan> inside the chart's <svg>, not a <div> positioned on top.
    await waitFor(() => expect(canvas.getByText('106')).toBeInTheDocument());
    const svg = canvasElement.querySelector('svg.recharts-surface');
    await expect(svg).toContainElement(canvas.getByText('106'));

    await hoverFirstPieSector(canvasElement);

    await waitFor(() =>
      expect(
        canvasElement.querySelector('.recharts-tooltip-wrapper')?.getAttribute('style'),
      ).toContain('visibility: visible'),
    );
    const tooltipWrapper = canvasElement.querySelector('.recharts-tooltip-wrapper') as HTMLElement;
    const withinTooltip = within(tooltipWrapper);
    await expect(withinTooltip.getByText('Design')).toBeInTheDocument();
    const swatch = tooltipWrapper.querySelector('span[style]') as HTMLElement;
    await expect(swatch.style.backgroundColor).toBe('var(--color-design)');
  },
};
