import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './Card';
import { AspectRatio } from './AspectRatio';
import { Image } from './Image';
import { Chip } from './Chip';

// Ejemplo compositivo (Examples/*), no un componente nuevo del DS: valida que Card,
// AspectRatio, Image y Chip —las piezas nuevas de la sesión de Bienestar + Nutrición +
// Recetario— se combinan sin fricción. Mismo tipo de story que FormDemo.stories.tsx
// (composición suelta en src/components/, no una carpeta de componente propia).
const meta: Meta = {
  title: 'Examples/RecipeCard',
  parameters: { layout: 'centered' },
};

export default meta;

// PNG 1x1 embebido — mismo criterio aplicado en el fix del flake de Image.stories.tsx:
// sin dependencia de red externa en ningún story nuevo de acá en adelante.
const TINY_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

interface Tag {
  id: string;
  label: string;
  pressed: boolean;
}

const INITIAL_TAGS: Tag[] = [
  { id: 'vegetariano', label: 'Vegetariano', pressed: true },
  { id: 'rapido', label: 'Rápido', pressed: false },
  { id: 'sin-gluten', label: 'Sin gluten', pressed: false },
];

const RecipeCardDemo = () => {
  const [tags, setTags] = React.useState(INITIAL_TAGS);

  return (
    <Card className="w-80 overflow-hidden">
      <AspectRatio ratio={16 / 9}>
        <Image
          src={TINY_PNG}
          alt="Bowl de quinoa con vegetales"
          fallback={
            <span className="flex h-full w-full items-center justify-center bg-base-200 text-xs text-base-content">
              Sin imagen
            </span>
          }
        />
      </AspectRatio>
      <CardHeader>
        <CardTitle>Bowl de quinoa con vegetales</CardTitle>
        <CardDescription>Receta · Nutrición</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2 pt-0">
        {tags.map((tag) => (
          <Chip
            key={tag.id}
            variant="outline"
            pressed={tag.pressed}
            onPressedChange={(pressed) =>
              setTags((prev) => prev.map((t) => (t.id === tag.id ? { ...t, pressed } : t)))
            }
          >
            {tag.label}
          </Chip>
        ))}
      </CardContent>
    </Card>
  );
};

// Smoke test: la composición completa monta sin errores, Image carga dentro de
// AspectRatio/Card sin romper el layout, y togglear un Chip no afecta al resto de las
// piezas. No repite las aserciones exhaustivas que Card/AspectRatio/Image/Chip ya tienen
// en sus propios archivos de stories.
export const RecipeCard: StoryObj = {
  render: () => <RecipeCardDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('heading', { name: 'Bowl de quinoa con vegetales' }),
    ).toBeInTheDocument();

    // Ciclo skeleton -> loaded de Image dentro de AspectRatio: mismo patrón de espera que
    // Image.stories.tsx LoadsSuccessfully.
    const img = canvas.getByAltText('Bowl de quinoa con vegetales');
    await waitFor(() => expect(img.complete && img.naturalWidth > 0).toBe(true));

    const vegetarianChip = canvas.getByRole('button', { name: 'Vegetariano' });
    const quickChip = canvas.getByRole('button', { name: 'Rápido' });
    await expect(vegetarianChip).toHaveAttribute('data-state', 'on');
    await expect(quickChip).toHaveAttribute('data-state', 'off');

    // Interacción cruzada: togglear un Chip no rompe el layout de Card/AspectRatio/Image.
    await userEvent.click(quickChip);
    await expect(quickChip).toHaveAttribute('data-state', 'on');
    await expect(vegetarianChip).toHaveAttribute('data-state', 'on');
    await expect(
      canvas.getByRole('heading', { name: 'Bowl de quinoa con vegetales' }),
    ).toBeInTheDocument();
    await expect(img).toBeVisible();
  },
};
