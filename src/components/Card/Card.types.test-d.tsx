// Pure TYPE test (see Badge.types.test-d.tsx for why the .test-d.tsx name): fails `tsc -b` if
// Card's `size` union breaks.
import { Card, type CardProps } from './Card';

declare const dynamic: CardProps['size'];

const valid = [
  <Card key="a" />,
  <Card key="b" size="md" />,
  <Card key="c" size="sm" />,
  <Card key="d" size={dynamic} />,
];

const invalid = [
  // @ts-expect-error unknown size
  <Card key="a" size="lg" />,
  // @ts-expect-error size is not a number
  <Card key="b" size={16} />,
];

void valid;
void invalid;
