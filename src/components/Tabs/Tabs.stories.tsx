import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';

const meta: Meta<typeof Tabs> = {
  title: 'Components/Tabs',
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

// Real use case: the steps of a recipe, not a long row of dashboard tabs.
const TabsDemo = () => (
  <Tabs defaultValue="prep" className="w-80">
    <TabsList>
      <TabsTrigger value="prep">Prep</TabsTrigger>
      <TabsTrigger value="cook">Cook</TabsTrigger>
      <TabsTrigger value="serve">Serve</TabsTrigger>
    </TabsList>
    <TabsContent value="prep">Corta los vegetales y marina la proteína.</TabsContent>
    <TabsContent value="cook">Cocina a fuego medio durante 12 minutos.</TabsContent>
    <TabsContent value="serve">Emplata y decora con hierbas frescas.</TabsContent>
  </Tabs>
);

// 1. Default: changing tab by click; the clicked trigger becomes data-state="active"
// and its TabsContent is the only one visible.
export const Default: Story = {
  render: () => <TabsDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const prepTrigger = canvas.getByRole('tab', { name: 'Prep' });
    const cookTrigger = canvas.getByRole('tab', { name: 'Cook' });

    await expect(prepTrigger).toHaveAttribute('data-state', 'active');
    await expect(canvas.getByText('Corta los vegetales y marina la proteína.')).toBeVisible();
    await expect(
      canvas.queryByText('Cocina a fuego medio durante 12 minutos.'),
    ).not.toBeInTheDocument();

    await userEvent.click(cookTrigger);

    await waitFor(() => expect(cookTrigger).toHaveAttribute('data-state', 'active'));
    await expect(prepTrigger).toHaveAttribute('data-state', 'inactive');
    await expect(canvas.getByText('Cocina a fuego medio durante 12 minutos.')).toBeVisible();
    await expect(
      canvas.queryByText('Corta los vegetales y marina la proteína.'),
    ).not.toBeInTheDocument();
  },
};

// 2. Arrow navigation: Radix Tabs' default activationMode is "automatic":
// ArrowRight moves focus AND activates the tab in the same step, with no extra Enter/Space
// (verified in the package's dist/index.mjs, not assumed by analogy with Select).
export const ArrowKeyNavigation: Story = {
  render: () => <TabsDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const prepTrigger = canvas.getByRole('tab', { name: 'Prep' });
    const cookTrigger = canvas.getByRole('tab', { name: 'Cook' });
    const serveTrigger = canvas.getByRole('tab', { name: 'Serve' });

    prepTrigger.focus();
    await expect(prepTrigger).toHaveFocus();

    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(cookTrigger).toHaveFocus());
    // No {Enter}: the activation already happened with the arrow.
    await expect(cookTrigger).toHaveAttribute('data-state', 'active');
    await expect(canvas.getByText('Cocina a fuego medio durante 12 minutos.')).toBeVisible();

    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(serveTrigger).toHaveFocus());
    await expect(serveTrigger).toHaveAttribute('data-state', 'active');
    await expect(canvas.getByText('Emplata y decora con hierbas frescas.')).toBeVisible();

    await userEvent.keyboard('{ArrowLeft}');
    await waitFor(() => expect(cookTrigger).toHaveFocus());
    await expect(cookTrigger).toHaveAttribute('data-state', 'active');
  },
};
