import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './Card';
import { Button } from '../Button';
import { Input } from '../Input';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: {
    // Limits the width for better visualization in docs
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

// 1. Simple Card (Notification style)
export const Simple: Story = {
  render: () => (
    <Card className="w-87.5">
      <CardHeader>
        <CardTitle>Crear proyecto</CardTitle>
        <CardDescription>Despliega tu nuevo proyecto con un clic.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-base-content/80">
          Tu proyecto se desplegará en la red perimetral al instante.
        </p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="ghost">Cancelar</Button>
        <Button>Desplegar</Button>
      </CardFooter>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // CardTitle uses <h3> semantically.
    await expect(
      canvas.getByRole('heading', { level: 3, name: 'Crear proyecto' }),
    ).toBeInTheDocument();
    await expect(canvas.getByText('Despliega tu nuevo proyecto con un clic.')).toBeInTheDocument();
    await expect(
      canvas.getByText('Tu proyecto se desplegará en la red perimetral al instante.'),
    ).toBeInTheDocument();

    // CardFooter: exported but not mentioned in any test until now. We confirm that
    // both buttons share the same container (it composes correctly) and that it keeps its
    // base classes in addition to the ones the consumer adds (className is merged, not replaced).
    const cancelButton = canvas.getByRole('button', { name: 'Cancelar' });
    const deployButton = canvas.getByRole('button', { name: 'Desplegar' });
    const footer = cancelButton.parentElement;

    await expect(footer).toBe(deployButton.parentElement);
    await expect(footer?.className.split(' ')).toEqual(
      expect.arrayContaining(['flex', 'items-center', 'p-6', 'pt-0', 'justify-between']),
    );
  },
};

// 2. Interactive Card (Login Form simulation)
export const LoginForm: Story = {
  render: () => (
    <Card className="w-95">
      <CardHeader>
        <CardTitle>Acceso</CardTitle>
        <CardDescription>Ingresa tus credenciales para acceder a la cuenta.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input id="email" label="Correo electrónico" placeholder="m@example.com" type="email" />
        </div>
        <div className="space-y-2">
          <Input id="password" label="Contraseña" type="password" />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button fullWidth>Entrar</Button>
        <Button variant="link" size="sm" className="text-xs">
          ¿Olvidaste tu contraseña?
        </Button>
      </CardFooter>
    </Card>
  ),
};

// 3. Image Card (Blog Post style)
export const BlogPost: Story = {
  render: () => (
    <Card className="w-87.5 overflow-hidden">
      {/* Custom image directly inside Card (flexibility of compound components) */}
      <div className="h-48 w-full bg-neutral/10 flex items-center justify-center">
        <span className="text-4xl">🖼️</span>
      </div>
      <CardHeader>
        <CardTitle>Sistemas de diseño 101</CardTitle>
        <CardDescription>Aprende a construir bibliotecas de UI escalables.</CardDescription>
      </CardHeader>
      <CardFooter>
        <Button variant="outline" fullWidth>
          Leer artículo
        </Button>
      </CardFooter>
    </Card>
  ),
};

const sizedCard = (size: 'md' | 'sm' | undefined, label: string) => (
  <Card size={size} aria-label={label} className="w-72">
    <CardHeader>
      <CardTitle>Plan {label}</CardTitle>
      <CardDescription>Facturación mensual.</CardDescription>
    </CardHeader>
    <CardContent>
      <p className="text-sm">Hasta 5 proyectos.</p>
    </CardContent>
    <CardFooter>
      <Button size="sm">Elegir</Button>
    </CardFooter>
  </Card>
);

// 4. size: the root only gets data-size and the named group (size never reaches the DOM as an
// attribute); each part carries its md padding and the sm override, active only under an sm Card.
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {sizedCard(undefined, 'por defecto')}
      {sizedCard('sm', 'compacto')}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const byDefault = canvas.getByLabelText('por defecto');
    const compact = canvas.getByLabelText('compacto');

    await expect(byDefault).toHaveAttribute('data-size', 'md');
    await expect(compact).toHaveAttribute('data-size', 'sm');
    for (const card of [byDefault, compact]) {
      await expect(card).toHaveClass('group/card');
      await expect(card).not.toHaveAttribute('size');
      const [header, content, footer] = [...card.children] as HTMLElement[];
      await expect(header).toHaveClass('p-6', 'group-data-[size=sm]/card:p-4');
      for (const part of [content, footer]) {
        await expect(part).toHaveClass(
          'p-6',
          'pt-0',
          'group-data-[size=sm]/card:px-4',
          'group-data-[size=sm]/card:pb-4',
        );
        // Not p-4: in sm it would also beat the base's pt-0.
        await expect(part).not.toHaveClass('group-data-[size=sm]/card:p-4');
      }
    }
  },
};

const paddings = (element: Element) => {
  const { paddingTop, paddingRight, paddingBottom, paddingLeft } = getComputedStyle(element);
  return [paddingTop, paddingRight, paddingBottom, paddingLeft].join(' ');
};

// 5. size with the CSS applied: md keeps 24px, sm is 16px, and content/footer keep no top padding
// in both.
export const SizePadding: Story = {
  tags: ['real-css'],
  render: Sizes.render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const cases = [
      ['por defecto', '24px', '24px 24px 24px 24px', '0px 24px 24px 24px'],
      ['compacto', '16px', '16px 16px 16px 16px', '0px 16px 16px 16px'],
    ] as const;
    for (const [label, size, header, body] of cases) {
      const [headerEl, content, footer] = [...canvas.getByLabelText(label).children];
      await expect(paddings(headerEl), `${label} (${size}) header`).toBe(header);
      await expect(paddings(content), `${label} (${size}) content`).toBe(body);
      await expect(paddings(footer), `${label} (${size}) footer`).toBe(body);
    }
  },
};
