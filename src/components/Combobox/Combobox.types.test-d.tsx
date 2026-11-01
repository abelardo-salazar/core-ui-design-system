// Pure TYPE test, same as Input.types.test-d.tsx: it isn't run, only `tsc -b` compiles it.
import { Combobox } from './Combobox';

const options = [{ value: 'mx', label: 'México' }];

// --- Valid cases -----------------------------------------------------------------------

const withLabel = <Combobox label="País" options={options} />;
const withAriaLabel = <Combobox aria-label="País" options={options} />;
const multipleWithLabel = <Combobox label="Países" multiple options={options} defaultValue={[]} />;
const inlineWithAriaLabel = <Combobox aria-label="País" mode="inline" options={options} />;
const inlineQuery = (
  <Combobox aria-label="País" mode="inline" listVisibility="query" options={options} />
);
const inlineFocusMultiple = (
  <Combobox label="Países" mode="inline" listVisibility="focus" multiple options={options} />
);
declare const dynamicMode: 'popover' | 'inline';
// Dynamic mode without listVisibility still compiles.
const withDynamicMode = <Combobox aria-label="País" mode={dynamicMode} options={options} />;

// --- Invalid cases: if one stops failing, TS2578 breaks the compilation --------------------

// @ts-expect-error hace falta label o aria-label
const withoutLabel = <Combobox options={options} />;

// @ts-expect-error label and aria-label don't go together
const withBoth = <Combobox label="País" aria-label="País" options={options} />;

// @ts-expect-error not in multiple mode either
const multipleWithoutLabel = <Combobox multiple options={options} />;

const popoverWithVisibility = (
  // @ts-expect-error listVisibility only exists with mode="inline"
  <Combobox aria-label="País" listVisibility="query" options={options} />
);

const explicitPopoverWithVisibility = (
  // @ts-expect-error not with an explicit mode="popover" either
  <Combobox aria-label="País" mode="popover" listVisibility="focus" options={options} />
);

void withLabel;
void withAriaLabel;
void multipleWithLabel;
void inlineWithAriaLabel;
void withoutLabel;
void withBoth;
void multipleWithoutLabel;
void inlineQuery;
void inlineFocusMultiple;
void withDynamicMode;
void popoverWithVisibility;
void explicitPopoverWithVisibility;
