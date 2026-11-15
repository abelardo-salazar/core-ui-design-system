// Pure TYPE test (see Badge.types.test-d.tsx for why the .test-d.tsx name): fails `tsc -b` if the
// union ToggleGroupSingleProps | ToggleGroupMultipleProps stops tying `type` to the shape of
// value, defaultValue and onValueChange.
import { ToggleGroup, ToggleGroupItem } from './ToggleGroup';

declare const dynamicType: 'single' | 'multiple';
const item = <ToggleGroupItem value="a">A</ToggleGroupItem>;

// --- Valid cases ---------------------------------------------------------------------------

const valid = [
  <ToggleGroup
    key="a"
    type="single"
    value="a"
    defaultValue="a"
    onValueChange={(value: string) => void value}
    size="sm"
    aria-label="Vista"
  >
    {item}
  </ToggleGroup>,
  <ToggleGroup
    key="b"
    type="multiple"
    value={['a']}
    defaultValue={['a']}
    onValueChange={(value: string[]) => void value}
    size="lg"
    className="w-full"
    id="filtros"
  >
    {item}
  </ToggleGroup>,
  // A dynamic type without value compiles: both branches accept it.
  <ToggleGroup key="c" type={dynamicType}>
    {item}
  </ToggleGroup>,
];

// --- Invalid cases -------------------------------------------------------------------------

const invalid = [
  // @ts-expect-error type is required: it's the union's discriminant
  <ToggleGroup key="d">{item}</ToggleGroup>,
  // @ts-expect-error type is 'single' or 'multiple'
  <ToggleGroup key="e" type="toggle">
    {item}
  </ToggleGroup>,
  // @ts-expect-error a single group's value is a string
  <ToggleGroup key="f" type="single" value={['a']}>
    {item}
  </ToggleGroup>,
  // @ts-expect-error a multiple group's value is a string[]
  <ToggleGroup key="g" type="multiple" value="a">
    {item}
  </ToggleGroup>,
  // @ts-expect-error a single group's defaultValue is a string
  <ToggleGroup key="h" type="single" defaultValue={['a']}>
    {item}
  </ToggleGroup>,
  // @ts-expect-error a multiple group's defaultValue is a string[]
  <ToggleGroup key="i" type="multiple" defaultValue="a">
    {item}
  </ToggleGroup>,
  // @ts-expect-error a single group's onValueChange receives a string
  <ToggleGroup key="j" type="single" onValueChange={(value: string[]) => void value}>
    {item}
  </ToggleGroup>,
  // @ts-expect-error a multiple group's onValueChange receives a string[]
  <ToggleGroup key="k" type="multiple" onValueChange={(value: string) => void value}>
    {item}
  </ToggleGroup>,
  // @ts-expect-error "xl" is not a ToggleGroup size
  <ToggleGroup key="l" type="single" size="xl">
    {item}
  </ToggleGroup>,
  // @ts-expect-error a dynamic type may be 'multiple', whose value is a string[]
  <ToggleGroup key="m" type={dynamicType} value="a">
    {item}
  </ToggleGroup>,
];

void valid;
void invalid;
