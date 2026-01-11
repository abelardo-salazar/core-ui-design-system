import type { Meta, StoryObj } from '@storybook/react';
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
      {/* 1. Accessibility First */}
      <SkipToContent />

      {/* 2. Header Simulation */}
      <div className="border-b border-base-300 py-4">
        <Container className="flex items-center justify-between">
          <Heading level="h4">My App</Heading>
          <nav className="flex gap-4 text-sm font-medium">
            <a href="#" className="hover:text-primary">
              Home
            </a>
            <a href="#" className="hover:text-primary">
              About
            </a>
          </nav>
        </Container>
      </div>

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
              <Heading level="h3">Main Area</Heading>
              <Card className="h-64 flex items-center justify-center bg-base-200/50">
                <Text>Content Block 1</Text>
              </Card>
              <Card className="h-64 flex items-center justify-center bg-base-200/50">
                <Text>Content Block 2</Text>
              </Card>
            </div>

            <div className="space-y-4">
              <Heading level="h3">Sidebar</Heading>
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
};
