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
  ChartLegend,
  Line,
  LineChart,
  ChartTooltip,
  XAxis,
  YAxis,
} from './ChartPrimitives';
import type { ChartConfig } from './chartConfig';

// dataKeys sin tilde (escritorio/movil) a propósito: son identificadores usados también en
// "var(--color-<dataKey>)" y en atributos DOM — el label con tilde ("Móvil") vive aparte,
// solo en config.movil.label, que es lo único que se muestra en pantalla.
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

// Tamaño fijo en px, vía style inline en vez de las clases h-72/aspect-video que usaría un
// consumidor real. ResponsiveContainer necesita que su ancestro tenga una altura CSS real
// (no 0) para medir algo con su ResizeObserver; el entorno de test de
// @storybook/addon-vitest (Vitest browser mode) no carga las utilidades compiladas de
// Tailwind en el documento de test (verificado: aspect-ratio computado quedaba en "auto" y
// height en "0px" pese a las clases), así que las clases de Tailwind no alcanzan para darle
// tamaño acá. El inline style no depende de ninguna hoja de estilo, así que es la única vía
// determinística para este caso — no es representativo del uso real (ver Storybook con
// navegador real, donde `className="aspect-video ..."` sí funciona).
const testSize = { width: 600, height: 300 };

// Simula un mousemove sobre el centro del área de trazado del chart. Recharts calcula el
// punto activo a partir de mousemove/mouseover nativos capturados por RechartsWrapper, y
// despacha la actualización de estado (Redux) vía requestAnimationFrame (throttle interno,
// ver mouseEventsMiddleware.js) — por eso hace falta esperar un frame después del evento.
// userEvent.hover() (verificado) no alcanza acá: solo garantiza pointerenter/mouseenter, no
// un mousemove con clientX/clientY, que es lo que Recharts necesita para resolver el índice
// activo — fireEvent con coordenadas explícitas sí lo dispara de forma confiable.
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

// 1. BarChart: confirma que ChartContainer inyecta --color-<dataKey> según config, y que
// ChartTooltipContent aparece con la superficie y los tokens correctos al hacer hover.
export const BarChartExample: Story = {
  render: () => (
    <ChartContainer config={chartConfig} className="max-w-2xl" style={testSize}>
      <BarChart data={data}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent config={chartConfig} />} />
        <ChartLegend content={<ChartLegendContent config={chartConfig} />} />
        {/* isAnimationActive=false solo en esta demo de test: Recharts anima la entrada
        (altura 0 -> real) por default; sin esto, el hover puede caer sobre un <path>
        todavía sin área durante el primer frame. No aplica a un consumidor real. */}
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

    // ChartContainer es el primer div del render (el que envuelve ResponsiveContainer).
    const container = canvasElement.querySelector('div') as HTMLElement;
    await expect(container.style.getPropertyValue('--color-escritorio')).toBe(
      'var(--color-primary)',
    );
    await expect(container.style.getPropertyValue('--color-movil')).toBe('var(--color-secondary)');

    // ResponsiveContainer mide su tamaño real vía ResizeObserver de forma asíncrona: en el
    // primer render (antes de que dispare) renderiza un div de 0x0 sin el chart adentro
    // todavía. Hay que esperar a que aparezca el <svg> antes de buscar leyenda/tooltip.
    await waitFor(() =>
      expect(canvasElement.querySelector('svg.recharts-surface')).toBeInTheDocument(),
    );
    const svg = canvasElement.querySelector('svg.recharts-surface') as SVGSVGElement;

    // La leyenda usa ChartLegendContent: labels de config, no los dataKeys crudos.
    await expect(canvas.getByText('Escritorio')).toBeInTheDocument();
    await expect(canvas.getByText('Móvil')).toBeInTheDocument();

    await hoverChartCenter(svg);

    // El tooltip por default de Recharts no aparece en el DOM hasta el primer mousemove.
    // ChartTooltipContent reemplaza ese contenido, montado dentro de .recharts-tooltip-wrapper
    // (el label de cada serie se repite en la leyenda, por eso se busca acotado a ese wrapper
    // en vez de con getAllByText a secas — el orden de ambos en el DOM no está garantizado).
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

// 2. LineChart: mismo tipo de verificación que BarChart, sobre un tipo de chart distinto.
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

// 3. AreaChart: alcance v1 (Bar/Line/Area). Smoke test — confirma render y CSS vars; el
// comportamiento de tooltip/leyenda ya está cubierto en detalle por los dos casos de arriba.
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
