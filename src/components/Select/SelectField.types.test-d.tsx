// Pure TYPE test, same as Input.types.test-d.tsx: it isn't run, only `tsc -b` compiles it.
import { SelectField } from './SelectField';
import { SelectItem } from './Select';

const item = <SelectItem value="mx">México</SelectItem>;

// --- Valid cases -----------------------------------------------------------------------

const withLabel = <SelectField label="País">{item}</SelectField>;
const withAriaLabel = <SelectField aria-label="País">{item}</SelectField>;
const withSelectProps = (
  <SelectField
    label="País"
    value="mx"
    onValueChange={(value: string) => value}
    name="country"
    disabled
    required
    size="lg"
    error="Requerido"
    helperText="Ayuda"
  >
    {item}
  </SelectField>
);

// --- Invalid cases: if one stops failing, TS2578 breaks the compilation --------------------

// @ts-expect-error label or aria-label is required
const withoutLabel = <SelectField>{item}</SelectField>;

const withBoth = (
  // @ts-expect-error label and aria-label don't go together
  <SelectField label="País" aria-label="País">
    {item}
  </SelectField>
);

const invalidSize = (
  // @ts-expect-error size only accepts the sm / md / lg scale
  <SelectField label="País" size="xl">
    {item}
  </SelectField>
);

// @ts-expect-error the children are required: they are the options
const withoutChildren = <SelectField label="País" />;

void withLabel;
void withAriaLabel;
void withSelectProps;
void withoutLabel;
void withBoth;
void invalidSize;
void withoutChildren;
