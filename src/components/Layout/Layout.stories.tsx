import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { Container } from './Container';
import { Separator } from './Separator';
import { SkipToContent } from './SkipToContent';
import { Heading, Text } from '../Typography';
import { Card } from '../Card';

const meta: Meta = {
  title: 'Components/Layout',
  parameters: {
    layout: 'fullscreen', // Important to test Container behavior
  },
};

export default meta;

export const PageExample: StoryObj = {
  render: () => (
    <div className="min-h-screen bg-base-100 relative">
      {/* 2. Header Simulation */}
      <header className="border-b border-base-300 py-4">
        {/* 1. Accessibility First. Posicionado absolute (ver SkipToContent.tsx), su lugar en
            el DOM no afecta el layout visual; vive en el header para no quedar fuera de
            cualquier landmark (axe: region). */}
        <SkipToContent />
        <Container className="flex items-center justify-between">
          <Heading level="h4">My App</Heading>
          <nav className="flex gap-4 text-sm font-medium">
            <a href="/" className="hover:text-primary">
              Home
            </a>
            <a href="/about" className="hover:text-primary">
              About
            </a>
          </nav>
        </Container>
      </header>

      {/* 3. Main Content */}
      <main id="main-content" className="py-8">
        <Container>
          <Heading level="h1" className="mb-4">
            Dashboard Layout
          </Heading>
          <Text className="mb-8" size="lead">
            This example demonstrates how the Container constrains content width and how Separators
            divide sections.
          </Text>

          <Separator className="my-8" />

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              {/* level mantiene el tamaño visual h3; as corrige el salto h1->h3 (axe: heading-order) */}
              <Heading level="h3" as="h2">
                Main Area
              </Heading>
              <Card className="h-64 flex items-center justify-center bg-base-200/50">
                <Text>Content Block 1</Text>
              </Card>
              <Card className="h-64 flex items-center justify-center bg-base-200/50">
                <Text>Content Block 2</Text>
              </Card>
            </div>

            <div className="space-y-4">
              <Heading level="h3" as="h2">
                Sidebar
              </Heading>
              <div className="flex flex-col gap-4">
                <div className="flex h-5 items-center space-x-4 text-sm">
                  <div>Blog</div>
                  <Separator orientation="vertical" />
                  <div>Docs</div>
                  <Separator orientation="vertical" />
                  <div>Source</div>
                </div>
                <Card className="h-40 bg-base-200/50 flex items-center justify-center">
                  <Text>Ad / Widget</Text>
                </Card>
              </div>
            </div>
          </div>
        </Container>
      </main>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // axe: heading-order — "Main Area"/"Sidebar" saltaban de h1 a h3 sin pasar por h2.
    await expect(canvas.getByRole('heading', { level: 1, name: 'Dashboard Layout' })).toBeInTheDocument();
    const h2s = canvas.getAllByRole('heading', { level: 2 });
    await expect(h2s.map((h) => h.textContent)).toEqual(['Main Area', 'Sidebar']);
    // level sigue siendo h3 visualmente (mismo tamaño de fuente que antes).
    await expect(h2s[0].className).toContain('text-2xl');

    // axe: region — el header y el skip-link quedaban fuera de cualquier landmark.
    const banner = canvas.getByRole('banner');
    await expect(within(banner).getByText('My App')).toBeInTheDocument();
    await expect(within(banner).getByRole('link', { name: 'Skip to content' })).toBeInTheDocument();
  },
};
