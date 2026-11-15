// Pure TYPE test (see Badge.types.test-d.tsx for why the .test-d.tsx name): fails `tsc -b` if
// the guarantees of Breadcrumb's aria-label and BreadcrumbItem's current item break.
import { Breadcrumb, BreadcrumbItem } from './Breadcrumb';

const trail = [
  { href: '/destinos', label: 'Destinos' },
  { href: '/destinos/playa', label: 'Playa' },
  { href: '/destinos/playa/cancun', label: 'Cancún' },
];
declare const isLast: boolean;

// --- Valid cases ---------------------------------------------------------------------------

const valid = [
  <Breadcrumb key="a" aria-label="Ruta" />,
  // A regular item is a link with href.
  <BreadcrumbItem key="b" href="/destinos">
    Destinos
  </BreadcrumbItem>,
  <BreadcrumbItem key="c" asChild>
    <a href="/destinos">Destinos</a>
  </BreadcrumbItem>,
  <BreadcrumbItem key="d" active>
    Cancún
  </BreadcrumbItem>,
  // A dynamic current item is a fork in the JSX: the last one is text, the others are links.
  ...trail.map(({ href, label }, index) =>
    index === trail.length - 1 ? (
      <BreadcrumbItem key={href} active>
        {label}
      </BreadcrumbItem>
    ) : (
      <BreadcrumbItem key={href} href={href}>
        {label}
      </BreadcrumbItem>
    ),
  ),
];

// --- Invalid cases -------------------------------------------------------------------------

const invalid = [
  // @ts-expect-error aria-label is required: there is no default text
  <Breadcrumb key="e" />,
  // @ts-expect-error the current item is text, not a link: no href
  <BreadcrumbItem key="f" active href="/cancun">
    Cancún
  </BreadcrumbItem>,
  // @ts-expect-error the current item is text, not a link: no asChild
  <BreadcrumbItem key="g" active asChild>
    <a href="/cancun">Cancún</a>
  </BreadcrumbItem>,
  // @ts-expect-error a boolean active may be true, and the current item takes no href: fork in the JSX
  <BreadcrumbItem key="h" href="/cancun" active={isLast}>
    Cancún
  </BreadcrumbItem>,
  // @ts-expect-error a link item needs href or asChild: without them it's an <a> with no href
  <BreadcrumbItem key="i">Destinos</BreadcrumbItem>,
  // @ts-expect-error a boolean active without href: its false half would be a link with no href
  <BreadcrumbItem key="j" active={isLast}>
    Cancún
  </BreadcrumbItem>,
];

void valid;
void invalid;
