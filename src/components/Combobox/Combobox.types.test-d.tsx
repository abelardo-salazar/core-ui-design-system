// Test de TIPOS puro, igual que Input.types.test-d.tsx: no se ejecuta, solo lo compila `tsc -b`.
import { Combobox } from './Combobox';

const options = [{ value: 'mx', label: 'México' }];

// --- Casos válidos ---------------------------------------------------------------------

const withLabel = <Combobox label="País" options={options} />;
const withAriaLabel = <Combobox aria-label="País" options={options} />;
const multipleWithLabel = <Combobox label="Países" multiple options={options} defaultValue={[]} />;
const inlineWithAriaLabel = <Combobox aria-label="País" mode="inline" options={options} />;

// --- Casos inválidos: si alguno deja de fallar, TS2578 rompe la compilación ------------

// @ts-expect-error hace falta label o aria-label
const withoutLabel = <Combobox options={options} />;

// @ts-expect-error label y aria-label no van juntos
const withBoth = <Combobox label="País" aria-label="País" options={options} />;

// @ts-expect-error tampoco en modo múltiple
const multipleWithoutLabel = <Combobox multiple options={options} />;

void withLabel;
void withAriaLabel;
void multipleWithLabel;
void inlineWithAriaLabel;
void withoutLabel;
void withBoth;
void multipleWithoutLabel;
