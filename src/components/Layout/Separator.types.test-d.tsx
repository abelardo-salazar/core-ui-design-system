// Pure TYPE test (see Badge.types.test-d.tsx for why the .test-d.tsx name): fails `tsc -b` if
// Separator's props drift from the ones it had as a wrapper of @radix-ui/react-separator.
import * as React from 'react';
import { Separator } from './Separator';

// --- Valid cases ---------------------------------------------------------------------------

const ref = React.createRef<HTMLDivElement>();
const valid = [
  <Separator key="a" />,
  <Separator key="b" orientation="vertical" decorative={false} className="mx-2" />,
  <Separator key="c" ref={ref} id="sep" aria-label="Fin" style={{ opacity: 0.5 }} />,
  <Separator key="d" asChild>
    <hr />
  </Separator>,
];

// --- Invalid cases -------------------------------------------------------------------------

const invalid = [
  // @ts-expect-error orientation is 'horizontal' | 'vertical'
  <Separator key="e" orientation="diagonal" />,
  // @ts-expect-error decorative is a boolean
  <Separator key="f" decorative="yes" />,
  // @ts-expect-error asChild is a boolean
  <Separator key="g" asChild="true" />,
  // @ts-expect-error the ref is an HTMLDivElement
  <Separator key="h" ref={React.createRef<HTMLSpanElement>()} />,
];

void valid;
void invalid;
