import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, spyOn, userEvent, waitFor, within } from 'storybook/test';
import { ImageUploader, type ImageUploaderItem, type ImageUploaderProps } from './ImageUploader';

// 1x1 PNGs as data URIs: real images that load, with no external URL.
const PNG_RED =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';
const PNG_BLUE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPj/HwADBwIAMCbHYQAAAABJRU5ErkJggg==';

const pngFile = (name: string, dataUri = PNG_RED) => {
  const bytes = Uint8Array.from(atob(dataUri.split(',')[1]), (char) => char.charCodeAt(0));
  return new File([bytes], name, { type: 'image/png' });
};
const textFile = (name: string) => new File(['x'], name, { type: 'text/plain' });

// What the browser does after the dialog (see FileInput.stories for why not userEvent.upload).
const pick = (input: HTMLInputElement, files: File[]) => {
  const transfer = new DataTransfer();
  files.forEach((item) => transfer.items.add(item));
  input.files = transfer.files;
  input.dispatchEvent(new Event('change', { bubbles: true }));
};
const drag = (target: Element, type: string, files: File[]) => {
  const dataTransfer = new DataTransfer();
  files.forEach((item) => dataTransfer.items.add(item));
  const event = new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer });
  target.dispatchEvent(event);
  return event;
};
const fileInputOf = (root: HTMLElement) =>
  root.querySelector<HTMLInputElement>('input[type="file"]')!;
// The region outlives each story (it clears after 5s), so wait for the exact text.
const expectAnnounced = (message: string) =>
  waitFor(() =>
    expect(document.querySelector('[data-core-ui-announcer="polite"]')).toHaveTextContent(message),
  );
const classesOf = (element: Element) => element.className.split(/\s+/);

const remote = (id: string, alt?: string, src = PNG_BLUE): ImageUploaderItem => ({
  kind: 'remote',
  id,
  src,
  alt,
});

// Keeps the value, as the app would.
function Gallery(props: ImageUploaderProps) {
  const [value, setValue] = React.useState(props.value);
  return (
    <div className="w-[34rem] max-w-full">
      <ImageUploader
        {...props}
        value={value}
        onValueChange={(next) => {
          setValue(next);
          props.onValueChange(next);
        }}
      />
    </div>
  );
}

const meta: Meta<typeof ImageUploader> = {
  title: 'Components/ImageUploader',
  component: ImageUploader,
  parameters: { layout: 'centered' },
  args: { label: 'Fotos', value: [], onValueChange: fn(), onReject: fn() },
  render: (args) => <Gallery {...args} />,
};

export default meta;
type Story = StoryObj<typeof ImageUploader>;

// 1. A named group. Chosen files are added (not replaced) with ids of their own and an object URL;
// the alt is the file name without its extension. The first one is the cover. Nothing goes with
// the native form: the input has no name and is emptied after each pick.
export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('group', { name: 'Fotos' });
    const trigger = canvas.getByRole('button', { name: 'Add images' });
    await expect(classesOf(trigger)).toContain('h-11');
    const input = fileInputOf(canvasElement);
    await expect(input).not.toHaveAttribute('name');
    await expect(input).toHaveAttribute('accept', 'image/*');
    await expect(canvas.getByText('or drop them here')).toHaveAttribute('aria-hidden', 'true');

    pick(input, [pngFile('playa.png')]);
    await expect(input.value).toBe('');
    pick(input, [pngFile('montaña.vacaciones.png', PNG_BLUE)]);

    const items = await waitFor(() => {
      const found = within(group).getAllByRole('listitem');
      if (found.length !== 2) throw new Error('not added yet');
      return found;
    });
    const value = (args.onValueChange as ReturnType<typeof fn>).mock.lastCall![0];
    await expect(value.map((item: ImageUploaderItem) => item.kind)).toEqual(['file', 'file']);
    await expect(new Set(value.map((item: ImageUploaderItem) => item.id)).size).toBe(2);

    const first = await within(items[0]).findByAltText('playa');
    await expect(first.getAttribute('src')).toMatch(/^blob:/);
    await within(items[1]).findByAltText('montaña.vacaciones');
    await expect(within(items[0]).getByText('Cover')).toBeVisible();
    await expect(within(items[1]).queryByText('Cover')).toBeNull();

    // The number in every name, "cover" in the first photo's. No move button at the ends.
    await expect(canvas.getByRole('button', { name: 'Remove image 1 (cover)' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Move image 1 (cover) after' })).toBeVisible();
    await expect(canvas.queryByRole('button', { name: /Move image 1.*before/ })).toBeNull();
    await expect(canvas.getByRole('button', { name: 'Move image 2 before' })).toBeVisible();
    await expect(canvas.queryByRole('button', { name: 'Move image 2 after' })).toBeNull();
    // 44px touch target on every photo button.
    for (const button of within(items[0]).getAllByRole('button')) {
      await expect(classesOf(button)).toEqual(expect.arrayContaining(['h-11', 'w-11']));
    }
  },
};

// 2. Remote photos, as editing a record brings them: their alt, or the photo's name without one.
export const Remote: Story = {
  args: { value: [remote('a', 'Fachada'), remote('b', undefined, PNG_RED)] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect((await canvas.findByAltText('Fachada')).getAttribute('src')).toBe(PNG_BLUE);
    await canvas.findByAltText('image 2');
  },
};

// 3. Moving keeps the focus on the same button of the moved photo, or on the other move button
// when its own disappears at an end. Each move is announced.
export const Move: Story = {
  args: { value: [remote('a', 'Uno'), remote('b', 'Dos'), remote('c', 'Tres')] },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const altsInOrder = () => canvas.getAllByRole('img').map((img) => img.getAttribute('alt'));
    await canvas.findAllByRole('img');

    await userEvent.click(canvas.getByRole('button', { name: 'Move image 2 after' }));
    await waitFor(() => expect(altsInOrder()).toEqual(['Uno', 'Tres', 'Dos']));
    await expectAnnounced('Dos moved to position 3 of 3');
    // At the end there is no "after": the focus goes to "before" of the same photo.
    await expect(canvas.getByRole('button', { name: 'Move image 3 before' })).toHaveFocus();

    await userEvent.click(canvas.getByRole('button', { name: 'Move image 2 before' }));
    await waitFor(() => expect(altsInOrder()).toEqual(['Tres', 'Uno', 'Dos']));
    await expect(canvas.getByRole('button', { name: 'Move image 1 (cover) after' })).toHaveFocus();
    await expect(canvas.getAllByRole('listitem')[0]).toHaveTextContent('Cover');

    // In the middle, the same button stays focused.
    await userEvent.click(canvas.getByRole('button', { name: 'Move image 1 (cover) after' }));
    await waitFor(() => expect(altsInOrder()).toEqual(['Uno', 'Tres', 'Dos']));
    await expect(canvas.getByRole('button', { name: 'Move image 2 after' })).toHaveFocus();
    await expect(args.onValueChange).toHaveBeenCalledTimes(3);
  },
};

// 4. Removing moves the focus to the next photo, then the previous one, then the trigger, and
// is announced.
export const Remove: Story = {
  args: { value: [remote('a', 'Uno'), remote('b', 'Dos'), remote('c', 'Tres')] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findAllByRole('img');

    await userEvent.click(canvas.getByRole('button', { name: 'Remove image 2' }));
    await waitFor(() => expect(canvas.queryByAltText('Dos')).toBeNull());
    await expectAnnounced('Dos removed');
    await expect(canvas.getByRole('button', { name: 'Remove image 2' })).toHaveFocus();

    await userEvent.click(canvas.getByRole('button', { name: 'Remove image 2' }));
    await waitFor(() => expect(canvas.queryByAltText('Tres')).toBeNull());
    await expect(canvas.getByRole('button', { name: 'Remove image 1 (cover)' })).toHaveFocus();

    await userEvent.click(canvas.getByRole('button', { name: 'Remove image 1 (cover)' }));
    await waitFor(() => expect(canvas.queryByRole('list')).toBeNull());
    await expect(canvas.getByRole('button', { name: 'Add images' })).toHaveFocus();
  },
};

// 5. max: visible count that describes the trigger. Files beyond it go to onReject 'count', the
// wrong type to 'type'. When full, the trigger is aria-disabled but stays focusable.
export const Max: Story = {
  args: { max: 2, helperText: 'JPG o PNG' },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Add images' });
    await expect(trigger).toHaveAccessibleDescription('0 of 2 JPG o PNG');
    await expect(trigger).not.toHaveAttribute('aria-disabled');

    const ok = [pngFile('a.png'), pngFile('b.png'), pngFile('c.png')];
    const bad = textFile('notas.txt');
    pick(fileInputOf(canvasElement), [...ok, bad]);
    await waitFor(() => expect(canvas.getAllByRole('listitem')).toHaveLength(2));
    await expect(args.onReject).toHaveBeenCalledWith([bad], 'type');
    await expect(args.onReject).toHaveBeenCalledWith([ok[2]], 'count');
    await expect(canvas.getByText('2 of 2')).toBeVisible();
    await expect(trigger).toHaveAttribute('aria-disabled', 'true');
    await expect(trigger).not.toBeDisabled();

    // A drop when full goes whole to 'count'.
    const late = pngFile('d.png');
    drag(canvas.getByRole('list'), 'drop', [late]);
    await expect(args.onReject).toHaveBeenLastCalledWith([late], 'count');

    await userEvent.click(canvas.getByRole('button', { name: 'Remove image 2' }));
    await waitFor(() => expect(trigger).not.toHaveAttribute('aria-disabled'));
  },
};

// 6. The whole gallery is the drop zone, with data-dragging while files are over it.
export const Drop: Story = {
  args: { value: [remote('a', 'Uno')] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole('list');
    const zone = list.parentElement!;
    await expect(zone).not.toHaveAttribute('role');
    await expect(zone).not.toHaveAttribute('tabindex');

    const photo = pngFile('nueva.png');
    drag(list, 'dragenter', [photo]);
    await waitFor(() => expect(zone).toHaveAttribute('data-dragging'));
    drag(canvas.getByRole('button', { name: 'Add images' }), 'drop', [photo]);
    await canvas.findByAltText('nueva');
    await expect(zone).not.toHaveAttribute('data-dragging');
  },
};

// 7. Same pattern as Input for the error; aria-label instead of a visible label.
export const WithError: Story = {
  args: { label: undefined, 'aria-label': 'Fotos del local', error: 'Sube al menos una foto' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('group', { name: 'Fotos del local' })).toBeVisible();
    const trigger = canvas.getByRole('button', { name: 'Add images' });
    await expect(trigger).toHaveAccessibleDescription('Sube al menos una foto');
    await expect(canvas.getByText('Sube al menos una foto').className).toBe(
      'text-xs text-error-focus font-medium',
    );
    await expect(classesOf(canvas.getByRole('group').children[0] as Element)).toContain(
      'border-error',
    );
  },
};

// 8. Disabled: every button is disabled and a drop is ignored.
export const Disabled: Story = {
  args: { disabled: true, value: [remote('a', 'Uno'), remote('b', 'Dos')] },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    for (const button of canvas.getAllByRole('button')) await expect(button).toBeDisabled();
    drag(canvas.getByRole('list'), 'drop', [pngFile('x.png')]);
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};

// 9. Custom texts, merged with the defaults.
export const CustomLabels: Story = {
  args: {
    max: 5,
    value: [remote('a', 'Uno'), remote('b', 'Dos')],
    labels: {
      add: 'Agregar fotos',
      cover: 'Portada',
      image: (position, cover) => (cover ? `foto ${position} (portada)` : `foto ${position}`),
      remove: (image) => `Quitar ${image}`,
      count: (count, max) => `${count} de ${max}`,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Agregar fotos' })).toBeVisible();
    await expect(canvas.getByText('Portada')).toBeVisible();
    await expect(canvas.getByText('2 de 5')).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Quitar foto 1 (portada)' })).toBeVisible();
    // Not overridden: the default, with the custom photo name.
    await expect(canvas.getByRole('button', { name: 'Move foto 2 before' })).toBeVisible();
  },
};

function Lifecycle() {
  const [mounted, setMounted] = React.useState(true);
  return (
    <React.StrictMode>
      <button type="button" onClick={() => setMounted(false)}>
        Desmontar
      </button>
      {mounted && <Gallery label="Fotos" value={[]} onValueChange={() => {}} />}
    </React.StrictMode>
  );
}

// 10. Object URLs, in StrictMode: the shown URL works (its simulated unmount didn't leave a revoked
// one), it is revoked when its photo leaves the value, and the rest on unmount.
export const ObjectUrlLifecycle: Story = {
  render: () => <Lifecycle />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const revoke = spyOn(URL, 'revokeObjectURL');
    try {
      pick(fileInputOf(canvasElement), [pngFile('a.png'), pngFile('b.png', PNG_BLUE)]);
      const a = (await canvas.findByAltText('a')).getAttribute('src')!;
      const b = (await canvas.findByAltText('b')).getAttribute('src')!;
      await expect((await fetch(a)).ok).toBe(true);
      await expect((await fetch(b)).ok).toBe(true);

      await userEvent.click(canvas.getByRole('button', { name: 'Remove image 1 (cover)' }));
      await waitFor(() => expect(revoke).toHaveBeenCalledWith(a));
      await expect(revoke).not.toHaveBeenCalledWith(b);
      await expect((await fetch(b)).ok).toBe(true);

      await userEvent.click(canvas.getByRole('button', { name: 'Desmontar' }));
      await waitFor(() => expect(revoke).toHaveBeenCalledWith(b));
    } finally {
      revoke.mockRestore();
    }
  },
};
