import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { Alert, AlertTitle, AlertDescription } from './Alert';

const meta: Meta<typeof Alert> = {
  title: 'Components/Alert',
  component: Alert,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  render: (args) => (
    <div className="w-96">
      <Alert {...args} />
    </div>
  ),
};

export default meta;
type Story = StoryObj<typeof Alert>;

// 1. Info (default) — role="status", InfoCircledIcon
export const Info: Story = {
  args: {
    children: (
      <>
        <AlertTitle>Heads up</AlertTitle>
        <AlertDescription>This is a general information message.</AlertDescription>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const alert = canvas.getByRole('status');
    await expect(alert).toBeInTheDocument();
    await expect(canvas.queryByRole('alert')).not.toBeInTheDocument();

    await expect(canvas.getByText('Heads up')).toBeInTheDocument();
    await expect(canvas.getByText('This is a general information message.')).toBeInTheDocument();

    await expect(alert.querySelector('svg.text-info')).toBeInTheDocument();
    await expect(alert.className.split(' ')).toEqual(
      expect.arrayContaining(['border-info/30', 'bg-info/10']),
    );
  },
};

// 2. Success — role="status", CheckCircledIcon
export const Success: Story = {
  args: {
    variant: 'success',
    children: (
      <>
        <AlertTitle>Success</AlertTitle>
        <AlertDescription>Your changes have been saved.</AlertDescription>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const alert = canvas.getByRole('status');

    await expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
    await expect(alert.querySelector('svg.text-success')).toBeInTheDocument();
    await expect(alert.className.split(' ')).toEqual(
      expect.arrayContaining(['border-success/30', 'bg-success/10']),
    );
  },
};

// 3. Warning — role="alert", ExclamationTriangleIcon
export const Warning: Story = {
  args: {
    variant: 'warning',
    children: (
      <>
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>This action may have unintended consequences.</AlertDescription>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const alert = canvas.getByRole('alert');

    await expect(canvas.queryByRole('status')).not.toBeInTheDocument();
    await expect(alert.querySelector('svg.text-warning')).toBeInTheDocument();
    await expect(alert.className.split(' ')).toEqual(
      expect.arrayContaining(['border-warning/30', 'bg-warning/10']),
    );
  },
};

// 4. Error — role="alert", CrossCircledIcon
export const ErrorVariant: Story = {
  args: {
    variant: 'error',
    children: (
      <>
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Something went wrong. Please try again.</AlertDescription>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const alert = canvas.getByRole('alert');

    await expect(canvas.queryByRole('status')).not.toBeInTheDocument();
    await expect(alert.querySelector('svg.text-error')).toBeInTheDocument();
    await expect(alert.className.split(' ')).toEqual(
      expect.arrayContaining(['border-error/30', 'bg-error/10']),
    );
  },
};

// 5. Custom icon (override): replaces the default without touching variant/role
export const CustomIcon: Story = {
  args: {
    variant: 'success',
    icon: <span data-testid="custom-icon">🚀</span>,
    children: (
      <>
        <AlertTitle>Deployed</AlertTitle>
        <AlertDescription>Your app is live.</AlertDescription>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const alert = canvas.getByRole('status');

    // The default icon (CheckCircledIcon) must not be present when there's an override.
    await expect(alert.querySelector('svg.text-success')).not.toBeInTheDocument();
    await expect(canvas.getByTestId('custom-icon')).toBeInTheDocument();
  },
};

// 6. Icon hidden explicitly (icon={null}): tells "I didn't pass icon" apart from "I don't want an icon"
export const NoIcon: Story = {
  args: {
    icon: null,
    children: (
      <>
        <AlertTitle>No icon</AlertTitle>
        <AlertDescription>This alert explicitly opts out of any icon.</AlertDescription>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const alert = canvas.getByRole('status');

    await expect(alert.querySelector('svg')).not.toBeInTheDocument();
  },
};

const liveContent = (
  <>
    <AlertTitle>Aviso</AlertTitle>
    <AlertDescription>Contenido del aviso.</AlertDescription>
  </>
);

// 7. Without `live`, the DOM stays exactly as before the prop existed: the role comes from the
// variant, the root has only `role` and `class`, and the structure is icon + content.
export const DefaultDomUnchanged: Story = {
  render: () => (
    <div className="w-96 space-y-2">
      <Alert>{liveContent}</Alert>
      <Alert variant="info">{liveContent}</Alert>
      <Alert variant="success">{liveContent}</Alert>
      <Alert variant="warning">{liveContent}</Alert>
      <Alert variant="error">{liveContent}</Alert>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const roots = Array.from(canvasElement.querySelectorAll('.w-96 > *'));
    await expect(roots.map((root) => root.getAttribute('role'))).toEqual([
      'status',
      'status',
      'status',
      'alert',
      'alert',
    ]);

    for (const root of roots) {
      await expect(root.getAttributeNames().sort()).toEqual(['class', 'role']);
      await expect(root.children).toHaveLength(2);
      await expect(root.children[0].tagName.toLowerCase()).toBe('svg');
      await expect(root.children[1]).toHaveClass('flex-1', 'space-y-1');
    }
  },
};

// 8. `live` overrides the variant's role: assertive -> alert, polite -> status. It doesn't touch
// the look (the variant's classes stay) and never reaches the DOM as an attribute.
export const LiveOverridesRole: Story = {
  render: () => (
    <div className="w-96 space-y-2">
      <Alert variant="info" live="assertive" data-testid="assertive">
        {liveContent}
      </Alert>
      <Alert variant="error" live="polite" data-testid="polite">
        {liveContent}
      </Alert>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const assertive = canvas.getByTestId('assertive');
    await expect(assertive).toHaveAttribute('role', 'alert');
    await expect(assertive).toHaveClass('bg-info/10');
    await expect(assertive).not.toHaveAttribute('live');

    const polite = canvas.getByTestId('polite');
    await expect(polite).toHaveAttribute('role', 'status');
    await expect(polite).toHaveClass('bg-error/10');
    await expect(polite).not.toHaveAttribute('live');
  },
};

// 9. live="off": no role at all, for a persistent notice that shouldn't be announced every time
// the view mounts. Not role="region": it would add a landmark per notice.
export const LiveOff: Story = {
  render: () => (
    <div className="w-96">
      <Alert variant="warning" live="off" data-testid="off">
        {liveContent}
      </Alert>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const alert = canvas.getByTestId('off');

    await expect(alert).not.toHaveAttribute('role');
    await expect(alert).not.toHaveAttribute('live');
    await expect(alert).not.toHaveAttribute('aria-live');
    await expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
    await expect(canvas.queryByRole('status')).not.toBeInTheDocument();
    await expect(canvas.queryByRole('region')).not.toBeInTheDocument();
    await expect(alert).toHaveClass('bg-warning/10');
    await expect(alert.querySelector('svg.text-warning')).toBeInTheDocument();
  },
};
