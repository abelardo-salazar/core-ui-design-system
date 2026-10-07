import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { FileTextIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons';
import {
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
} from './EmptyState';
import { Button } from '../Button';

const meta = {
  title: 'Components/Feedback/EmptyState',
  component: EmptyState,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

// size llega a la raíz como data-size, nunca como atributo size suelto.
const expectRoot = async (title: HTMLElement, size: 'sm' | 'md') => {
  const root = title.closest('[data-size]')!;
  await expect(root).toHaveAttribute('data-size', size);
  await expect(root).not.toHaveAttribute('size');
  await expect(root).not.toHaveAttribute('role');
};

export const Page: Story = {
  render: () => (
    <EmptyState>
      <EmptyStateIcon>
        <FileTextIcon />
      </EmptyStateIcon>
      <EmptyStateTitle>Todavía no hay documentos</EmptyStateTitle>
      <EmptyStateDescription>
        Creá tu primer documento para empezar a trabajar con tu equipo.
      </EmptyStateDescription>
      <EmptyStateActions>
        <Button>Crear documento</Button>
        <Button variant="outline">Importar</Button>
      </EmptyStateActions>
    </EmptyState>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const title = canvas.getByText('Todavía no hay documentos');
    await expect(title.tagName).toBe('P');
    await expectRoot(title, 'md');

    // Ícono decorativo: aria-hidden en el contenedor, que también da el tamaño del SVG.
    const icon = canvasElement.querySelector('svg')!.parentElement!;
    await expect(icon).toHaveAttribute('aria-hidden', 'true');
    await expect(icon).toHaveClass('[&_svg]:size-6');
  },
};

export const PageTextOnly: Story = {
  render: () => (
    <EmptyState>
      <EmptyStateTitle>Sin notificaciones</EmptyStateTitle>
      <EmptyStateDescription>Te avisaremos cuando haya algo nuevo.</EmptyStateDescription>
    </EmptyState>
  ),
  play: async ({ canvasElement }) => {
    const title = within(canvasElement).getByText('Sin notificaciones');
    await expect(title.tagName).toBe('P');
    await expectRoot(title, 'md');
    await expect(canvasElement.querySelector('[aria-hidden]')).toBeNull();
  },
};

export const Small: Story = {
  render: () => (
    <div className="max-w-sm rounded-box border border-base-300">
      <EmptyState size="sm">
        <EmptyStateIcon>
          <MagnifyingGlassIcon />
        </EmptyStateIcon>
        <EmptyStateTitle>Sin resultados</EmptyStateTitle>
        <EmptyStateDescription>Probá con otros términos de búsqueda.</EmptyStateDescription>
        <EmptyStateActions>
          <Button size="sm" variant="outline">
            Limpiar filtros
          </Button>
        </EmptyStateActions>
      </EmptyState>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const title = within(canvasElement).getByText('Sin resultados');
    await expect(title.tagName).toBe('P');
    await expectRoot(title, 'sm');

    const icon = canvasElement.querySelector('svg')!.parentElement!;
    await expect(icon).toHaveAttribute('aria-hidden', 'true');
    // El fixture headless no aplica Tailwind: se comprueba que el override sm existe; los
    // tamaños reales se verificaron en Storybook con un navegador real.
    await expect(icon).toHaveClass('group-data-[size=sm]/empty-state:[&_svg]:size-5');
  },
};

export const SmallTextOnly: Story = {
  render: () => (
    <div className="max-w-sm rounded-box border border-base-300">
      <EmptyState size="sm">
        <EmptyStateTitle>Sin actividad reciente</EmptyStateTitle>
      </EmptyState>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const title = within(canvasElement).getByText('Sin actividad reciente');
    await expect(title.tagName).toBe('P');
    await expectRoot(title, 'sm');
  },
};

// Cuando el estado vacío ocupa una sección o página, el consumidor elige el nivel.
export const HeadingTitle: Story = {
  render: () => (
    <EmptyState>
      <EmptyStateIcon>
        <FileTextIcon />
      </EmptyStateIcon>
      <EmptyStateTitle as="h2">Tu bandeja está vacía</EmptyStateTitle>
      <EmptyStateDescription>Los mensajes nuevos van a aparecer acá.</EmptyStateDescription>
    </EmptyState>
  ),
  play: async ({ canvasElement }) => {
    const heading = within(canvasElement).getByRole('heading', {
      level: 2,
      name: 'Tu bandeja está vacía',
    });
    await expectRoot(heading, 'md');
  },
};
