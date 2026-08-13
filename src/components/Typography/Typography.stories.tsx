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

// 1. Heading levels: los seis niveles h1-h6 renderizan la etiqueta semántica correcta.
// headingVariants solo define tamaño para h1-h4 (vía `level`); h5/h6 solo se alcanzan con
// `as`, no existe un `level="h5"` válido.
export const HeadingLevels: Story = {
  render: () => (
    <div className="space-y-2">
      <Heading level="h1">Heading 1</Heading>
      <Heading level="h2">Heading 2</Heading>
      <Heading level="h3">Heading 3</Heading>
      <Heading level="h4">Heading 4</Heading>
      <Heading as="h5">Heading 5</Heading>
      <Heading as="h6">Heading 6</Heading>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const h1 = canvas.getByText('Heading 1');
    await expect(h1.tagName).toBe('H1');
    await expect(h1.className.split(' ')).toContain('text-4xl');

    const h2 = canvas.getByText('Heading 2');
    await expect(h2.tagName).toBe('H2');
    await expect(h2.className.split(' ')).toContain('text-3xl');

    const h3 = canvas.getByText('Heading 3');
    await expect(h3.tagName).toBe('H3');
    await expect(h3.className.split(' ')).toContain('text-2xl');

    const h4 = canvas.getByText('Heading 4');
    await expect(h4.tagName).toBe('H4');
    await expect(h4.className.split(' ')).toContain('text-xl');

    await expect(canvas.getByText('Heading 5').tagName).toBe('H5');
    await expect(canvas.getByText('Heading 6').tagName).toBe('H6');
  },
};

// 2. Heading no tiene asChild/Slot: el mecanismo real para desacoplar el tag semántico del
// tamaño visual es la prop `as`, que gana sobre `level` para el tag renderizado pero no
// afecta las clases (headingVariants sigue usando `level` para el tamaño).
export const HeadingAsOverride: Story = {
  render: () => (
    <Heading level="h1" as="h2">
      Visually h1, semantically h2
    </Heading>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const heading = canvas.getByText('Visually h1, semantically h2');
    await expect(heading.tagName).toBe('H2');
    await expect(heading.className.split(' ')).toContain('text-4xl');
  },
};

// 3. Text: `size` aplica la clase correspondiente.
export const TextSizes: Story = {
  render: () => (
    <div className="space-y-2">
      <Text size="sm">Small text</Text>
      <Text size="md">Medium text</Text>
      <Text size="lg">Large text</Text>
      <Text size="lead">Lead text</Text>
      <Text size="muted">Muted text</Text>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Small text').className.split(' ')).toContain('text-sm');
    await expect(canvas.getByText('Medium text').className.split(' ')).toContain('text-base');
    await expect(canvas.getByText('Large text').className.split(' ')).toContain('text-lg');
    await expect(canvas.getByText('Lead text').className.split(' ')).toContain('text-xl');
    await expect(canvas.getByText('Muted text').className.split(' ')).toContain('text-sm');
  },
};

// 4. Text también resuelve el tag vía `as` (por defecto <p>), igual que Heading.
export const TextAsOverride: Story = {
  render: () => <Text as="span">Inline text</Text>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Inline text').tagName).toBe('SPAN');
  },
};
