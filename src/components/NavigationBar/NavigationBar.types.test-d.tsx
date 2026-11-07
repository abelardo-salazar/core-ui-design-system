// Pure TYPE test (see Badge.types.test-d.tsx for why the .test-d.tsx name): fails `tsc -b` if
// the guarantees of NavigationBar's aria-label and NavigationBarItem's badgeLabel break.
import { NavigationBar, NavigationBarItem } from './NavigationBar';

const count = 3 as number | undefined;
const badgeLabel = (n: number) => `${n} sin leer`;

// --- Valid cases ---------------------------------------------------------------------------

const valid = [
  <NavigationBar key="a" aria-label="Principal" />,
  <NavigationBarItem key="b" href="/" icon={<svg />}>
    Inicio
  </NavigationBarItem>,
  <NavigationBarItem key="c" asChild active icon={<svg />}>
    <a href="/">Inicio</a>
  </NavigationBarItem>,
  <NavigationBarItem key="d" href="/" icon={<svg />} badge={3} badgeLabel={badgeLabel}>
    Mensajes
  </NavigationBarItem>,
  // A count that may be undefined compiles, with the label always passed.
  <NavigationBarItem key="e" href="/" icon={<svg />} badge={count} badgeLabel={badgeLabel}>
    Mensajes
  </NavigationBarItem>,
];

// --- Invalid cases -------------------------------------------------------------------------

const invalid = [
  // @ts-expect-error aria-label is required
  <NavigationBar key="f" />,
  // @ts-expect-error badge requires badgeLabel
  <NavigationBarItem key="h" href="/" icon={<svg />} badge={3}>
    Mensajes
  </NavigationBarItem>,
  // @ts-expect-error badgeLabel returns a string
  <NavigationBarItem key="i" href="/" icon={<svg />} badge={3} badgeLabel={(n: number) => n}>
    Mensajes
  </NavigationBarItem>,
  // @ts-expect-error badge is numeric
  <NavigationBarItem key="j" href="/" icon={<svg />} badge="3" badgeLabel={badgeLabel}>
    Mensajes
  </NavigationBarItem>,
  // @ts-expect-error icon is required
  <NavigationBarItem key="k" href="/">
    Inicio
  </NavigationBarItem>,
  // @ts-expect-error there is no orientation prop: the form is chosen with variant
  <NavigationBar key="l" aria-label="Principal" orientation="vertical" />,
];

void valid;
void invalid;

// --- variant and bottomBelow ---------------------------------------------------------------

declare const dynamicVariant: 'bottom' | 'horizontal' | 'vertical';

const validVariants = [
  <NavigationBar key="a" aria-label="P" variant="bottom" />,
  <NavigationBar key="b" aria-label="P" variant="horizontal" />,
  <NavigationBar key="c" aria-label="P" variant="vertical" bottomBelow="lg" />,
  <NavigationBar key="d" aria-label="P" variant="horizontal" bottomBelow="sm" />,
  // A dynamic variant without bottomBelow still compiles.
  <NavigationBar key="e" aria-label="P" variant={dynamicVariant} />,
];

const invalidVariants = [
  // @ts-expect-error bottomBelow needs horizontal or vertical
  <NavigationBar key="a" aria-label="P" bottomBelow="md" />,
  // @ts-expect-error bottomBelow makes no sense with 'bottom'
  <NavigationBar key="b" aria-label="P" variant="bottom" bottomBelow="md" />,
  // @ts-expect-error unknown breakpoint
  <NavigationBar key="c" aria-label="P" variant="horizontal" bottomBelow="xl" />,
  // @ts-expect-error unknown variant
  <NavigationBar key="d" aria-label="P" variant="top" />,
  // @ts-expect-error a dynamic variant may be 'bottom': no bottomBelow
  <NavigationBar key="e" aria-label="P" variant={dynamicVariant} bottomBelow="md" />,
];

void validVariants;
void invalidVariants;
