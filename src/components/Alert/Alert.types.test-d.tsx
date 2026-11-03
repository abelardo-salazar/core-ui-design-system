// Pure TYPE test (see Badge.types.test-d.tsx for why the .test-d.tsx name): fails `tsc -b` if
// the values of Alert's `live` prop drift from its contract.
import { Alert, type AlertProps } from './Alert';

// --- Valid cases ---------------------------------------------------------------------------

const props: AlertProps = { live: 'off', variant: 'warning' };
const valid = [
  <Alert key="a" />,
  <Alert key="b" live="assertive" />,
  <Alert key="c" live="polite" />,
  <Alert key="d" live="off" />,
  <Alert key="e" live={undefined} />,
  <Alert key="f" {...props} />,
];

// --- Invalid cases -------------------------------------------------------------------------

const invalid = [
  // @ts-expect-error 'region' is not a value of live: off has no role
  <Alert key="g" live="region" />,
  // @ts-expect-error live is not a boolean
  <Alert key="h" live={false} />,
];

void valid;
void invalid;
