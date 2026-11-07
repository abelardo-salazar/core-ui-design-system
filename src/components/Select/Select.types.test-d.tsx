// Pure TYPE test (see Badge.types.test-d.tsx for why the .test-d.tsx name): fails `tsc -b` if
// SelectTrigger's `size` union breaks.
import { SelectTrigger, type SelectTriggerProps } from './Select';

declare const dynamic: SelectTriggerProps['size'];

const valid = [
  <SelectTrigger key="a" />,
  <SelectTrigger key="b" size="sm" />,
  <SelectTrigger key="c" size="md" />,
  <SelectTrigger key="d" size="lg" aria-invalid />,
  <SelectTrigger key="e" size={dynamic} />,
];

const invalid = [
  // @ts-expect-error unknown size
  <SelectTrigger key="a" size="xl" />,
  // @ts-expect-error size is not a pixel height
  <SelectTrigger key="b" size={44} />,
];

void valid;
void invalid;
