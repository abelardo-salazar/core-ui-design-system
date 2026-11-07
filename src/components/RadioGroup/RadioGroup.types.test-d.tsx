// Pure TYPE test (see Badge.types.test-d.tsx for why the .test-d.tsx name): fails `tsc -b` if the
// contract of RadioGroup, RadioGroupItem or RadioCard changes.
import * as React from 'react';
import { RadioCard, RadioGroup, RadioGroupItem } from './RadioGroup';

// --- Valid cases ---------------------------------------------------------------------------

const valid = [
  <RadioGroup key="a" label="Envío" />,
  <RadioGroup key="b" aria-label="Envío" />,
  <RadioGroup
    key="c"
    label="Envío"
    error="Elige uno"
    helperText="Se cobra al confirmar"
    orientation="horizontal"
    name="envio"
    defaultValue="normal"
    required
    disabled
    className="grid grid-cols-2"
    aria-describedby="external"
    ref={React.createRef<HTMLDivElement>()}
  >
    <RadioGroupItem value="normal" label="Normal" description="De 3 a 5 días" />
    <RadioGroupItem value="express" label={<strong>Express</strong>} disabled />
    <RadioCard value="s" title="S" description="Sold out" disabled />
    <RadioCard value="m" title={<span>M</span>} ref={React.createRef<HTMLButtonElement>()} />
  </RadioGroup>,
];

// --- Invalid cases -------------------------------------------------------------------------

const invalid = [
  // @ts-expect-error a name is required: label or aria-label
  <RadioGroup key="d" />,
  // @ts-expect-error label and aria-label are exclusive
  <RadioGroup key="e" label="Envío" aria-label="Envío" />,
  // @ts-expect-error the name comes from label or aria-label, not aria-labelledby
  <RadioGroup key="f" aria-label="Envío" aria-labelledby="otro" />,
  // @ts-expect-error label is text
  <RadioGroup key="g" label={<span />} />,
  // @ts-expect-error a RadioGroupItem needs its label
  <RadioGroupItem key="h" value="normal" />,
  // @ts-expect-error a RadioCard needs its title
  <RadioCard key="i" value="s" />,
  // @ts-expect-error the content comes from title and description, not children
  <RadioCard key="j" value="s" title="S">
    S
  </RadioCard>,
];

void valid;
void invalid;
