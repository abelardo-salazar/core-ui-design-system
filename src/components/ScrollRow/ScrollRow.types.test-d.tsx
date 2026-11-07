// Pure TYPE test (see Badge.types.test-d.tsx for why the .test-d.tsx name): fails `tsc -b` if the
// contract of ScrollRow changes.
import * as React from 'react';
import { ScrollRow, ScrollRowItem } from './ScrollRow';

// --- Valid cases ---------------------------------------------------------------------------

const valid = [
  <ScrollRow key="a" aria-label="Recetas">
    <ScrollRowItem>Uno</ScrollRowItem>
  </ScrollRow>,
  <ScrollRow
    key="b"
    aria-label="Filtros activos"
    controls
    labels={{ previous: 'Anteriores' }}
    className="mt-4"
    id="filtros"
    ref={React.createRef<HTMLDivElement>()}
  >
    <ScrollRowItem className="w-40" ref={React.createRef<HTMLLIElement>()} />
  </ScrollRow>,
];

// --- Invalid cases -------------------------------------------------------------------------

const invalid = [
  // @ts-expect-error aria-label is required: the region needs a name
  <ScrollRow key="c" />,
  // @ts-expect-error the name is aria-label, not aria-labelledby
  <ScrollRow key="d" aria-label="Recetas" aria-labelledby="titulo" />,
  // @ts-expect-error it is always a region
  <ScrollRow key="e" aria-label="Recetas" role="list" />,
  // @ts-expect-error labels are text
  <ScrollRow key="f" aria-label="Recetas" labels={{ next: <span /> }} />,
];

void valid;
void invalid;
