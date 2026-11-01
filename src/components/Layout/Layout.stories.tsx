import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
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
        {/* 1. Accessibility First. Positioned absolute (see SkipToContent.tsx), its place in
            the DOM doesn't affect the visual layout; it lives in the header so it isn't left outside
            any landmark (axe: region). */}
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
              {/* level keeps the h3 visual size; as fixes the h1->h3 jump (axe: heading-order) */}
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

    // axe: heading-order; "Main Area"/"Sidebar" jumped from h1 to h3 without going through h2.
    await expect(
      canvas.getByRole('heading', { level: 1, name: 'Dashboard Layout' }),
    ).toBeInTheDocument();
    const h2s = canvas.getAllByRole('heading', { level: 2 });
    await expect(h2s.map((h) => h.textContent)).toEqual(['Main Area', 'Sidebar']);
    // level is still h3 visually (same font size as before).
    await expect(h2s[0].className).toContain('text-2xl');

    // axe: region; the header and the skip link were outside any landmark.
    const banner = canvas.getByRole('banner');
    await expect(within(banner).getByText('My App')).toBeInTheDocument();
    await expect(within(banner).getByRole('link', { name: 'Skip to content' })).toBeInTheDocument();
  },
};

// SkipToContent uses children if it gets them; otherwise, "Skip to content". It's still
// server-safe: it uses no hooks or handlers of its own.
export const SkipToContentCustomText: StoryObj = {
  render: () => (
    <div className="relative h-24">
      <SkipToContent href="#contenido">Saltar al contenido</SkipToContent>
      <main id="contenido">Contenido</main>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Saltar al contenido' });
    await expect(link).toHaveAttribute('href', '#contenido');
    await expect(canvas.queryByText('Skip to content')).not.toBeInTheDocument();
  },
};

// Regression: SkipToContent used z-50, the same value as a typical fixed header; on a tie
// DOM order wins and the header (after the link) covered it when it got focus. Tag
// real-css: runs in the vitest project with Tailwind applied (see vitest.config.ts); without
// it, the link has no position or z-index and the test fails with any value. The header
// uses inline styles: what's tested is the link. elementFromPoint at the center of the
// link must return the link itself; waitFor waits for the transition to finish.
export const SkipToContentAboveFixedHeader: StoryObj = {
  tags: ['real-css'],
  render: () => (
    <div className="relative h-48">
      <SkipToContent />
      <header
        data-testid="fixed-header"
        style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 96, zIndex: 50 }}
        className="bg-base-200"
      >
        Cabecera fija
      </header>
      <main id="main-content" className="pt-28">
        Contenido
      </main>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Skip to content' });

    await userEvent.tab();
    await expect(link).toHaveFocus();

    await waitFor(() => {
      const rect = link.getBoundingClientRect();
      const top = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      expect(top?.closest('a, header')).toBe(link);
    });
  },
};

// The consumer's className still wins over the default z-index (tailwind-merge).
export const SkipToContentZIndexOverride: StoryObj = {
  render: () => (
    <div className="relative h-24">
      <SkipToContent className="z-10" />
      <main id="main-content">Contenido</main>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: 'Skip to content' });
    const classes = link.className.split(' ');
    await expect(classes).toContain('z-10');
    await expect(classes.filter((c) => /^z-\d+$/.test(c))).toEqual(['z-10']);
  },
};
