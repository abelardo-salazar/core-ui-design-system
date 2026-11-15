// Pure TYPE test (see Badge.types.test-d.tsx for why the .test-d.tsx name): fails `tsc -b` if
// the guarantees of Breadcrumb's aria-label and BreadcrumbItem's current item break.
import { Breadcrumb, BreadcrumbItem } from './Breadcrumb';

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
];

void valid;
void invalid;
