import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { expect, within } from 'storybook/test';
import { AspectRatio } from './AspectRatio';
import { Image } from '../Image';

const meta: Meta<typeof AspectRatio> = {
  title: 'Components/AspectRatio',
  component: AspectRatio,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof AspectRatio>;

// Embedded 1x1 PNG: no dependency on an external network (same value already used in
// Image.stories.tsx and Avatar.stories.tsx). Here the risk was more direct than in those two
// cases: Image (the DS's own, not Radix's AvatarImage) unmounts itself if loading
// fails and there's no fallback, and the play below uses getByAltText without find*/waitFor;
// an external network failure would have made that synchronous assert miss the <img>.
const TINY_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

// 1. Pure ratio: checks the real mechanism (the padding-bottom % that the Radix primitive
// itself computes from ratio), not a live layout measurement; getBoundingClientRect in
// vitest-browser's headless runner may not reflect the padding-bottom trick yet when
// play() runs (unlike Storybook's real browser, where it was checked
// visually: the resulting box is 16:9). The inline padding-bottom is what actually
// drives the layout in any standard browser, so it's the most stable check.
export const Default: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <AspectRatio ratio={16 / 9}>
        <div className="h-full w-full bg-primary" data-testid="ratio-content" />
      </AspectRatio>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const content = canvas.getByTestId('ratio-content');

    const wrapper = canvasElement.querySelector<HTMLElement>('[data-radix-aspect-ratio-wrapper]');
    await expect(wrapper).toBeInTheDocument();
    await expect(parseFloat(wrapper!.style.paddingBottom)).toBeCloseTo(100 / (16 / 9), 1);
    await expect(wrapper!.style.width).toBe('100%');

    // The content passed as children lands in the absolute inset-0 div that Radix puts inside
    // the wrapper; confirms the composition wires the child in the right place.
    await expect(wrapper).toContainElement(content);
  },
};

// 2. AspectRatio + Image: two separate components that compose together, not a single API
// with a ratio prop; same criterion as Popover/Calendar and Popover/DatePicker.
export const WithImage: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <AspectRatio ratio={16 / 9}>
        <Image src={TINY_PNG} alt="Cover photo" />
      </AspectRatio>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const img = canvas.getByAltText('Cover photo');

    const wrapper = canvasElement.querySelector<HTMLElement>('[data-radix-aspect-ratio-wrapper]');
    await expect(wrapper).toBeInTheDocument();
    await expect(wrapper).toContainElement(img);
    await expect(parseFloat(wrapper!.style.paddingBottom)).toBeCloseTo(100 / (16 / 9), 1);
  },
};

// --- DOM parity ------------------------------------------------------------------------------
// The stories below pin the exact DOM AspectRatio renders: two divs, their inline styles, where
// the props land, asChild and ref. They were written against @radix-ui/react-aspect-ratio 1.1.15
// and must keep passing unchanged with the DS's own implementation.

const WRAPPER_STYLE = (paddingBottom: string) =>
  `position: relative; width: 100%; padding-bottom: ${paddingBottom};`;
const INNER_STYLE = 'position: absolute; inset: 0px;';

function wrapperOf(root: HTMLElement): HTMLElement {
  expect(root.children).toHaveLength(1);
  return root.firstElementChild as HTMLElement;
}

// 3. Structure: wrapper div (ratio via padding-bottom) > inner div (absolute, fills the wrapper)
// > children. The wrapper only has style and data-radix-aspect-ratio-wrapper.
export const Structure: Story = {
  render: () => (
    <div data-testid="root" style={{ width: 320 }}>
      <AspectRatio ratio={16 / 9}>
        <span>Contenido</span>
      </AspectRatio>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const wrapper = wrapperOf(canvas.getByTestId('root'));
    await expect(wrapper.tagName).toBe('DIV');
    await expect(wrapper.getAttributeNames().sort()).toEqual([
      'data-radix-aspect-ratio-wrapper',
      'style',
    ]);
    await expect(wrapper.getAttribute('data-radix-aspect-ratio-wrapper')).toBe('');
    await expect(wrapper.getAttribute('style')).toBe(WRAPPER_STYLE('56.25%'));
    await expect(wrapper.children).toHaveLength(1);
    const inner = wrapper.firstElementChild as HTMLElement;
    await expect(inner.tagName).toBe('DIV');
    await expect(inner.getAttributeNames()).toEqual(['style']);
    await expect(inner.getAttribute('style')).toBe(INNER_STYLE);
    await expect(inner.innerHTML).toBe('<span>Contenido</span>');
  },
};

// 4. Without ratio, the default is 1 (square): padding-bottom 100%.
export const DefaultRatio: Story = {
  render: () => (
    <div data-testid="root" style={{ width: 200 }}>
      <AspectRatio />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const wrapper = wrapperOf(canvas.getByTestId('root'));
    await expect(wrapper.getAttribute('style')).toBe(WRAPPER_STYLE('100%'));
    await expect((wrapper.firstElementChild as HTMLElement).childNodes).toHaveLength(0);
  },
};

// 5. The props go to the inner div, not to the wrapper. The consumer's style is merged on the
// inner div, but the positioning styles win (they're applied after it).
export const PropsOnInner: Story = {
  render: () => (
    <div data-testid="root" style={{ width: 320 }}>
      <AspectRatio
        ratio={4 / 3}
        id="cover"
        className="rounded-box bg-base-200"
        aria-label="Portada"
        data-foo="bar"
        style={{ backgroundColor: 'red', position: 'static', top: 10 }}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const wrapper = wrapperOf(canvas.getByTestId('root'));
    await expect(wrapper.getAttributeNames().sort()).toEqual([
      'data-radix-aspect-ratio-wrapper',
      'style',
    ]);
    await expect(wrapper.getAttribute('style')).toBe(WRAPPER_STYLE('75%'));
    const inner = wrapper.firstElementChild as HTMLElement;
    await expect(inner.id).toBe('cover');
    await expect(inner.className).toBe('rounded-box bg-base-200');
    await expect(inner.getAttribute('aria-label')).toBe('Portada');
    await expect(inner.getAttribute('data-foo')).toBe('bar');
    await expect(inner.getAttribute('style')).toBe(
      'background-color: red; position: absolute; inset: 0px;',
    );
  },
};

// 6. ref points to the inner div (the one that receives the props), not to the wrapper.
function RefProbe() {
  const ref = React.useRef<HTMLDivElement>(null);
  const [result, setResult] = React.useState('');
  React.useEffect(() => {
    const el = ref.current;
    setResult(`${el?.tagName}|${el?.hasAttribute('data-radix-aspect-ratio-wrapper')}`);
  }, []);
  return (
    <div>
      <AspectRatio ref={ref} />
      <output data-testid="ref">{result}</output>
    </div>
  );
}

export const ForwardsRef: Story = {
  render: () => <RefProbe />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText('DIV|false')).toBeInTheDocument();
  },
};

// 7. asChild: the child replaces the inner div, takes its props and the positioning styles
// (the child's own style wins on conflict), and both refs point to it. The wrapper is still a
// div.
function AsChildProbe() {
  const ref = React.useRef<HTMLDivElement>(null);
  const childRef = React.useRef<HTMLImageElement>(null);
  const [result, setResult] = React.useState('');
  React.useEffect(() => {
    setResult(
      `${ref.current?.tagName ?? 'null'}|${childRef.current?.tagName ?? 'null'}|${ref.current === (childRef.current as unknown)}`,
    );
  }, []);
  return (
    <div>
      <div data-testid="root" style={{ width: 320 }}>
        <AspectRatio asChild ratio={2} ref={ref} className="rounded-box">
          <img
            ref={childRef}
            src={TINY_PNG}
            alt="Miniatura"
            className="object-cover"
            style={{ objectFit: 'cover', top: 5 }}
          />
        </AspectRatio>
      </div>
      <output data-testid="refs">{result}</output>
    </div>
  );
}

export const AsChild: Story = {
  render: () => <AsChildProbe />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const wrapper = wrapperOf(canvas.getByTestId('root'));
    await expect(wrapper.tagName).toBe('DIV');
    await expect(wrapper.getAttribute('style')).toBe(WRAPPER_STYLE('50%'));
    await expect(wrapper.children).toHaveLength(1);
    const img = wrapper.firstElementChild as HTMLElement;
    await expect(img).toBe(canvas.getByAltText('Miniatura'));
    await expect(img.hasAttribute('aschild')).toBe(false);
    await expect(img.className).toBe('rounded-box object-cover');
    await expect(img.getAttribute('style')).toBe(
      'position: absolute; inset: 5px 0px 0px; object-fit: cover;',
    );
    await expect(await canvas.findByText('IMG|IMG|true')).toBeInTheDocument();
  },
};
