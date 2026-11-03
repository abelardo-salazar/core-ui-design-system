import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { expect } from 'storybook/test';
import { Separator } from './Separator';

// These stories pin the DOM Separator renders: role, aria-orientation, data-orientation, the
// classes and asChild/ref. They were written against @radix-ui/react-separator 1.1.15 and must
// keep passing unchanged with the DS's own implementation.
const meta: Meta<typeof Separator> = {
  title: 'Components/Layout/Separator',
  component: Separator,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof Separator>;

const BASE_CLASSES = ['shrink-0', 'bg-base-300'];
const HORIZONTAL_CLASSES = ['h-[1px]', 'w-full'];
const VERTICAL_CLASSES = ['h-full', 'w-[1px]'];

function only(root: HTMLElement): HTMLElement {
  expect(root.children).toHaveLength(1);
  return root.firstElementChild as HTMLElement;
}

// 1. Default: decorative and horizontal. Out of the accessibility tree (role="none") and
// without aria-orientation.
export const Default: Story = {
  render: () => (
    <div data-testid="root" className="w-64">
      <Separator />
    </div>
  ),
  play: async ({ canvas }) => {
    const el = only(canvas.getByTestId('root'));
    await expect(el.tagName).toBe('DIV');
    await expect(el.getAttribute('role')).toBe('none');
    await expect(el.hasAttribute('aria-orientation')).toBe(false);
    await expect(el.getAttribute('data-orientation')).toBe('horizontal');
    await expect(el).toHaveClass(...BASE_CLASSES, ...HORIZONTAL_CLASSES);
    await expect(el.childNodes).toHaveLength(0);
    // Exact attribute set: nothing else reaches the DOM.
    await expect(el.getAttributeNames().sort()).toEqual(['class', 'data-orientation', 'role']);
  },
};

// 2. Decorative and vertical: still role="none", without aria-orientation.
export const DecorativeVertical: Story = {
  render: () => (
    <div data-testid="root" className="flex h-8">
      <Separator orientation="vertical" />
    </div>
  ),
  play: async ({ canvas }) => {
    const el = only(canvas.getByTestId('root'));
    await expect(el.getAttribute('role')).toBe('none');
    await expect(el.hasAttribute('aria-orientation')).toBe(false);
    await expect(el.getAttribute('data-orientation')).toBe('vertical');
    await expect(el).toHaveClass(...BASE_CLASSES, ...VERTICAL_CLASSES);
    await expect(el).not.toHaveClass(...HORIZONTAL_CLASSES);
  },
};

// 3. Semantic and horizontal: role="separator"; aria-orientation is omitted because
// horizontal is the implicit value of the role.
export const SemanticHorizontal: Story = {
  render: () => (
    <div data-testid="root" className="w-64">
      <Separator decorative={false} />
    </div>
  ),
  play: async ({ canvas }) => {
    const el = only(canvas.getByTestId('root'));
    await expect(canvas.getByRole('separator')).toBe(el);
    await expect(el.hasAttribute('aria-orientation')).toBe(false);
    await expect(el.getAttribute('data-orientation')).toBe('horizontal');
    await expect(el.getAttributeNames().sort()).toEqual(['class', 'data-orientation', 'role']);
  },
};

// 4. Semantic and vertical: role="separator" with aria-orientation="vertical".
export const SemanticVertical: Story = {
  render: () => (
    <div data-testid="root" className="flex h-8">
      <Separator decorative={false} orientation="vertical" />
    </div>
  ),
  play: async ({ canvas }) => {
    const el = only(canvas.getByTestId('root'));
    await expect(canvas.getByRole('separator')).toBe(el);
    await expect(el.getAttribute('aria-orientation')).toBe('vertical');
    await expect(el.getAttribute('data-orientation')).toBe('vertical');
    await expect(el).toHaveClass(...BASE_CLASSES, ...VERTICAL_CLASSES);
  },
};

// 5. An orientation outside the union (a JS consumer, or a cast) falls back to horizontal in
// data-orientation and aria; the orientation classes of cva are left out.
export const InvalidOrientation: Story = {
  render: () => (
    <div data-testid="root" className="w-64">
      <Separator decorative={false} orientation={'diagonal' as unknown as 'horizontal'} />
    </div>
  ),
  play: async ({ canvas }) => {
    const el = only(canvas.getByTestId('root'));
    await expect(el.getAttribute('role')).toBe('separator');
    await expect(el.hasAttribute('aria-orientation')).toBe(false);
    await expect(el.getAttribute('data-orientation')).toBe('horizontal');
    await expect(el).toHaveClass(...BASE_CLASSES);
    await expect(el).not.toHaveClass(...HORIZONTAL_CLASSES, ...VERTICAL_CLASSES);
  },
};

// 6. Extra props reach the div, and they win over the computed role/data-orientation (the
// consumer's props are spread last). className is merged with the variant classes.
export const PropsPassThrough: Story = {
  render: () => (
    <div data-testid="root" className="w-64">
      <Separator
        id="sep"
        className="my-6"
        aria-label="Fin de la sección"
        role="presentation"
        data-orientation="custom"
        style={{ opacity: 0.5 }}
      />
    </div>
  ),
  play: async ({ canvas }) => {
    const el = only(canvas.getByTestId('root'));
    await expect(el.id).toBe('sep');
    await expect(el).toHaveClass('my-6', ...BASE_CLASSES, ...HORIZONTAL_CLASSES);
    await expect(el.getAttribute('aria-label')).toBe('Fin de la sección');
    await expect(el.getAttribute('role')).toBe('presentation');
    await expect(el.getAttribute('data-orientation')).toBe('custom');
    await expect(el.style.opacity).toBe('0.5');
  },
};

// 7. ref points to the rendered div.
function RefProbe() {
  const ref = React.useRef<HTMLDivElement>(null);
  const [tag, setTag] = React.useState('');
  React.useEffect(() => setTag(ref.current?.tagName ?? 'null'), []);
  return (
    <div>
      <div data-testid="root">
        <Separator ref={ref} />
      </div>
      <output data-testid="ref-tag">{tag}</output>
    </div>
  );
}

export const ForwardsRef: Story = {
  render: () => <RefProbe />,
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('DIV')).toBeInTheDocument();
    await expect(canvas.getByTestId('ref-tag').textContent).toBe('DIV');
  },
};

// 8. asChild: the child replaces the div and receives role, data-orientation and the merged
// classes; the forwarded ref and the child's own ref both point to it.
function AsChildProbe() {
  const ref = React.useRef<HTMLDivElement>(null);
  const childRef = React.useRef<HTMLHRElement>(null);
  const [result, setResult] = React.useState('');
  React.useEffect(() => {
    setResult(
      `${ref.current?.tagName ?? 'null'}|${childRef.current?.tagName ?? 'null'}|${ref.current === (childRef.current as unknown)}`,
    );
  }, []);
  return (
    <div>
      <div data-testid="root" className="w-64">
        <Separator asChild ref={ref} decorative={false} orientation="vertical" className="my-2">
          <hr ref={childRef} className="border-0" data-child="" />
        </Separator>
      </div>
      <output data-testid="refs">{result}</output>
    </div>
  );
}

export const AsChild: Story = {
  render: () => <AsChildProbe />,
  play: async ({ canvas }) => {
    const el = only(canvas.getByTestId('root'));
    await expect(el.tagName).toBe('HR');
    await expect(el.hasAttribute('data-child')).toBe(true);
    await expect(el.hasAttribute('asChild')).toBe(false);
    await expect(el.hasAttribute('aschild')).toBe(false);
    await expect(el.getAttribute('role')).toBe('separator');
    await expect(el.getAttribute('aria-orientation')).toBe('vertical');
    await expect(el.getAttribute('data-orientation')).toBe('vertical');
    await expect(el).toHaveClass('border-0', 'my-2', ...BASE_CLASSES, ...VERTICAL_CLASSES);
    await expect(await canvas.findByText('HR|HR|true')).toBeInTheDocument();
  },
};
