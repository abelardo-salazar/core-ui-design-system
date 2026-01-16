import type { Meta, StoryObj } from '@storybook/react';
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
    (Story) => (
      <div className="h-[400px] w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-8 rounded-md border border-slate-200 dark:border-slate-800">
        <Story />
        {/* The Toaster component itself needs to be rendered once */}
        <Toast />
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
          toast('Event has been created', {
            description: 'Sunday, December 03, 2023 at 9:00 AM',
            action: {
              label: 'Undo',
              onClick: () => console.log('Undo'),
            },
          })
        }
      >
        Default Toast
      </Button>

      <Button variant="secondary" onClick={() => toast.success('Event created successfully!')}>
        Success
      </Button>

      <Button variant="destructive" onClick={() => toast.error('Failed to create event.')}>
        Error
      </Button>

      <Button variant="ghost" onClick={() => toast.info('New update available.')}>
        Info
      </Button>
    </div>
  );
};

export const Interactive: Story = {
  render: () => <ToastDemo />,
};
