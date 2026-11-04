// Pure TYPE test (see Badge.types.test-d.tsx for why the .test-d.tsx name): fails `tsc -b` if a
// Toggle without text stops requiring its aria-label.
import * as React from 'react';
import { Toggle } from './Toggle';

const icon = <svg />;

// --- Valid cases ---------------------------------------------------------------------------

const valid = [
  <Toggle key="a">Negrita</Toggle>,
  <Toggle key="b" icon={icon}>
    Negrita
  </Toggle>,
  <Toggle key="c" icon={icon} aria-label="Negrita" />,
  <Toggle key="d" aria-label="Poner en negrita">
    N
  </Toggle>,
  <Toggle
    key="e"
    size="sm"
    pressed
    defaultPressed={false}
    onPressedChange={(pressed: boolean) => void pressed}
    disabled
    className="w-full"
    ref={React.createRef<HTMLButtonElement>()}
  >
    Negrita
  </Toggle>,
];

// --- Invalid cases -------------------------------------------------------------------------

const invalid = [
  // @ts-expect-error without children, aria-label is required
  <Toggle key="f" icon={icon} />,
  // @ts-expect-error without children, there must be an icon
  <Toggle key="g" aria-label="Negrita" />,
  // @ts-expect-error neither text nor icon
  <Toggle key="h" />,
  // @ts-expect-error the scale is sm, md and lg
  <Toggle key="j" size="xl">
    Negrita
  </Toggle>,
  // @ts-expect-error pressed is a boolean
  <Toggle key="k" pressed="true">
    Negrita
  </Toggle>,
  // @ts-expect-error asChild isn't supported: the icon and the text are siblings
  <Toggle key="l" asChild>
    Negrita
  </Toggle>,
];

void valid;
void invalid;
