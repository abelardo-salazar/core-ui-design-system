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

// 5. Custom icon (override) — reemplaza el default sin tocar variant/role
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

    // El ícono default (CheckCircledIcon) no debe estar presente cuando hay override.
    await expect(alert.querySelector('svg.text-success')).not.toBeInTheDocument();
    await expect(canvas.getByTestId('custom-icon')).toBeInTheDocument();
  },
};

// 6. Icon hidden explicitly (icon={null}) — distingue "no pasé icon" de "no quiero icon"
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
