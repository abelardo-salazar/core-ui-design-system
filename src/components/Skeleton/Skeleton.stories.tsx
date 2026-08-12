import type { Meta, StoryObj } from '@storybook/react';
import { expect } from 'storybook/test';
import { Skeleton } from './Skeleton';
// Asumimos que estos componentes ya existen de la Fase 1
import { Card, CardContent, CardFooter, CardHeader } from '../Card';

const meta = {
  title: 'Components/Feedback/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

// 1. Uso básico (Primitiva)
export const Default: Story = {
  args: {
    className: 'w-[100px] h-[20px] rounded-full',
  },
  play: async ({ canvasElement }) => {
    const skeleton = canvasElement.querySelector('.animate-pulse') as HTMLElement;
    await expect(skeleton).toBeInTheDocument();
    await expect(skeleton.className.split(' ')).toContain('bg-base-300');

    // Regresión: dark:bg-slate-200 llegó a ser idéntico al light mode. bg-base-300 depende de
    // --base-300, que sí cambia entre temas. El fixture de vitest-browser no expone estilos
    // derivados de utilidades de Tailwind vía getComputedStyle (mismo issue documentado en el
    // story Destructive de Button), así que la aserción va sobre el token crudo definido
    // directamente en :root / .dark, que sí es visible.
    const lightValue = getComputedStyle(document.documentElement).getPropertyValue('--base-300');
    document.documentElement.classList.add('dark');
    const darkValue = getComputedStyle(document.documentElement).getPropertyValue('--base-300');
    document.documentElement.classList.remove('dark');

    await expect(darkValue.trim()).not.toBe(lightValue.trim());
  },
};

// 2. Patrón de Tarjeta de Carga (Best Practice)
// Usamos la estructura real de la Card para que el layout no salte cuando cargue la data.
export const LoadingCard: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader className="gap-2">
        {/* Simulamos un Título */}
        <Skeleton className="h-6 w-1/2" />
        {/* Simulamos una Descripción */}
        <Skeleton className="h-4 w-4/5" />
      </CardHeader>

      <CardContent>
        {/* Simulamos un bloque de contenido o imagen */}
        <Skeleton className="h-[150px] w-full rounded-md" />
      </CardContent>

      <CardFooter>
        {/* Simulamos un botón */}
        <Skeleton className="h-10 w-28" />
      </CardFooter>
    </Card>
  ),
};

// 3. Patrón de Lista de Carga
export const AvatarList: Story = {
  render: () => (
    <div className="flex flex-col space-y-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      ))}
    </div>
  ),
};
