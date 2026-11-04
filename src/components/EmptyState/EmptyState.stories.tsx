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

// size reaches the root as data-size, never as a loose size attribute.
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
        Crea tu primer documento para empezar a trabajar con tu equipo.
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

    // Decorative icon: aria-hidden on the container, which also sets the SVG size.
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
        <EmptyStateDescription>Prueba con otros términos de búsqueda.</EmptyStateDescription>
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
    // The headless fixture doesn't apply Tailwind: it checks that the sm override exists; the
    // real sizes were checked in Storybook with a real browser.
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

// When the empty state fills a section or page, the consumer picks the level.
export const HeadingTitle: Story = {
  render: () => (
    <EmptyState>
      <EmptyStateIcon>
        <FileTextIcon />
      </EmptyStateIcon>
      <EmptyStateTitle as="h2">Tu bandeja está vacía</EmptyStateTitle>
      <EmptyStateDescription>Los mensajes nuevos aparecerán aquí.</EmptyStateDescription>
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

// The consumer's className wins over size's padding: cva + twMerge resolve the
// conflict. With an attribute variant (data-[size=sm]:py-6) the selector would have more
// specificity and py-2 would lose.
export const SmallCustomPadding: Story = {
  render: () => (
    <EmptyState size="sm" className="py-2">
      <EmptyStateTitle>Sin elementos</EmptyStateTitle>
    </EmptyState>
  ),
  play: async ({ canvasElement }) => {
    const root = within(canvasElement).getByText('Sin elementos').closest('[data-size]')!;
    await expect(root).toHaveAttribute('data-size', 'sm');
    await expect(root).toHaveClass('py-2', 'px-4');
    await expect(root).not.toHaveClass('py-6');
    await expect(root.className).not.toMatch(/data-\[size=/);
  },
};
