// Test de TIPOS puro, igual que Badge.types.test-d.tsx: no se ejecuta, solo lo compila `tsc -b`
// (los patrones .stories.tsx/.test.tsx están excluidos de tsconfig.app.json, este no).
import { Input } from './Input';

declare const dynamic: boolean;

// --- Casos válidos ---------------------------------------------------------------------

// La API previa a clearable no cambia.
const plain = <Input placeholder="Email" />;
const withEndIcon = <Input endIcon={<span />} />;
const withEndIconAndFalse = <Input clearable={false} endIcon={<span />} />;
const clearable = <Input clearable onClear={() => {}} clearLabel="Limpiar" />;
// clearable dinámico sin endIcon: debe compilar (y con onClear también).
const clearableDynamic = <Input clearable={dynamic} />;
const clearableDynamicWithOnClear = <Input clearable={dynamic} onClear={() => {}} />;

// --- Casos inválidos: si alguno deja de fallar, TS2578 rompe la compilación ------------

// @ts-expect-error endIcon no se admite con clearable
const clearableWithEndIcon = <Input clearable endIcon={<span />} />;

// clearable dinámico puede valer true: tampoco admite endIcon.
// @ts-expect-error endIcon no se admite con clearable={boolean}
const dynamicWithEndIcon = <Input clearable={dynamic} endIcon={<span />} />;

// @ts-expect-error onClear requiere clearable
const onClearWithoutClearable = <Input onClear={() => {}} />;

// @ts-expect-error clearLabel requiere clearable
const clearLabelWithoutClearable = <Input clearLabel="Limpiar" />;

// @ts-expect-error onClear requiere clearable, tampoco junto a endIcon
const onClearWithEndIcon = <Input endIcon={<span />} onClear={() => {}} />;

void plain;
void withEndIcon;
void withEndIconAndFalse;
void clearable;
void clearableDynamic;
void clearableDynamicWithOnClear;
void clearableWithEndIcon;
void dynamicWithEndIcon;
void onClearWithoutClearable;
void clearLabelWithoutClearable;
void onClearWithEndIcon;
