// Pure TYPE test: nothing in this file is rendered or run; it only exists so that
// `tsc -b` compiles it and fails if Badge's type guarantee breaks. The `.test-d.tsx` name
// is deliberate: `tsconfig.app.json` excludes `*.stories.tsx` and `*.test.tsx` (confirmed by
// running `tsc -b` with a broken probe in each: in `.stories.tsx` it isn't caught, in this
// file it is), so those two patterns DON'T work for this. `npm run lint`/`test`/`build`
// don't touch it; it's purely `tsc -b`'s responsibility.
import { Badge } from './Badge';

// --- Valid cases: they must compile without errors -----------------------------------------

const staticDefault = <Badge>Default</Badge>;
const staticSized = (
  <Badge size="md" variant="secondary">
    Secondary md
  </Badge>
);
const interactiveClick = (
  <Badge interactive onClick={() => {}}>
    Click
  </Badge>
);
const interactiveButtonProps = (
  <Badge interactive disabled type="submit">
    Submit
  </Badge>
);
// Legitimate attributes of a <div> (not exclusive to <button>): the union must not become so
// strict that it blocks them too.
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

// --- Invalid cases: each one must fail; if one stops failing, "Unused
// '@ts-expect-error' directive" (TS2578) breaks the compilation right here. -----------------

// onClick without interactive: the original bug of #34 (reproduced against main before this
// fix with the SAME line; it compiled).
// @ts-expect-error onClick requires interactive: true
const missingInteractive = <Badge onClick={() => {}}>x</Badge>;

// Explicit interactive=false + onClick: it already failed before this fix, it must still fail.
// The directive goes right on the <Badge line, not on the `const (` above: @ts-expect-error only
// suppresses an error on the next line, and here TS reports the error on the opening of the
// JSX element, not on the assignment.
const explicitlyNotInteractive = (
  // @ts-expect-error onClick doesn't exist when interactive is false
  <Badge interactive={false} onClick={() => {}}>
    x
  </Badge>
);

// Invalid size, whatever the branch.
// @ts-expect-error "xl" is not a Badge size
const invalidSize = <Badge size="xl">x</Badge>;

// disabled is exclusive to <button>: without interactive, HTMLAttributes<HTMLDivElement> doesn't
// even declare it (no Omit is needed for this, it was never there), but before
// this fix, the excess property check against the whole union let it through.
// @ts-expect-error disabled requires interactive: true
const disabledWithoutInteractive = <Badge disabled>x</Badge>;

// type is also exclusive to <button>; unlike disabled/onClick, here it already failed
// against the union without overloads (verified): its type is a narrow literal
// ('button'|'reset'|'submit'), not a wide one like boolean/MouseEventHandler, so the
// union's excess property check already tripped for its own reasons. It stays anyway:
// it's still a real guarantee worth pinning with a test, regardless of why
// it worked before.
// @ts-expect-error type requires interactive: true
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
