import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import {
  BellIcon,
  EnvelopeClosedIcon,
  GearIcon,
  HomeIcon,
  PersonIcon,
} from '@radix-ui/react-icons';
import { NavigationBar, NavigationBarItem } from './NavigationBar';

const meta: Meta<typeof NavigationBar> = {
  title: 'Components/NavigationBar',
  component: NavigationBar,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof NavigationBar>;

const unreadLabel = (n: number) => `${n} sin leer`;

// Stands in for next/link and React Router's Link: a component of the consumer that receives
// href + props and renders an <a>.
const RouterLink = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }
>(({ to, children, ...props }, ref) => (
  <a ref={ref} href={to} data-router-link {...props}>
    {children}
  </a>
));
RouterLink.displayName = 'RouterLink';

// 1. Base: <nav> with its name, list of links, one current item, text always visible.
export const Default: Story = {
  render: () => (
    <NavigationBar aria-label="Principal">
      <NavigationBarItem href="#inicio" active icon={<HomeIcon />}>
        Inicio
      </NavigationBarItem>
      <NavigationBarItem href="#mensajes" icon={<EnvelopeClosedIcon />}>
        Mensajes
      </NavigationBarItem>
      <NavigationBarItem href="#avisos" icon={<BellIcon />}>
        Avisos
      </NavigationBarItem>
      <NavigationBarItem href="#perfil" icon={<PersonIcon />}>
        Perfil
      </NavigationBarItem>
    </NavigationBar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const nav = canvas.getByRole('navigation', { name: 'Principal' });
    await expect(nav.tagName).toBe('NAV');
    await expect(canvas.getAllByRole('listitem')).toHaveLength(4);

    // Safe-area padding yes, positioning no: that belongs to the consumer's layout.
    await expect(nav.className.split(' ')).toContain('pb-[env(safe-area-inset-bottom)]');
    await expect(nav.className).not.toMatch(/\b(fixed|sticky|absolute)\b/);

    const active = canvas.getByRole('link', { name: 'Inicio' });
    await expect(active).toHaveAttribute('aria-current', 'page');
    await expect(active).not.toHaveAttribute('active');
    await expect(active.className.split(' ')).toContain('min-h-14');

    for (const name of ['Mensajes', 'Avisos', 'Perfil']) {
      const link = canvas.getByRole('link', { name });
      await expect(link).not.toHaveAttribute('aria-current');
      await expect(link.className.split(' ')).toContain('min-h-14');
      await expect(within(link).getByText(name)).toBeVisible();
    }

    // The indicator is a shape, not only color: the active item has the pill, the others don't.
    const pillOf = (link: HTMLElement) => link.querySelector('[aria-hidden]');
    await expect(pillOf(active)).toHaveClass('bg-primary', 'border');
    await expect(pillOf(canvas.getByRole('link', { name: 'Mensajes' }))).not.toHaveClass(
      'bg-primary',
    );
  },
};

// 2. Badge: the number is decorative and badgeLabel's text enters the accessible name.
// A zero or a missing count shows nothing.
export const WithBadge: Story = {
  render: () => (
    <NavigationBar aria-label="Principal">
      <NavigationBarItem href="#inicio" active icon={<HomeIcon />}>
        Inicio
      </NavigationBarItem>
      <NavigationBarItem
        href="#mensajes"
        icon={<EnvelopeClosedIcon />}
        badge={3}
        badgeLabel={unreadLabel}
      >
        Mensajes
      </NavigationBarItem>
      <NavigationBarItem href="#avisos" icon={<BellIcon />} badge={0} badgeLabel={unreadLabel}>
        Avisos
      </NavigationBarItem>
      <NavigationBarItem href="#perfil" icon={<PersonIcon />} badgeLabel={unreadLabel}>
        Perfil
      </NavigationBarItem>
    </NavigationBar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const messages = canvas.getByRole('link', { name: 'Mensajes 3 sin leer' });
    await expect(messages.querySelector('[aria-hidden]')).toHaveTextContent('3');
    await expect(messages).not.toHaveAttribute('badge');
    await expect(messages).not.toHaveAttribute('badgelabel');

    await expect(canvas.getByRole('link', { name: 'Avisos' }).textContent).toBe('Avisos');
    await expect(canvas.getByRole('link', { name: 'Perfil' }).textContent).toBe('Perfil');
  },
};

// 3. asChild: icon, text and badge end up inside the consumer's Link, with one single <a>
// per item and the item's props merged into it.
export const AsChild: Story = {
  render: () => (
    <NavigationBar aria-label="Principal">
      <NavigationBarItem asChild active icon={<HomeIcon data-testid="icon" />}>
        <RouterLink to="#inicio" className="clase-del-consumidor">
          Inicio
        </RouterLink>
      </NavigationBarItem>
      <NavigationBarItem asChild icon={<EnvelopeClosedIcon />} badge={12} badgeLabel={unreadLabel}>
        <RouterLink to="#mensajes">Mensajes</RouterLink>
      </NavigationBarItem>
    </NavigationBar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getAllByRole('link')).toHaveLength(2);

    const active = canvas.getByRole('link', { name: 'Inicio' });
    await expect(active).toHaveAttribute('data-router-link');
    await expect(active).toHaveAttribute('href', '#inicio');
    await expect(active).toHaveAttribute('aria-current', 'page');
    await expect(active.className.split(' ')).toEqual(
      expect.arrayContaining(['min-h-14', 'clase-del-consumidor']),
    );
    await expect(active).toContainElement(canvas.getByTestId('icon'));
    await expect(active.parentElement?.tagName).toBe('LI');

    const messages = canvas.getByRole('link', { name: 'Mensajes 12 sin leer' });
    await expect(messages).toHaveAttribute('data-router-link');
    await expect(messages.querySelector('[aria-hidden]')).toHaveTextContent('12');
  },
};

// 4. Five items, the documented maximum, with a long label: it wraps inside its own item instead
// of running over the neighbor at 320px.
export const FiveItemsLongLabel: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <NavigationBar aria-label="Principal">
      <NavigationBarItem href="#inicio" active icon={<HomeIcon />}>
        Inicio
      </NavigationBarItem>
      <NavigationBarItem href="#mensajes" icon={<EnvelopeClosedIcon />}>
        Mensajes
      </NavigationBarItem>
      <NavigationBarItem href="#avisos" icon={<BellIcon />} badge={120} badgeLabel={unreadLabel}>
        Notificaciones
      </NavigationBarItem>
      <NavigationBarItem href="#perfil" icon={<PersonIcon />}>
        Perfil
      </NavigationBarItem>
      <NavigationBarItem href="#ajustes" icon={<GearIcon />}>
        Ajustes
      </NavigationBarItem>
    </NavigationBar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('link')).toHaveLength(5);
    await expect(
      canvas.getByRole('link', { name: 'Notificaciones 120 sin leer' }).className.split(' '),
    ).toContain('[overflow-wrap:anywhere]');
  },
};

// 5. Full layout: the consumer positions the bar and reserves the space in the content, the
// pattern documented in the README. Not a test of the component's own styles.
export const FullLayout: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <>
      <main className="space-y-4 p-4 pb-[calc(4rem+env(safe-area-inset-bottom))]">
        {Array.from({ length: 30 }, (_, index) => (
          <p key={index}>Contenido de la sección, párrafo {index + 1}.</p>
        ))}
      </main>
      <NavigationBar aria-label="Principal" className="fixed inset-x-0 bottom-0">
        <NavigationBarItem href="#inicio" active icon={<HomeIcon />}>
          Inicio
        </NavigationBarItem>
        <NavigationBarItem
          href="#mensajes"
          icon={<EnvelopeClosedIcon />}
          badge={3}
          badgeLabel={unreadLabel}
        >
          Mensajes
        </NavigationBarItem>
        <NavigationBarItem href="#perfil" icon={<PersonIcon />}>
          Perfil
        </NavigationBarItem>
      </NavigationBar>
    </>
  ),
  play: async ({ canvasElement }) => {
    const nav = within(canvasElement).getByRole('navigation', { name: 'Principal' });
    await expect(nav.className.split(' ')).toEqual(
      expect.arrayContaining(['fixed', 'inset-x-0', 'bottom-0']),
    );
  },
};
