// Pure TYPE test (see Badge.types.test-d.tsx for why the .test-d.tsx name): fails `tsc -b` if
// Card's `size` union breaks.
import * as React from 'react';
import { Card, CardTitle, type CardProps, type CardTitleProps } from './Card';

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

// CardTitle: closed `as` union (h2–h6) and a heading ref.
declare const level: CardTitleProps['as'];
// No invalid ref case: HTMLParagraphElement and HTMLHeadingElement are structurally identical, so
// a paragraph ref still compiles (the type fix doesn't break existing consumers).
const headingRef = React.createRef<HTMLHeadingElement>();

const validTitles = [
  <CardTitle key="a" />,
  <CardTitle key="b" as="h2" />,
  <CardTitle key="c" as="h6" />,
  <CardTitle key="d" as={level} />,
  <CardTitle key="e" ref={headingRef} />,
];

const invalidTitles = [
  // @ts-expect-error h1 is the page title, not a card's
  <CardTitle key="a" as="h1" />,
  // @ts-expect-error a card title is always a heading
  <CardTitle key="b" as="p" />,
];

void valid;
void invalid;
void validTitles;
void invalidTitles;
