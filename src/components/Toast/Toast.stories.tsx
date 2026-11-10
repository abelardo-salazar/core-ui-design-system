import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';
import { Toast } from './Toast';
import { toast } from './index'; // Import from our barrel file
import { Button } from '../Button'; // Assuming Button exists

const meta = {
  title: 'Components/Feedback/Toast',
  component: Toast,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  // Decorator to ensure Toaster is present in the DOM
  decorators: [
    (Story, { parameters }) => (
      <div className="h-[400px] w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-8 rounded-md border border-slate-200 dark:border-slate-800">
        <Story />
        {/* The Toaster component itself needs to be rendered once; a story can pass its props
            through parameters.toaster instead of rendering a second one. */}
        <Toast {...(parameters.toaster as React.ComponentProps<typeof Toast> | undefined)} />
      </div>
    ),
  ],
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

// We use a functional component to trigger hooks/events
const ToastDemo = () => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Button
        variant="outline"
        onClick={() =>
          toast('Se creó el evento', {
            description: 'Domingo, 3 de diciembre de 2023, 9:00',
            action: {
              label: 'Deshacer',
              onClick: () => console.log('Undo'),
            },
          })
        }
      >
        Toast predeterminado
      </Button>

      <Button
        variant="secondary"
        onClick={() => toast.success('¡El evento se creó correctamente!')}
      >
        Éxito
      </Button>

      <Button variant="destructive" onClick={() => toast.error('No se pudo crear el evento.')}>
        Error
      </Button>

      <Button variant="ghost" onClick={() => toast.info('Hay una actualización disponible.')}>
        Información
      </Button>
    </div>
  );
};

export const Interactive: Story = {
  render: () => <ToastDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const successButton = canvas.getByRole('button', { name: 'Éxito' });

    // Fires the notification through Sonner's imperative API (toast.success).
    await userEvent.click(successButton);

    // The toast lives in Sonner's portal, outside canvasElement.
    const body = within(document.body);
    const message = await body.findByText('¡El evento se creó correctamente!');
    const toastEl = message.closest('[data-sonner-toast]');

    await expect(toastEl).toBeInTheDocument();
    // DS tokens already migrated in the previous audit (not the old slate-* ones).
    await expect(toastEl?.className).toContain('group-[.toaster]:bg-base-100');
    await expect(toastEl?.className).not.toMatch(/slate/);
  },
};

// Shows a toast and returns its Toaster (the <ol> that receives sonner's offset variables).
const showToaster = async (message: string) => {
  toast(message);
  const element = await within(document.body).findByText(message);
  const toaster = element.closest<HTMLElement>('[data-sonner-toaster]');
  await expect(toaster).not.toBeNull();
  return toaster!;
};
const SIDES = ['top', 'right', 'bottom', 'left'] as const;

// Without props, every side of both offsets adds the safe area to sonner's default (24px, and
// 16px up to 600px wide), so with viewport-fit=cover the toast clears the notch and the home
// indicator. Without viewport-fit=cover env() is 0 and the position doesn't change.
export const SafeAreaOffset: Story = {
  render: () => <p className="text-sm">Los toasts se separan del safe area del dispositivo.</p>,
  play: async () => {
    const toaster = await showToaster('Offset por defecto');
    for (const side of SIDES) {
      await expect(toaster.style.getPropertyValue(`--offset-${side}`)).toBe(
        `calc(24px + env(safe-area-inset-${side}))`,
      );
      await expect(toaster.style.getPropertyValue(`--mobile-offset-${side}`)).toBe(
        `calc(16px + env(safe-area-inset-${side}))`,
      );
    }
  },
};

// A consumer offset replaces the whole default of that prop: the sides it omits get sonner's
// plain default, without the safe area. Each prop is replaced on its own.
export const CustomOffset: Story = {
  parameters: {
    toaster: { offset: { bottom: 'calc(80px + env(safe-area-inset-bottom))' } },
  },
  render: () => <p className="text-sm">Toaster con un offset propio.</p>,
  play: async () => {
    const toaster = await showToaster('Offset propio');
    await expect(toaster.style.getPropertyValue('--offset-bottom')).toBe(
      'calc(80px + env(safe-area-inset-bottom))',
    );
    await expect(toaster.style.getPropertyValue('--offset-top')).toBe('24px');
    // mobileOffset wasn't passed: it keeps the safe-area default.
    await expect(toaster.style.getPropertyValue('--mobile-offset-bottom')).toBe(
      'calc(16px + env(safe-area-inset-bottom))',
    );
  },
};
