// Pure TYPE test (see Badge.types.test-d.tsx for why the .test-d.tsx name): fails `tsc -b` if
// AspectRatio's props drift from the ones it had as a wrapper of @radix-ui/react-aspect-ratio.
import * as React from 'react';
import { AspectRatio, type AspectRatioProps } from './AspectRatio';

// --- Valid cases ---------------------------------------------------------------------------

const ref = React.createRef<HTMLDivElement>();
const props: AspectRatioProps = { ratio: 16 / 9, className: 'rounded-box', asChild: false };
const valid = [
  <AspectRatio key="a" />,
  <AspectRatio key="b" ratio={4 / 3} ref={ref} style={{ background: 'red' }} {...props} />,
  <AspectRatio key="c" asChild ratio={2}>
    <img alt="" src="data:," />
  </AspectRatio>,
];

// --- Invalid cases -------------------------------------------------------------------------

const invalid = [
  // @ts-expect-error ratio is a number
  <AspectRatio key="d" ratio="16/9" />,
  // @ts-expect-error asChild is a boolean
  <AspectRatio key="e" asChild="true" />,
  // @ts-expect-error the ref is an HTMLDivElement
  <AspectRatio key="f" ref={React.createRef<HTMLSpanElement>()} />,
];

void valid;
void invalid;
