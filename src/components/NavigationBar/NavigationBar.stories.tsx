import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { createPortal } from 'react-dom';
import { expect, userEvent, waitFor, within } from 'storybook/test';
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

const sections = [
  { href: '#inicio', label: 'Inicio', icon: <HomeIcon /> },
  { href: '#mensajes', label: 'Mensajes', icon: <EnvelopeClosedIcon />, badge: 3 },
  { href: '#avisos', label: 'Notificaciones', icon: <BellIcon /> },
  { href: '#perfil', label: 'Perfil', icon: <PersonIcon /> },
  { href: '#ajustes', label: 'Ajustes de la cuenta', icon: <GearIcon /> },
];

const items = (count = sections.length) =>
  sections.slice(0, count).map(({ href, label, icon, badge }, index) => (
    <NavigationBarItem
      key={href}
      href={href}
      icon={icon}
      active={index === 0}
      {...(badge ? { badge, badgeLabel: unreadLabel } : {})}
    >
      {label}
    </NavigationBarItem>
  ));

const classesOf = (element: Element) => element.className.split(' ').filter(Boolean);

// 6. 'bottom' (default) keeps the <nav> and <ul> exactly as before the variants: no data
// attributes, no group, the same classes.
export const BottomUnchanged: Story = {
  render: () => <NavigationBar aria-label="Principal">{items(3)}</NavigationBar>,
  play: async ({ canvasElement }) => {
    const nav = within(canvasElement).getByRole('navigation', { name: 'Principal' });
    await expect(nav).not.toHaveAttribute('data-variant');
    await expect(nav).not.toHaveAttribute('data-bottom-below');
    await expect(classesOf(nav).sort()).toEqual(
      ['border-t', 'border-base-300', 'bg-base-100', 'pb-[env(safe-area-inset-bottom)]'].sort(),
    );
    await expect(nav.querySelector('ul')?.className).toBe('flex');
    await expect(nav.querySelector('li')).toHaveClass('min-w-0', 'flex-1');
  },
};

// 7. horizontal: the <nav> is the group the items read the variant from (no Context, still
// server-safe). Native sideways scroll without a visible bar; the active item has a bottom border.
export const Horizontal: Story = {
  render: () => (
    <NavigationBar aria-label="Secciones" variant="horizontal">
      {items()}
    </NavigationBar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nav = canvas.getByRole('navigation', { name: 'Secciones' });
    await expect(nav).toHaveAttribute('data-variant', 'horizontal');
    await expect(nav).not.toHaveAttribute('data-bottom-below');
    await expect(nav).not.toHaveAttribute('variant');
    await expect(nav).toHaveClass('group/navigation-bar', 'border-b');
    await expect(classesOf(nav)).not.toContain('pb-[env(safe-area-inset-bottom)]');
    await expect(nav.querySelector('ul')).toHaveClass(
      'overflow-x-auto',
      '[scrollbar-width:none]',
      '[&::-webkit-scrollbar]:hidden',
    );

    const active = canvas.getByRole('link', { name: 'Inicio' });
    await expect(active).toHaveAttribute('aria-current', 'page');
    await expect(active).toHaveClass(
      'group-data-[variant=horizontal]/navigation-bar:h-11',
      'group-data-[variant=horizontal]/navigation-bar:border-b-2',
    );
    await expect(canvas.getByRole('link', { name: 'Perfil' })).not.toHaveClass(
      'group-data-[variant=horizontal]/navigation-bar:border-b-2',
    );
    await expect(canvas.getByRole('link', { name: 'Mensajes 3 sin leer' })).toBeVisible();
  },
};

// 8. vertical and bottomBelow reach the DOM only as data attributes, never as props.
export const Vertical: Story = {
  render: () => (
    <div className="w-64">
      <NavigationBar aria-label="Lateral" variant="vertical" bottomBelow="md">
        {items()}
      </NavigationBar>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nav = canvas.getByRole('navigation', { name: 'Lateral' });
    await expect(nav).toHaveAttribute('data-variant', 'vertical');
    await expect(nav).toHaveAttribute('data-bottom-below', 'md');
    await expect(nav).not.toHaveAttribute('bottomBelow');
    await expect(nav).toHaveClass('border-e', 'max-md:border-t');
    await expect(nav.querySelector('ul')).toHaveClass('flex-col', 'max-md:flex-row');
    for (const { label } of sections) {
      await expect(within(nav).getByText(label)).toBeVisible();
    }
  },
};

const rect = (element: Element) => element.getBoundingClientRect();
const style = (element: Element) => getComputedStyle(element);

// 9. horizontal with the CSS applied: 44px items, icon beside text, scroll without a visible bar
// when they don't fit, and Tab brings a hidden item into the list's view, without JS (an item
// already partly visible gets focus without scrolling: that's the browser's own behavior).
export const HorizontalLayout: Story = {
  tags: ['real-css'],
  render: () => (
    <div className="w-80">
      <NavigationBar aria-label="Secciones" variant="horizontal">
        {items()}
      </NavigationBar>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvasElement.querySelector('ul')!;
    const links = canvas.getAllByRole('link');
    for (const link of links) {
      await expect(rect(link).height).toBe(44);
      await expect(style(link).flexDirection).toBe('row');
    }
    await expect(style(links[0]).borderBottomWidth).toBe('2px');
    await expect(style(links[1]).borderBottomWidth).toBe('0px');
    // No pill outside 'bottom': the active icon has no background.
    await expect(style(links[0].querySelector('[aria-hidden]')!).backgroundColor).toBe(
      'rgba(0, 0, 0, 0)',
    );

    await expect(list.scrollWidth).toBeGreaterThan(list.clientWidth);
    await expect(style(list).scrollbarWidth).toBe('none');
    await expect(list.scrollLeft).toBe(0);
    for (let i = 0; i < links.length; i++) await userEvent.tab();
    await expect(links.at(-1)).toHaveFocus();
    await expect(list.scrollLeft).toBeGreaterThan(0);
  },
};

// Media queries follow the viewport, not a container: to test both sides of a breakpoint in one
// run, each case renders in an iframe of fixed width, with the page's stylesheets copied in.
const InFrame = ({
  title,
  width,
  children,
}: {
  title: string;
  width: number;
  children: React.ReactNode;
}) => {
  const [body, setBody] = React.useState<HTMLElement | null>(null);
  const frameRef = React.useRef<HTMLIFrameElement>(null);
  React.useEffect(() => {
    const doc = frameRef.current!.contentDocument!;
    for (const node of document.head.querySelectorAll('style, link[rel="stylesheet"]')) {
      doc.head.appendChild(node.cloneNode(true));
    }
    setBody(doc.body);
  }, []);
  return (
    <iframe ref={frameRef} title={title} style={{ width, height: 420, border: 0 }}>
      {body && createPortal(children, body)}
    </iframe>
  );
};

const frameContent = (
  <div className="flex flex-col gap-4">
    <NavigationBar aria-label="Fila" variant="horizontal" bottomBelow="sm">
      {items(4)}
    </NavigationBar>
    <NavigationBar aria-label="Columna" variant="vertical" bottomBelow="lg">
      {items(4)}
    </NavigationBar>
    <NavigationBar aria-label="Referencia">{items(4)}</NavigationBar>
  </div>
);

const styleIn = (element: Element) => element.ownerDocument.defaultView!.getComputedStyle(element);

// 10. bottomBelow with the CSS applied. At 600px (below sm and lg), horizontal and vertical take
// the 'bottom' form, item by item the same geometry as the default bar. At 1100px they keep
// their own form.
export const BottomBelowLayout: Story = {
  tags: ['real-css'],
  render: () => (
    <div className="flex flex-col gap-4">
      <InFrame title="Estrecho" width={600}>
        {frameContent}
      </InFrame>
      <InFrame title="Ancho" width={1100}>
        {frameContent}
      </InFrame>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const frameBody = async (title: string) => {
      const frame = within(canvasElement).getByTitle(title) as HTMLIFrameElement;
      await waitFor(() =>
        expect(frame.contentDocument!.querySelectorAll('nav li').length).toBeGreaterThan(0),
      );
      return within(frame.contentDocument!.body);
    };

    const narrow = await frameBody('Estrecho');
    const referenceLinks = within(
      narrow.getByRole('navigation', { name: 'Referencia' }),
    ).getAllByRole('link');
    for (const name of ['Fila', 'Columna']) {
      const nav = narrow.getByRole('navigation', { name });
      const list = nav.querySelector('ul')!;
      await expect(styleIn(nav).borderTopWidth).toBe('1px');
      await expect(styleIn(nav).borderBottomWidth).toBe('0px');
      await expect(styleIn(nav).borderInlineEndWidth).toBe('0px');
      await expect(styleIn(list).flexDirection).toBe('row');
      await expect(styleIn(list).overflowX).toBe('visible');

      for (const [index, link] of within(nav).getAllByRole('link').entries()) {
        const expected = referenceLinks[index];
        await expect(styleIn(link).flexDirection).toBe('column');
        await expect(rect(link).height).toBe(rect(expected).height);
        await expect(rect(link).width).toBe(rect(expected).width);
        await expect(styleIn(link).borderBottomWidth).toBe('0px');
        await expect(styleIn(link).borderInlineStartWidth).toBe('0px');
        await expect(styleIn(link).paddingInlineStart).toBe(styleIn(expected).paddingInlineStart);
        const icon = link.querySelector('[aria-hidden]')!;
        const expectedIcon = expected.querySelector('[aria-hidden]')!;
        await expect(rect(icon).width).toBe(56);
        await expect(styleIn(icon).backgroundColor).toBe(styleIn(expectedIcon).backgroundColor);
        const badge = icon.querySelector('span');
        if (badge) {
          const expectedBadge = expectedIcon.querySelector('span')!;
          await expect(rect(badge).left - rect(icon).left).toBe(
            rect(expectedBadge).left - rect(expectedIcon).left,
          );
        }
      }
    }

    const wide = await frameBody('Ancho');
    const row = wide.getByRole('navigation', { name: 'Fila' });
    for (const link of within(row).getAllByRole('link')) {
      await expect(styleIn(link).flexDirection).toBe('row');
      await expect(rect(link).height).toBe(44);
    }
    const column = wide.getByRole('navigation', { name: 'Columna' });
    await expect(styleIn(column.querySelector('ul')!).flexDirection).toBe('column');
    await expect(
      styleIn(within(column).getByRole('link', { name: 'Inicio' })).borderInlineStartWidth,
    ).toBe('2px');
  },
};

// 11. vertical with the CSS applied: full-width items of at least 44px, text at the start and
// always visible; the active item's start border doesn't move its icon.
export const VerticalLayout: Story = {
  tags: ['real-css'],
  render: () => (
    <div className="w-56">
      <NavigationBar aria-label="Lateral" variant="vertical">
        {items()}
      </NavigationBar>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const nav = within(canvasElement).getByRole('navigation', { name: 'Lateral' });
    const links = within(nav).getAllByRole('link');
    const listWidth = rect(nav.querySelector('ul')!).width;
    for (const link of links) {
      await expect(rect(link).width).toBe(listWidth);
      await expect(rect(link).height).toBeGreaterThanOrEqual(44);
      await expect(style(link).flexDirection).toBe('row');
      await expect(style(link).justifyContent).toBe('flex-start');
    }
    await expect(style(links[0]).borderInlineStartWidth).toBe('2px');
    await expect(style(links[1]).borderInlineStartWidth).toBe('0px');
    const iconLeft = (link: HTMLElement) => rect(link.querySelector('[aria-hidden]')!).left;
    await expect(iconLeft(links[0])).toBe(iconLeft(links[1]));
    // The longest label wraps instead of being cut.
    const long = within(nav).getByRole('link', { name: 'Ajustes de la cuenta' });
    await expect(long.scrollWidth).toBeLessThanOrEqual(long.clientWidth);
  },
};
