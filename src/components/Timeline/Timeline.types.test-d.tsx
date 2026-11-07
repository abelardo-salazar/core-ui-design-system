// Pure TYPE test (see Badge.types.test-d.tsx for why the .test-d.tsx name): fails `tsc -b` if the
// contract of Timeline changes.
import * as React from 'react';
import { Timeline, TimelineGroup, TimelineItem } from './Timeline';

// --- Valid cases ---------------------------------------------------------------------------

const valid = [
  <Timeline key="a" aria-label="Historial" ref={React.createRef<HTMLOListElement>()}>
    <TimelineItem>Sin hora</TimelineItem>
    <TimelineItem time="09:30">Con hora</TimelineItem>
    <TimelineItem time={<strong>09:30</strong>} dateTime="2026-11-07T09:30">
      Con dateTime
    </TimelineItem>
    <TimelineGroup title="Sábado" headingLevel={2} ref={React.createRef<HTMLLIElement>()}>
      <TimelineItem ref={React.createRef<HTMLLIElement>()}>Dentro de un grupo</TimelineItem>
    </TimelineGroup>
    <TimelineGroup title={<span>Domingo</span>} />
  </Timeline>,
];

// --- Invalid cases -------------------------------------------------------------------------

const invalid = [
  // @ts-expect-error dateTime describes time: it needs a time to show
  <TimelineItem key="b" dateTime="2026-11-07" />,
  // @ts-expect-error a group needs its title
  <TimelineGroup key="c" />,
  // @ts-expect-error headingLevel goes from 2 to 6
  <TimelineGroup key="d" title="Sábado" headingLevel={1} />,
  // @ts-expect-error dateTime is a string
  <TimelineItem key="e" time="Hoy" dateTime={new Date()} />,
];

void valid;
void invalid;
