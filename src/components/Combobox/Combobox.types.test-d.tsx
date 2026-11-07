// Pure TYPE test, same as Input.types.test-d.tsx: it isn't run, only `tsc -b` compiles it.
import { Combobox } from './Combobox';
import { comboboxFilter, comboboxTextMatch } from './comboboxFilter';

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

// --- description and group: optional strings, in every mode --------------------------------

const describedOptions = [
  { value: 'a', label: 'A', description: 'Por qué', group: 'Grupo', disabled: true },
  { value: 'b', label: 'B' },
];
const described = [
  <Combobox key="a" label="L" options={describedOptions} />,
  <Combobox key="b" label="L" mode="inline" listVisibility="query" options={describedOptions} />,
  <Combobox key="c" label="L" multiple options={describedOptions} />,
];
const invalidDescribed = [
  // @ts-expect-error description is a string
  <Combobox key="d" label="L" options={[{ value: 'a', label: 'A', description: 1 }]} />,
  // @ts-expect-error group is a string
  <Combobox key="e" label="L" options={[{ value: 'a', label: 'A', group: 1 }]} />,
  // @ts-expect-error there is no groups prop: the group goes on each option
  <Combobox key="f" label="L" options={[]} groups={[]} />,
];

void described;
void invalidDescribed;
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

// filter: (option, query) => boolean; the exported helpers fit it and compose.
const withFilter = [
  <Combobox key="a" label="L" options={options} filter={comboboxFilter} />,
  <Combobox
    key="b"
    label="L"
    multiple
    options={options}
    filter={(option, query) =>
      comboboxFilter(option, query) || comboboxTextMatch(option.group ?? '', query)
    }
  />,
];
const invalidFilter = [
  // @ts-expect-error filter returns a boolean
  <Combobox key="a" label="L" options={options} filter={(option) => option.label} />,
  // @ts-expect-error query is a string
  <Combobox key="b" label="L" options={options} filter={(_, query: number) => query > 0} />,
];

void withFilter;
void invalidFilter;

// onCreate: the value must be controlled (value + onValueChange), and createLabel needs onCreate.
declare const setOne: (value: string) => void;
declare const setMany: (value: string[]) => void;
const withCreate = [
  <Combobox
    key="a"
    label="L"
    options={options}
    value=""
    onValueChange={setOne}
    onCreate={() => {}}
  />,
  <Combobox
    key="b"
    label="L"
    mode="inline"
    listVisibility="query"
    multiple
    options={options}
    value={[]}
    onValueChange={setMany}
    onCreate={() => {}}
    createLabel={(text) => `Crear ${text}`}
  />,
];
const invalidCreate = [
  // @ts-expect-error onCreate without value
  <Combobox key="a" label="L" options={options} onValueChange={setOne} onCreate={() => {}} />,
  // @ts-expect-error onCreate without onValueChange
  <Combobox key="b" label="L" options={options} value="" onCreate={() => {}} />,
  // @ts-expect-error onCreate with defaultValue instead of value
  <Combobox key="c" label="L" options={options} defaultValue="" onCreate={() => {}} />,
  // @ts-expect-error multiple: onCreate without value
  <Combobox
    key="d"
    label="L"
    multiple
    options={options}
    onValueChange={setMany}
    onCreate={() => {}}
  />,
  // @ts-expect-error createLabel without onCreate
  <Combobox key="e" label="L" options={options} createLabel={(text) => text} />,
  <Combobox
    key="f"
    label="L"
    options={options}
    value=""
    onValueChange={setOne}
    // @ts-expect-error onCreate receives a string
    onCreate={(text: number) => text}
  />,
];

void withCreate;
void invalidCreate;
