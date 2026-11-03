// Pure TYPE test (see Badge.types.test-d.tsx for why the .test-d.tsx name): fails `tsc -b` if
// CheckboxField stops accepting the props of Checkbox or requiring its label.
import * as React from 'react';
import { CheckboxField } from './CheckboxField';

// --- Valid cases ---------------------------------------------------------------------------

const valid = [
  <CheckboxField key="a" label="Términos" />,
  <CheckboxField
    key="b"
    label={<b>Términos</b>}
    description="Detalle"
    checked="indeterminate"
    onCheckedChange={(checked: boolean | 'indeterminate') => void checked}
    disabled
    name="terminos"
    id="terminos"
    className="px-4"
    ref={React.createRef<HTMLButtonElement>()}
  />,
];

// --- Invalid cases -------------------------------------------------------------------------

const invalid = [
  // @ts-expect-error label is required
  <CheckboxField key="c" />,
  // @ts-expect-error checked is a boolean or 'indeterminate'
  <CheckboxField key="d" label="Términos" checked="true" />,
  // @ts-expect-error the content goes in label and description
  <CheckboxField key="e" label="Términos">
    Hijo
  </CheckboxField>,
];

void valid;
void invalid;
