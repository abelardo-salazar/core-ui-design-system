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
  // @ts-expect-error there is no vertical orientation
  <NavigationBar key="l" aria-label="Principal" orientation="vertical" />,
];

void valid;
void invalid;
