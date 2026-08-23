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

// Config y data compartidos por PieChartExample y RingChartExample: 4 categorías, cada una
// con su propio token — a diferencia de Bar/Line/Area (una entrada de config por *serie*),
// acá es una entrada por *porción*.
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

// Simula un mousemove sobre una porción de Pie. A diferencia de Bar/Line/Area (tooltip tipo
// "axis", disparado por mousemove en cualquier punto del área de trazado — ver
// hoverChartCenter), PieChart usa defaultTooltipEventType "item" (verificado en
// PieChart.js): cada <path class="recharts-pie-sector"> tiene su propio onMouseEnter, y el
// dispatch a Redux es síncrono (sin el throttle por rAF de mouseMoveAction), pero requiere
// mouseover — mouseenter nativo no dispara el onMouseEnter sintético de React (que en
// realidad escucha mouseover/mouseout y calcula el enter/leave él mismo).
async function hoverFirstPieSector(canvasElement: HTMLElement) {
  await waitFor(() =>
    expect(canvasElement.querySelector('.recharts-pie-sector')).toBeInTheDocument(),
  );
  const sector = canvasElement.querySelector('.recharts-pie-sector') as SVGElement;
  fireEvent.mouseOver(sector, { bubbles: true });
  fireEvent.mouseMove(sector, { bubbles: true });
  await new Promise((resolve) => requestAnimationFrame(resolve));
}

// 4. Pie: config por porción (no por serie). Confirma que ChartTooltipContent/
// ChartLegendContent resuelven cada porción por `name`/`value`, no por `dataKey` (el mismo
// string para todas las porciones de un Pie — ver comentario en ambos componentes).
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

    // La leyenda usa las labels de config ("Design"), no los ids crudos de la data ("design").
    await expect(canvas.getByText('Design')).toBeInTheDocument();
    await expect(canvas.getByText('Engineering')).toBeInTheDocument();

    await hoverFirstPieSector(canvasElement);

    // teamData[0] es "design" -> primer <Cell>/sector en el DOM.
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

// 5. Ring (donut): Pie con innerRadius/outerRadius + texto central con el total.
// "Ring" no es un componente nuevo — es composición directa de piezas ya re-exportadas.
//
// El texto central NO usa <Label position="center">: probado contra un Pie real, no
// renderiza nada. Causa (Label.js, comentario propio de Recharts citando su issue #6030):
// para position="center" específicamente, Label resuelve el viewBox contra el contexto
// *cartesiano* en vez del *polar* ("quick fix" documentado como tal en su propio código) —
// un PieChart sin ejes nunca provee ese contexto cartesiano, así que queda undefined y el
// componente no renderiza nada. Es un bug/quirk real de recharts@3.10.1, no un error de uso.
// El fix es más simple que el original: un <text x="50%" y="50%"> crudo como hijo de <Pie>
// (Pie renderiza sus children tal cual, sin filtrarlos — ver Pie.js). Los porcentajes se
// resuelven contra el viewport del propio <svg>, sin JS ni conocer el tamaño del contenedor
// — sigue siendo 100% SVG inline, ningún div posicionado por encima del chart.
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

    // El total (28+42+19+17=106) se ve como texto central sin overlay absoluto: es un <tspan>
    // real dentro del <svg> del chart, no un <div> posicionado encima.
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
