// Test de TIPOS puro, igual que Input.types.test-d.tsx: no se ejecuta, solo lo compila `tsc -b`.
import { Combobox } from './Combobox';

const options = [{ value: 'mx', label: 'México' }];

// --- Casos válidos ---------------------------------------------------------------------

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
// mode dinámico sin listVisibility sigue compilando.
const withDynamicMode = <Combobox aria-label="País" mode={dynamicMode} options={options} />;

// --- Casos inválidos: si alguno deja de fallar, TS2578 rompe la compilación ------------

// @ts-expect-error hace falta label o aria-label
const withoutLabel = <Combobox options={options} />;

// @ts-expect-error label y aria-label no van juntos
const withBoth = <Combobox label="País" aria-label="País" options={options} />;

// @ts-expect-error tampoco en modo múltiple
const multipleWithoutLabel = <Combobox multiple options={options} />;

const popoverWithVisibility = (
  // @ts-expect-error listVisibility solo existe con mode="inline"
  <Combobox aria-label="País" listVisibility="query" options={options} />
);

const explicitPopoverWithVisibility = (
  // @ts-expect-error tampoco con mode="popover" explícito
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
