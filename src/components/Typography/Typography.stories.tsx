import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { Heading, Text } from './Typography';

const meta: Meta = {
  title: 'Components/Typography',
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj;

// 1. Heading levels: the six levels h1-h6 render the correct semantic tag.
// headingVariants only defines a size for h1-h4 (through `level`); h5/h6 are only reachable with
// `as`, there's no valid `level="h5"`.
export const HeadingLevels: Story = {
  render: () => (
    <div className="space-y-2">
      <Heading level="h1">Encabezado 1</Heading>
      <Heading level="h2">Encabezado 2</Heading>
      <Heading level="h3">Encabezado 3</Heading>
      <Heading level="h4">Encabezado 4</Heading>
      <Heading as="h5">Encabezado 5</Heading>
      <Heading as="h6">Encabezado 6</Heading>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const h1 = canvas.getByText('Encabezado 1');
    await expect(h1.tagName).toBe('H1');
    await expect(h1.className.split(' ')).toContain('text-4xl');

    const h2 = canvas.getByText('Encabezado 2');
    await expect(h2.tagName).toBe('H2');
    await expect(h2.className.split(' ')).toContain('text-3xl');

    const h3 = canvas.getByText('Encabezado 3');
    await expect(h3.tagName).toBe('H3');
    await expect(h3.className.split(' ')).toContain('text-2xl');

    const h4 = canvas.getByText('Encabezado 4');
    await expect(h4.tagName).toBe('H4');
    await expect(h4.className.split(' ')).toContain('text-xl');

    await expect(canvas.getByText('Encabezado 5').tagName).toBe('H5');
    await expect(canvas.getByText('Encabezado 6').tagName).toBe('H6');
  },
};

// 2. Heading has no asChild/Slot: the real mechanism to decouple the semantic tag from the
// visual size is the `as` prop, which wins over `level` for the rendered tag but doesn't
// affect the classes (headingVariants still uses `level` for the size).
export const HeadingAsOverride: Story = {
  render: () => (
    <Heading level="h1" as="h2">
      Visualmente h1, semánticamente h2
    </Heading>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const heading = canvas.getByText('Visualmente h1, semánticamente h2');
    await expect(heading.tagName).toBe('H2');
    await expect(heading.className.split(' ')).toContain('text-4xl');
  },
};

// 3. Text: `size` applies the matching class.
export const TextSizes: Story = {
  render: () => (
    <div className="space-y-2">
      <Text size="sm">Texto pequeño</Text>
      <Text size="md">Texto mediano</Text>
      <Text size="lg">Texto grande</Text>
      <Text size="lead">Texto destacado</Text>
      <Text size="muted">Texto atenuado</Text>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Texto pequeño').className.split(' ')).toContain('text-sm');
    await expect(canvas.getByText('Texto mediano').className.split(' ')).toContain('text-base');
    await expect(canvas.getByText('Texto grande').className.split(' ')).toContain('text-lg');
    await expect(canvas.getByText('Texto destacado').className.split(' ')).toContain('text-xl');
    await expect(canvas.getByText('Texto atenuado').className.split(' ')).toContain('text-sm');
  },
};

// 4. Text also resolves the tag through `as` (<p> by default), same as Heading.
export const TextAsOverride: Story = {
  render: () => <Text as="span">Texto en línea</Text>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Texto en línea').tagName).toBe('SPAN');
  },
};
