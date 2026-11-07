// Pure TYPE test (see Badge.types.test-d.tsx for why the .test-d.tsx name): fails `tsc -b` if the
// contract of DateRangePicker changes.
import { es } from 'date-fns/locale';
import { DateRangePicker, type DateRange } from './DateRangePicker';

const range: DateRange = { from: new Date(2026, 0, 12), to: new Date(2026, 0, 15) };
const open: DateRange = { from: new Date(2026, 0, 12) };

// --- Valid cases ---------------------------------------------------------------------------

const valid = [
  <DateRangePicker key="a" />,
  <DateRangePicker
    key="b"
    range={range}
    onRangeChange={(next: DateRange) => void next}
    minDate={new Date(2026, 0, 1)}
    maxDate={new Date(2026, 11, 31)}
    placeholder="Elegir fechas"
    dialogLabel="Elegir fechas"
    locale={es}
    label="Fechas del viaje"
    error="Elige las fechas"
    helperText="Hasta 20 noches"
    disabled
    className="w-full"
  />,
  <DateRangePicker key="c" range={open} />,
];

// --- Invalid cases -------------------------------------------------------------------------

const invalid = [
  // @ts-expect-error a range is { from, to }, not a single date
  <DateRangePicker key="d" range={new Date()} />,
  // @ts-expect-error onRangeChange receives a DateRange
  <DateRangePicker key="e" onRangeChange={(next: Date) => void next} />,
  // @ts-expect-error minDate is a Date
  <DateRangePicker key="f" minDate="2026-01-01" />,
  // @ts-expect-error label is text
  <DateRangePicker key="g" label={<span />} />,
];

void valid;
void invalid;
