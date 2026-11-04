import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { FileInput } from './FileInput';

const meta: Meta<typeof FileInput> = {
  title: 'Components/FileInput',
  component: FileInput,
  parameters: { layout: 'centered' },
  render: (args) => (
    <div className="w-80">
      <FileInput {...args} />
    </div>
  ),
};

export default meta;
type Story = StoryObj<typeof FileInput>;

const file = (name: string, type = '') => new File(['x'], name, { type });
const namesOf = (files: FileList | null) => Array.from(files ?? []).map(({ name }) => name);
const classesOf = (element: Element) => element.className.split(/\s+/);

// What the browser does after the dialog. user-event's upload isn't used: it replaces input.files
// with a read-only property, and filters by accept before the component can see the files.
const pick = (input: HTMLInputElement, files: File[]) => {
  const transfer = new DataTransfer();
  files.forEach((item) => transfer.items.add(item));
  input.files = transfer.files;
  input.dispatchEvent(new Event('change', { bubbles: true }));
};

// 1. Named by its label and by the trigger. After choosing, the trigger changes its text and shows
// the name, which also describes the input.
export const Default: Story = {
  args: { label: 'Contrato', onFilesChange: fn(), onReject: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText(/Contrato/) as HTMLInputElement;
    await expect(input).toHaveAttribute('type', 'file');
    await expect(input).toHaveClass('sr-only');
    await expect(canvas.getByLabelText(/Choose file/)).toBe(input);
    await expect(input).not.toHaveAttribute('aria-describedby');

    const trigger = canvas.getByText('Choose file');
    await expect(trigger.tagName).toBe('LABEL');
    await expect(trigger).toHaveAttribute('for', input.id);
    await expect(classesOf(trigger)).toContain('h-11');
    await expect(classesOf(trigger)).toContain('border-base-300');
    await expect(trigger).not.toHaveAttribute('variant');

    const chosen = file('contrato.pdf', 'application/pdf');
    pick(input, [chosen]);
    await waitFor(() => expect(canvas.getByText('Change file')).toBeVisible());
    await expect(args.onFilesChange).toHaveBeenCalledWith([chosen]);
    await expect(args.onReject).not.toHaveBeenCalled();
    await expect(input).toHaveAccessibleDescription('contrato.pdf');
    await expect(canvas.queryByText('Choose file')).toBeNull();
  },
};

// 2. Each kind of token of accept, case-insensitive. Without a type, only the extension counts.
export const ValidatesAccept: Story = {
  args: {
    accept: '.PDF, image/*, application/json',
    multiple: true,
    onFilesChange: fn(),
    onReject: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const input = within(canvasElement).getByLabelText(/Choose files/) as HTMLInputElement;
    const ok = [
      file('a.pdf'),
      file('B.PdF', 'application/pdf'),
      file('c.png', 'image/png'),
      file('d', 'IMAGE/JPEG'),
      file('e.data', 'application/json'),
    ];
    const bad = [
      file('f.txt', 'text/plain'),
      file('g'),
      file('pdf'),
      file('h.png'),
      file('.pdf.txt'),
    ];
    pick(input, [...ok, ...bad]);
    await expect(args.onFilesChange).toHaveBeenCalledWith(ok);
    await expect(args.onReject).toHaveBeenCalledWith(bad);
    // The native input, and so a form submit, only keeps the valid ones.
    await expect(namesOf(input.files)).toEqual(ok.map(({ name }) => name));
  },
};

// 3. A wrong pick doesn't cost the previous choice: onFilesChange isn't called and nothing changes.
export const RejectKeepsPrevious: Story = {
  args: { accept: '.pdf', onFilesChange: fn(), onReject: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText(/Choose file/) as HTMLInputElement;

    // Nothing to keep yet.
    const wrong = file('foto.png', 'image/png');
    pick(input, [wrong]);
    await expect(args.onReject).toHaveBeenLastCalledWith([wrong]);
    await expect(args.onFilesChange).not.toHaveBeenCalled();
    await expect(input.files).toHaveLength(0);
    await expect(canvas.getByText('Choose file')).toBeVisible();

    const right = file('bueno.pdf');
    pick(input, [right]);
    await waitFor(() => expect(canvas.getByText('bueno.pdf')).toBeVisible());
    await expect(args.onFilesChange).toHaveBeenCalledTimes(1);

    pick(input, [wrong]);
    await expect(args.onReject).toHaveBeenCalledTimes(2);
    await expect(args.onFilesChange).toHaveBeenCalledTimes(1);
    await expect(namesOf(input.files)).toEqual(['bueno.pdf']);
    await expect(canvas.getByText('bueno.pdf')).toBeVisible();
  },
};

// 4. multiple shows every name, and its own default texts. Choosing nothing empties the field.
export const Multiple: Story = {
  args: { multiple: true, onFilesChange: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText(/Choose files/) as HTMLInputElement;
    pick(input, [file('a.pdf'), file('b.pdf')]);
    const names = await canvas.findByText('a.pdf, b.pdf');
    await expect(names).toHaveAttribute('title', 'a.pdf, b.pdf');
    await expect(canvas.getByText('Change files')).toBeVisible();

    pick(input, []);
    await waitFor(() => expect(canvas.getByText('Choose files')).toBeVisible());
    await expect(args.onFilesChange).toHaveBeenLastCalledWith([]);
    await expect(input).not.toHaveAttribute('aria-describedby');
  },
};

// 5. Same pattern as Input: aria-invalid, aria-describedby and the message. The consumer's own
// description is kept, and the name also describes the input.
export const WithError: Story = {
  args: {
    label: 'Contrato',
    error: 'Sube un PDF',
    'aria-describedby': 'external',
  },
  render: (args) => (
    <div className="w-80">
      <p id="external">Hasta 5 MB</p>
      <FileInput {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText(/Contrato/) as HTMLInputElement;
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(input).toHaveAccessibleDescription('Hasta 5 MB Sube un PDF');
    await expect(canvas.getByText('Sube un PDF').className).toBe(
      'text-xs text-error-focus font-medium',
    );
    await expect(canvas.getByText('Contrato')).toHaveClass('text-error-focus');

    const trigger = classesOf(canvas.getByText('Choose file'));
    await expect(trigger).toContain('border-error');
    await expect(trigger).toContain('peer-focus-visible:ring-error');
    await expect(trigger).not.toContain('peer-focus-visible:ring-primary');

    pick(input, [file('a.pdf')]);
    await waitFor(() => expect(input).toHaveAccessibleDescription('Hasta 5 MB a.pdf Sube un PDF'));
  },
};

// 6. Texts, variant, size, className and ref, with no leftovers in the DOM.
const inputRef = React.createRef<HTMLInputElement>();
export const Customized: Story = {
  args: {
    chooseLabel: 'Elegir archivo',
    changeLabel: 'Cambiar archivo',
    variant: 'secondary',
    size: 'lg',
    className: 'w-full',
    name: 'adjunto',
  },
  render: (args) => (
    <div className="w-80">
      <FileInput {...args} ref={inputRef} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Elegir archivo') as HTMLInputElement;
    await expect(inputRef.current).toBe(input);
    await expect(input).toHaveAttribute('name', 'adjunto');
    await expect(input).not.toHaveAttribute('chooseLabel');
    await expect(input).not.toHaveAttribute('variant');

    const trigger = classesOf(canvas.getByText('Elegir archivo'));
    await expect(trigger).toContain('h-12');
    await expect(trigger).toContain('bg-secondary');
    await expect(trigger).toContain('w-full');

    pick(input, [file('a.pdf')]);
    await waitFor(() => expect(canvas.getByText('Cambiar archivo')).toBeVisible());
  },
};

// 7. Disabled: the native input is disabled and the trigger doesn't respond.
export const Disabled: Story = {
  args: { label: 'Contrato', disabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText(/Contrato/)).toBeDisabled();
    const trigger = classesOf(canvas.getByText('Choose file'));
    await expect(trigger).toContain('pointer-events-none');
    await expect(trigger).toContain('opacity-50');
  },
};

const onFormChange = fn((event: React.ChangeEvent<HTMLInputElement>) =>
  namesOf(event.target.files),
);

function FormDemo() {
  const [submitted, setSubmitted] = React.useState<string[]>([]);
  return (
    <form
      className="w-80"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget).getAll('adjunto') as File[];
        setSubmitted(data.map(({ name }) => name));
      }}
    >
      <FileInput name="adjunto" accept=".pdf" multiple onChange={onFormChange} />
      <button type="submit">Enviar</button>
      <button type="reset">Limpiar</button>
      <output data-testid="submitted">{submitted.join(',')}</output>
    </form>
  );
}

// 8. In a form: only the valid files are sent, the consumer's onChange reads those same files, and
// a reset also clears the name.
export const InForm: Story = {
  render: () => <FormDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText(/Choose files/) as HTMLInputElement;

    pick(input, [file('a.pdf'), file('b.png', 'image/png')]);
    await canvas.findByTitle('a.pdf');
    await expect(onFormChange).toHaveBeenCalledTimes(1);
    await expect(onFormChange).toHaveReturnedWith(['a.pdf']);

    await userEvent.click(canvas.getByRole('button', { name: 'Enviar' }));
    await expect(canvas.getByTestId('submitted')).toHaveTextContent(/^a\.pdf$/);

    await userEvent.click(canvas.getByRole('button', { name: 'Limpiar' }));
    await waitFor(() => expect(canvas.getByText('Choose files')).toBeVisible());
    await expect(canvas.queryByTitle('a.pdf')).toBeNull();
    await expect(input.files).toHaveLength(0);
  },
};
