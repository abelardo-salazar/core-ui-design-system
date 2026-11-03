// Pure TYPE test (see Badge.types.test-d.tsx for why the .test-d.tsx name): fails `tsc -b` if
// SwitchField stops accepting the props of Switch or requiring its label.
import * as React from 'react';
import { SwitchField } from './SwitchField';

// --- Valid cases ---------------------------------------------------------------------------

const valid = [
  <SwitchField key="a" label="Avisos" />,
  <SwitchField
    key="b"
    label={<b>Avisos</b>}
    description="Detalle"
    checked
    onCheckedChange={(checked: boolean) => void checked}
    disabled
    name="avisos"
    id="avisos"
    className="px-4"
    ref={React.createRef<HTMLButtonElement>()}
  />,
];

// --- Invalid cases -------------------------------------------------------------------------

const invalid = [
  // @ts-expect-error label is required
  <SwitchField key="c" />,
  // @ts-expect-error checked is a boolean
  <SwitchField key="d" label="Avisos" checked="true" />,
  // @ts-expect-error the content goes in label and description
  <SwitchField key="e" label="Avisos">
    Hijo
  </SwitchField>,
];

void valid;
void invalid;
