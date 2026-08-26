import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Cross2Icon } from '@radix-ui/react-icons';
import { Button } from './Button';

// Main story configuration
const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'link', 'destructive'],
    },
    size: {
      control: 'radio',
      options: ['sm', 'md', 'lg', 'icon'],
    },
    isLoading: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
    asChild: { control: 'boolean', description: 'Enables polymorphism (render as a, Link, etc)' },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// 1. Base Story (Playground)
export const Default: Story = {
  args: {
    children: 'Button UI',
    variant: 'primary',
    size: 'md',
    onClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Button UI' });

    // Caso nativo habilitado: el click debe disparar el onClick del consumidor
    // tal cual se lo pasamos (la composición de handlers no debe romperse).
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

// 1b. Native disabled: el click no debe disparar el onClick del consumidor.
export const Disabled: Story = {
  args: {
    children: 'Disabled button',
    disabled: true,
    onClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Disabled button' });

    await expect(button).toBeDisabled();

    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

// 2. Main Variants
export const Secondary: Story = {
  args: {
    children: 'Secondary Action',
    variant: 'secondary',
  },
};

export const Outline: Story = {
  args: {
    children: 'Outline Button',
    variant: 'outline',
  },
};

export const Destructive: Story = {
  args: {
    children: 'Delete Account',
    variant: 'destructive',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Delete Account' });
    // El fixture de vitest-browser no expone las variables --color-* derivadas por
    // @theme vía getComputedStyle (ni siquiera para tokens preexistentes como
    // --color-primary-content), así que la aserción de contraste va sobre el token crudo
    // que sí se define directamente en :root, más la clase que lo consume.
    await expect(button.className.split(' ')).toContain('text-error-content');
    await expect(getComputedStyle(document.documentElement).getPropertyValue('--error-content')).toBe(
      '#000000',
    );

    // Hover: --error-focus (fondo) es oscuro mientras --error (fondo base) es claro — al
    // revés que en las demás variantes — así que el texto necesita SU PROPIO -focus-content,
    // distinto del -content del estado base. Sin esto, texto negro sobre el hover oscuro cae
    // a 3.25:1 (ver commit que introdujo --error-focus-content en index.css).
    await expect(button.className.split(' ')).toContain('hover:text-error-focus-content');
    await expect(
      getComputedStyle(document.documentElement).getPropertyValue('--error-focus-content'),
    ).toBe('#ffffff');

    // Dark mode invierte cuál color necesita más contraste (--error-focus pasa a ser un rojo
    // claro), así que --error-focus-content también se invierte: negro, no blanco.
    document.documentElement.classList.add('dark');
    await expect(
      getComputedStyle(document.documentElement).getPropertyValue('--error-focus-content'),
    ).toBe('#000000');
    document.documentElement.classList.remove('dark');
  },
};

// 3. States (Loading)
export const Loading: Story = {
  args: {
    children: 'Saving...',
    isLoading: true,
  },
};

// 4. With Icons
export const WithIcons: Story = {
  args: {
    children: 'Settings',
    startIcon: <span>⚙️</span>, // We use an emoji for simplicity; an Icon component would go here.
  },
};

// 4b. Touch target: size="icon" debe medir 44x44 reales (Apple HIG), sin que el ícono en sí
// (forzado a size-4 por la clase base [&_svg]:size-4, independiente del size del botón) cambie.
// El fixture de vitest-browser no aplica el CSS de utilidades de Tailwind (mismo issue
// documentado en el story Destructive: getComputedStyle no expone lo que generan las
// clases), así que la aserción va sobre las clases, no sobre getBoundingClientRect(); el
// tamaño real en píxeles (44x44 botón, 16x16 ícono) se verificó a mano en Storybook con
// devtools de un navegador real.
export const Icon: Story = {
  args: {
    size: 'icon',
    'aria-label': 'Close',
    children: <Cross2Icon />,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Close' });

    await expect(button.className.split(' ')).toContain('h-11');
    await expect(button.className.split(' ')).toContain('w-11');
    // El ícono no lleva h-4/w-4 propio: depende de [&_svg]:size-4 en la clase base del
    // botón, que es justamente lo que garantiza que el ícono no crece con el hit area.
    await expect(button.className.split(' ')).toContain('[&_svg]:size-4');
    await expect(button.querySelector('svg')).toBeInTheDocument();
  },
};

// 5. Polymorphism (The case you requested)
export const AsLink: Story = {
  args: {
    asChild: true,
    // Notice how we pass an <a> as the direct child.
    // The button will render an <a> tag with button styles.
    children: (
      <a href="https://google.com" target="_blank" rel="noreferrer">
        Go to Google
      </a>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Use `asChild` to render an `<a>` link while keeping the button styles.',
      },
    },
  },
};

// 6. Polymorphism + isLoading: cubre los 3 fixes de la auditoría sobre asChild.
// Usamos el mismo href real que AsLink: como el fix es justamente el preventDefault
// antes de que el navegador navegue, el test nunca llega a abrir la URL.
export const AsLinkLoading: Story = {
  args: {
    asChild: true,
    isLoading: true,
    onClick: fn(),
    children: (
      <a href="https://google.com" target="_blank" rel="noreferrer">
        Go to Google
      </a>
    ),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    // aria-disabled no quita el role="link" del elemento en el árbol de accesibilidad.
    const link = canvas.getByRole('link', { name: 'Go to Google' });

    await expect(link).toHaveAttribute('aria-disabled', 'true');
    await expect(link.className.split(' ')).toContain('pointer-events-none');

    // El fixture de vitest-browser no expone estilos derivados de utilidades de Tailwind vía
    // getComputedStyle (mismo issue documentado en el story Destructive), así que la aserción
    // queda en la clase; se verificó manualmente en Storybook con navegador real que opacity
    // computa a 0.5 cuando aria-disabled="true".
    await expect(link.className.split(' ')).toContain('aria-disabled:opacity-50');

    // Fix de Slottable: el spinner no debe desaparecer cuando el child es un <a> (asChild).
    await expect(link.querySelector('svg.animate-spin')).toBeInTheDocument();

    // Fix de preventDefault: el click no debe disparar el onClick del consumidor
    // ni navegar (pointer-events-none ya lo bloquea a nivel visual/click).
    await userEvent.click(link);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};
