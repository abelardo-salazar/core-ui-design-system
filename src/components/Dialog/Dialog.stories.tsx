import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from './Dialog';
import { Button } from '../Button';
import { Input } from '../Input';
import { Text } from '../Typography'; // Using our new Typography component!

const meta: Meta<typeof Dialog> = {
  title: 'Components/Dialog',
  component: Dialog,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Dialog>;

export const EditProfileExample: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Edit Profile</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        {/* Form Content */}
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Text as="label" htmlFor="name" className="text-right" size="lg" weight="medium">
              Name
            </Text>
            <Input id="name" defaultValue="Pedro Duarte" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Text as="label" htmlFor="username" className="text-right" size="lg" weight="medium">
              Username
            </Text>
            <Input id="username" defaultValue="@pedrodev" className="col-span-3" />
          </div>
        </div>

        <DialogFooter>
          {/* We can use DialogClose to auto-close on click */}
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Edit Profile' });
    await userEvent.click(trigger);

    const body = within(document.body);
    const dialog = await body.findByRole('dialog');
    const dialogScope = within(dialog);

    // axe: label — los inputs no tenían label real, solo texto suelto sin htmlFor.
    await expect(dialogScope.getByLabelText('Name')).toHaveValue('Pedro Duarte');
    await expect(dialogScope.getByLabelText('Username')).toHaveValue('@pedrodev');
  },
};
