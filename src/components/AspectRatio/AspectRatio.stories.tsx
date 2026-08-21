import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { AspectRatio } from './AspectRatio';
import { Image } from '../Image';

const meta: Meta<typeof AspectRatio> = {
  title: 'Components/AspectRatio',
  component: AspectRatio,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof AspectRatio>;

// PNG 1x1 embebido: sin dependencia de red externa (mismo valor ya usado en
// Image.stories.tsx y Avatar.stories.tsx). Acá el riesgo era más directo que en esos dos
// casos: Image (el propio del DS, no AvatarImage de Radix) se desmonta a sí misma si la
// carga falla y no hay fallback, y la play de abajo usa getByAltText sin find*/waitFor —
// un fallo de red externa habría hecho que ese assert síncrono no encontrara el <img>.
const TINY_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

// 1. Ratio puro: verifica el mecanismo real (padding-bottom % que calcula la propia primitiva
// de Radix a partir de ratio), no una medición de layout en vivo — getBoundingClientRect en el
// runner headless de vitest-browser puede no reflejar aún el padding-bottom trick en el momento
// en que corre play() (a diferencia del navegador real de Storybook, donde sí se verificó
// visualmente: la caja resultante es 16:9). El padding-bottom inline es lo que efectivamente
// dirige el layout en cualquier navegador estándar, así que es la comprobación más estable.
export const Default: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <AspectRatio ratio={16 / 9}>
        <div className="h-full w-full bg-primary" data-testid="ratio-content" />
      </AspectRatio>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const content = canvas.getByTestId('ratio-content');

    const wrapper = canvasElement.querySelector<HTMLElement>('[data-radix-aspect-ratio-wrapper]');
    await expect(wrapper).toBeInTheDocument();
    await expect(parseFloat(wrapper!.style.paddingBottom)).toBeCloseTo(100 / (16 / 9), 1);
    await expect(wrapper!.style.width).toBe('100%');

    // El contenido pasado como children cae en el div absolute inset-0 que Radix pone dentro
    // del wrapper — confirma que la composición cablea el hijo en el lugar correcto.
    await expect(wrapper).toContainElement(content);
  },
};

// 2. AspectRatio + Image: dos componentes separados que se componen entre sí, no una sola API
// con prop de ratio — mismo criterio que Popover/Calendar y Popover/DatePicker.
export const WithImage: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <AspectRatio ratio={16 / 9}>
        <Image src={TINY_PNG} alt="Cover photo" />
      </AspectRatio>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const img = canvas.getByAltText('Cover photo');

    const wrapper = canvasElement.querySelector<HTMLElement>('[data-radix-aspect-ratio-wrapper]');
    await expect(wrapper).toBeInTheDocument();
    await expect(wrapper).toContainElement(img);
    await expect(parseFloat(wrapper!.style.paddingBottom)).toBeCloseTo(100 / (16 / 9), 1);
  },
};
