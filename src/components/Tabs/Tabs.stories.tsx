import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Badge } from '../Badge';
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
      <TabsTrigger value="prep">Preparar</TabsTrigger>
      <TabsTrigger value="cook">Cocinar</TabsTrigger>
      <TabsTrigger value="serve">Servir</TabsTrigger>
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
    const prepTrigger = canvas.getByRole('tab', { name: 'Preparar' });
    const cookTrigger = canvas.getByRole('tab', { name: 'Cocinar' });

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
    const prepTrigger = canvas.getByRole('tab', { name: 'Preparar' });
    const cookTrigger = canvas.getByRole('tab', { name: 'Cocinar' });
    const serveTrigger = canvas.getByRole('tab', { name: 'Servir' });

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

const LONG_TABS = [
  'Resumen general',
  'Pedidos activos',
  'Historial de compras',
  'Direcciones guardadas',
  'Preferencias',
];

const LongTriggers = () => (
  <TabsList>
    {LONG_TABS.map((label) => (
      <TabsTrigger key={label} value={label}>
        {label}
      </TabsTrigger>
    ))}
  </TabsList>
);

function ScrollDemo({ spacer = false }: { spacer?: boolean }) {
  const [value, setValue] = React.useState(LONG_TABS[0]);
  return (
    <div className="w-[390px]" data-testid="frame">
      <button type="button" onClick={() => setValue(LONG_TABS[4])}>
        Ir al último
      </button>
      {spacer && <div className="h-[3000px]" />}
      <Tabs value={value} onValueChange={setValue}>
        <LongTriggers />
      </Tabs>
    </div>
  );
}

// The trigger is inside the list with room for its focus ring, which is what the overflow clips.
// 3.5 and not 4: scrollLeft rounds at the end of the scroll range, which leaves 3.92px.
const expectRevealed = async (list: HTMLElement, trigger: HTMLElement) => {
  const listRect = list.getBoundingClientRect();
  const triggerRect = trigger.getBoundingClientRect();
  await expect(triggerRect.left - listRect.left).toBeGreaterThanOrEqual(3.5);
  await expect(listRect.right - triggerRect.right).toBeGreaterThanOrEqual(3.5);
  await expect(triggerRect.top - listRect.top).toBeGreaterThanOrEqual(3.5);
  await expect(listRect.bottom - triggerRect.bottom).toBeGreaterThanOrEqual(3.5);
};

// 3. 5 tabs at 390px: the list scrolls inside its container instead of overflowing it, with no
// visible scrollbar, and the active trigger stays in view however the value changes.
export const ScrollsWhenItDoesNotFit: Story = {
  tags: ['real-css'],
  render: () => <ScrollDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const frame = canvas.getByTestId('frame');
    const list = canvas.getByRole('tablist');
    const tabs = canvas.getAllByRole('tab');
    const [first, , third, , last] = tabs;

    // Ubuntu loads with font-display: swap. If it arrives after a reveal, the triggers widen and
    // the active one ends up clipped (12px past the edge with these labels): the list only
    // reveals again when the value changes. Seen under load (full suite, --maxWorkers=48).
    // Wait for the triggers' own font, with their text so unicode-range picks the right files.
    await Promise.all(
      tabs.map((tab) => {
        const style = getComputedStyle(tab);
        const font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
        return document.fonts.load(font, tab.textContent ?? '');
      }),
    );

    await expect(list.offsetWidth).toBe(390);
    await expect(frame.scrollWidth).toBe(390);
    await expect(list.scrollWidth).toBeGreaterThan(list.clientWidth);
    await expect(getComputedStyle(list).scrollbarWidth).toBe('none');
    await expect(list.offsetHeight).toBe(list.clientHeight);
    await expect(last.getBoundingClientRect().left).toBeGreaterThan(
      list.getBoundingClientRect().right,
    );

    // A value changed from outside the list.
    await userEvent.click(canvas.getByRole('button', { name: 'Ir al último' }));
    await waitFor(() => expect(last).toHaveAttribute('data-state', 'active'));
    await waitFor(() => expectRevealed(list, last));

    // Keyboard, back to the start.
    last.focus();
    await userEvent.keyboard('{Home}');
    await waitFor(() => expect(first).toHaveFocus());
    // scrollLeft in the same wait: read after it, the scroll may not have reached 0 yet.
    await waitFor(async () => {
      await expectRevealed(list, first);
      await expect(list.scrollLeft).toBe(0);
    });

    // A click on a trigger that is only partly in view.
    await userEvent.click(third);
    await waitFor(() => expectRevealed(list, third));
  },
};

// 4. An initial value that doesn't fit is also in view.
export const RevealsInitialValue: Story = {
  tags: ['real-css'],
  render: () => (
    <Tabs defaultValue={LONG_TABS[4]} className="w-[390px]">
      <LongTriggers />
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expectRevealed(canvas.getByRole('tablist'), canvas.getByRole('tab', { selected: true }));
  },
};

// 5. With the list off screen, changing the value scrolls the list and leaves the page alone.
export const DoesNotMoveThePage: Story = {
  tags: ['real-css'],
  render: () => <ScrollDemo spacer />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole('tablist');
    // Its position on screen and not window.scrollY: it detects a scroll of any ancestor.
    const top = list.getBoundingClientRect().top;
    // Mounting didn't bring it into view either.
    await expect(top).toBeGreaterThan(window.innerHeight);

    await userEvent.click(canvas.getByRole('button', { name: 'Ir al último' }));
    await waitFor(() => expect(list.scrollLeft).toBeGreaterThan(0));
    await expect(list.getBoundingClientRect().top).toBe(top);
  },
};

// 6. Inside a flex container, Tabs needs min-w-0 to be limited by it, as the README says.
export const InsideFlexContainer: Story = {
  tags: ['real-css'],
  render: () => (
    <div className="flex w-[390px]" data-testid="frame">
      <Tabs defaultValue={LONG_TABS[0]} className="min-w-0">
        <LongTriggers />
      </Tabs>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole('tablist');
    await expect(list.offsetWidth).toBe(390);
    await expect(list.scrollWidth).toBeGreaterThan(list.clientWidth);
    await expect(canvas.getByTestId('frame').scrollWidth).toBe(390);
  },
};

// 7. When it fits, nothing changes: the list hugs its triggers and there is nothing to scroll.
export const FitsWithoutScrolling: Story = {
  tags: ['real-css'],
  render: () => (
    <div className="w-[390px]">
      <TabsDemo />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const list = within(canvasElement).getByRole('tablist');
    await expect(list.offsetWidth).toBeLessThan(320);
    await expect(list.scrollWidth).toBe(list.clientWidth);
    await expect(list.scrollLeft).toBe(0);
  },
};

// 8. A counter in a trigger: the number is part of the accessible name.
export const TriggerWithBadge: Story = {
  render: () => (
    <Tabs defaultValue="inbox">
      <TabsList>
        <TabsTrigger value="inbox" className="gap-2">
          Mensajes{' '}
          <Badge size="icon" variant="secondary">
            3
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="archive">Archivo</TabsTrigger>
      </TabsList>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('tab', { name: 'Mensajes 3' })).toHaveAttribute(
      'data-state',
      'active',
    );
  },
};
