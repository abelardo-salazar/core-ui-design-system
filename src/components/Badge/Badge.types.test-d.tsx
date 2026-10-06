// Test de TIPOS puro: nada de este archivo se renderiza ni se ejecuta — existe solo para que
// `tsc -b` lo compile y falle si la garantía de tipos de Badge se rompe. El nombre `.test-d.tsx`
// es deliberado: `tsconfig.app.json` excluye `*.stories.tsx` y `*.test.tsx` (confirmado
// corriendo `tsc -b` con una sonda rota en cada uno: en `.stories.tsx` no se detecta, en este
// archivo sí), así que esos dos patrones NO sirven para esto. `npm run lint`/`test`/`build`
// no lo tocan — es pura responsabilidad de `tsc -b`.
import { Badge } from './Badge';

// --- Casos válidos: deben compilar sin error -------------------------------------------

const staticDefault = <Badge>Default</Badge>;
const staticSized = (
  <Badge size="md" variant="secondary">
    Secondary md
  </Badge>
);
const interactiveClick = <Badge interactive onClick={() => {}}>Click</Badge>;
const interactiveButtonProps = (
  <Badge interactive disabled type="submit">
    Submit
  </Badge>
);
// Atributos legítimos de un <div> (no exclusivos de <button>): la unión no debe volverse tan
// estricta que también los bloquee.
const staticDivAttrs = (
  <Badge
    title="tooltip nativo"
    id="badge-1"
    style={{ opacity: 1 }}
    role="status"
    aria-label="estado"
    data-testid="badge"
  >
    Div attrs
  </Badge>
);

// --- Casos inválidos: cada uno debe fallar; si alguno deja de fallar, "Unused
// '@ts-expect-error' directive" (TS2578) rompe la compilación acá mismo. -------------------

// onClick sin interactive: el bug original de #34 (reproducido contra main antes de este fix
// con la MISMA línea — compilaba).
// @ts-expect-error onClick requiere interactive: true
const missingInteractive = <Badge onClick={() => {}}>x</Badge>;

// interactive=false explícito + onClick: ya fallaba antes de este fix, sigue debiendo fallar.
// El directive va pegado a la línea <Badge, no al `const (` de arriba: @ts-expect-error solo
// suprime un error en la línea siguiente, y acá el error lo reporta TS sobre la apertura del
// elemento JSX, no sobre la asignación.
const explicitlyNotInteractive = (
  // @ts-expect-error onClick no existe cuando interactive es false
  <Badge interactive={false} onClick={() => {}}>
    x
  </Badge>
);

// size inválido, cualquiera sea la rama.
// @ts-expect-error "xl" no es un size de Badge
const invalidSize = <Badge size="xl">x</Badge>;

// disabled es exclusivo de <button>: sin interactive, HTMLAttributes<HTMLDivElement> ni
// siquiera lo declara (no hace falta un Omit para esto, nunca estuvo ahí) — pero antes de
// este fix, el chequeo de propiedades sobrantes contra la unión completa lo dejaba pasar.
// @ts-expect-error disabled requiere interactive: true
const disabledWithoutInteractive = <Badge disabled>x</Badge>;

// type también es exclusivo de <button> — a diferencia de disabled/onClick, acá ya fallaba
// contra la unión sin sobrecargas (verificado): su tipo es un literal angosto
// ('button'|'reset'|'submit'), no uno amplio como boolean/MouseEventHandler, así que el
// chequeo de propiedades sobrantes de la unión ya tropezaba por motivos propios. Se deja igual:
// sigue siendo una garantía real que vale la pena fijar con un test, más allá de por qué
// funcionaba antes.
// @ts-expect-error type requiere interactive: true
const typeWithoutInteractive = <Badge type="submit">x</Badge>;

void staticDefault;
void staticSized;
void interactiveClick;
void interactiveButtonProps;
void staticDivAttrs;
void missingInteractive;
void explicitlyNotInteractive;
void invalidSize;
void disabledWithoutInteractive;
void typeWithoutInteractive;
