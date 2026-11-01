// Pure TYPE test, same as Badge.types.test-d.tsx: it isn't run, only `tsc -b` compiles it
// (the .stories.tsx/.test.tsx patterns are excluded from tsconfig.app.json, this one isn't).
import { Input } from './Input';

declare const dynamic: boolean;

// --- Valid cases -----------------------------------------------------------------------

// The API from before clearable doesn't change.
const plain = <Input placeholder="Email" />;
const withEndIcon = <Input endIcon={<span />} />;
const withEndIconAndFalse = <Input clearable={false} endIcon={<span />} />;
const clearable = <Input clearable onClear={() => {}} clearLabel="Limpiar" />;
// Dynamic clearable without endIcon: must compile (and with onClear too).
const clearableDynamic = <Input clearable={dynamic} />;
const clearableDynamicWithOnClear = <Input clearable={dynamic} onClear={() => {}} />;

// --- Invalid cases: if one stops failing, TS2578 breaks the compilation --------------------

// @ts-expect-error endIcon isn't allowed with clearable
const clearableWithEndIcon = <Input clearable endIcon={<span />} />;

// Dynamic clearable can be true: it doesn't allow endIcon either.
// @ts-expect-error endIcon isn't allowed with clearable={boolean}
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
