import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { Avatar, AvatarImage, AvatarFallback } from './Avatar';
import { Badge } from '../Badge';

const meta: Meta<typeof Avatar> = {
  title: 'Components/DataDisplay',
  component: Avatar,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Avatar>;

// 1. Avatar
export const UserProfile: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="text-sm font-bold">Shadcn</span>
        <span className="text-xs text-base-content">Creator</span>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Fix del commit 8dd5b87 (axe: image-alt). Radix AvatarImage solo monta el <img> una vez
    // que la carga resuelve, de ahí el find* async (ver UserCard más abajo para el mismo patrón).
    await expect(await canvas.findByAltText('@shadcn')).toBeInTheDocument();
  },
};

// 2. Fallback
export const FallbackState: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar>
        <AvatarImage src="/broken-image.jpg" alt="@user" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
      <span className="text-sm">John Doe (No image)</span>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // AvatarFallback se muestra mientras el status de carga no sea "loaded" (idle/loading/error
    // por igual, verificado en el código de @radix-ui/react-avatar). Con un src que 404 dentro
    // del propio origin (sin dependencia de red externa), el status nunca llega a "loaded".
    await expect(canvas.getByText('JD')).toBeInTheDocument();

    // Le damos tiempo al intento de carga (404) a resolver antes de confirmar la ausencia:
    // AvatarImage (Radix) no renderiza el <img> en el DOM hasta que el status sea "loaded".
    await new Promise((resolve) => setTimeout(resolve, 300));

    await expect(canvas.queryByAltText('@user')).not.toBeInTheDocument();
    await expect(canvas.getByText('JD')).toBeInTheDocument();
  },
};

// 3. Badges Showcase
export const Badges: Story = {
  render: () => (
    <div className="flex gap-2">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Removed</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const destructiveBadge = canvas.getByText('Removed');
    // Mismo token error-content que Button destructive (ver Button.stories.tsx para el porqué
    // de comprobar el custom property crudo en vez de getComputedStyle().color acá).
    await expect(destructiveBadge.className.split(' ')).toContain('text-error-content');
    await expect(getComputedStyle(document.documentElement).getPropertyValue('--error-content')).toBe(
      '#000000',
    );

    // Hover: mismo caso que Button destructive — --error-focus (fondo) es oscuro mientras
    // --error (fondo base) es claro, así que hace falta -focus-content propio para el texto.
    await expect(destructiveBadge.className.split(' ')).toContain('hover:text-error-focus-content');
    await expect(
      getComputedStyle(document.documentElement).getPropertyValue('--error-focus-content'),
    ).toBe('#ffffff');

    // Dark mode invierte cuál color necesita más contraste (--error-focus pasa a ser un rojo
    // claro), así que --error-focus-content también se invierte: negro, no blanco.
    document.documentElement.classList.add('dark');
    await expect(
      getComputedStyle(document.documentElement).getPropertyValue('--error-focus-content'),
    ).toBe('#000000');
    document.documentElement.classList.remove('dark');
  },
};

// 4. Integración Real (Card + Avatar + Badge)
import { Card, CardHeader, CardTitle } from '../Card';

export const UserCard: Story = {
  render: () => (
    <Card className="w-75">
      <CardHeader className="flex-row gap-4 items-center space-y-0">
        <Avatar className="h-12 w-12">
          <AvatarImage src="https://github.com/google.png" alt="Google Team logo" />
          <AvatarFallback>GL</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1">
          <CardTitle className="text-base">Google Team</CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-[10px] px-1 py-0 h-5">
              Enterprise
            </Badge>
            <Badge className="text-[10px] px-1 py-0 h-5">Pro</Badge>
          </div>
        </div>
      </CardHeader>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // axe: image-alt — AvatarImage se renderizaba sin alt (las otras dos stories de Avatar sí lo pasan).
    // AvatarImage (Radix) solo monta el <img> una vez que la carga de red resuelve, de ahí el find* async.
    await expect(await canvas.findByAltText('Google Team logo')).toBeInTheDocument();
  },
};
