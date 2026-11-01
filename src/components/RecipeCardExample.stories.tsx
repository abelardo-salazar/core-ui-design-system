import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './Card';
import { AspectRatio } from './AspectRatio';
import { Image } from './Image';
import { Chip } from './Chip';

// Compositional example (Examples/*), not a new DS component: checks that Card,
// AspectRatio, Image and Chip (the new pieces from the Wellness + Nutrition +
// Recipe book session) combine without friction. Same kind of story as FormDemo.stories.tsx
// (a loose composition in src/components/, not a component folder of its own).
const meta: Meta = {
  title: 'Examples/RecipeCard',
  parameters: { layout: 'centered' },
};

export default meta;

// Embedded 1x1 PNG; same criterion applied in the fix for Image.stories.tsx's flake:
// no dependency on an external network in any new story from here on.
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

// Smoke test: the full composition mounts without errors, Image loads inside
// AspectRatio/Card without breaking the layout, and toggling a Chip doesn't affect the rest of the
// pieces. It doesn't repeat the exhaustive assertions that Card/AspectRatio/Image/Chip already have
// in their own story files.
export const RecipeCard: StoryObj = {
  render: () => <RecipeCardDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('heading', { name: 'Bowl de quinoa con vegetales' }),
    ).toBeInTheDocument();

    // Image's skeleton -> loaded cycle inside AspectRatio: same waiting pattern as
    // Image.stories.tsx LoadsSuccessfully.
    const img = canvas.getByAltText('Bowl de quinoa con vegetales');
    await waitFor(() => expect(img.complete && img.naturalWidth > 0).toBe(true));

    const vegetarianChip = canvas.getByRole('button', { name: 'Vegetariano' });
    const quickChip = canvas.getByRole('button', { name: 'Rápido' });
    await expect(vegetarianChip).toHaveAttribute('data-state', 'on');
    await expect(quickChip).toHaveAttribute('data-state', 'off');

    // Cross interaction: toggling a Chip doesn't break the Card/AspectRatio/Image layout.
    await userEvent.click(quickChip);
    await expect(quickChip).toHaveAttribute('data-state', 'on');
    await expect(vegetarianChip).toHaveAttribute('data-state', 'on');
    await expect(
      canvas.getByRole('heading', { name: 'Bowl de quinoa con vegetales' }),
    ).toBeInTheDocument();
    await expect(img).toBeVisible();
  },
};
