// Pure TYPE test (see Badge.types.test-d.tsx for why the .test-d.tsx name): fails `tsc -b` if
// the tokens accepted by ChartConfig change.
import type { ChartConfig } from './chartConfig';

const valid: ChartConfig = {
  a: { color: 'primary' },
  b: { color: 'info' },
  c: { label: 'Objetivo', color: 'muted' },
};

const invalid: ChartConfig[] = [
  // @ts-expect-error error is reserved for error states
  { a: { color: 'error' } },
  // @ts-expect-error neutral is pure white in dark mode
  { a: { color: 'neutral' } },
  // @ts-expect-error only DS tokens, no loose colors
  { a: { color: '#999999' } },
];

void valid;
void invalid;
