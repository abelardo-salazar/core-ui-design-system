// Pure TYPE test (see Badge.types.test-d.tsx for why the .test-d.tsx name): fails `tsc -b` if the
// contract of DatePicker changes.
import { DatePicker } from './DatePicker';

// --- Valid cases ---------------------------------------------------------------------------

const valid = [
  // label stays optional: requiring it would break every DatePicker without one.
  <DatePicker key="a" />,
  <DatePicker
    key="b"
    label="Fecha de entrega"
    error="Elige una fecha"
    helperText="De lunes a sábado"
    date={new Date()}
    onDateChange={(date: Date | undefined) => void date}
    placeholder="Elegir fecha"
    dialogLabel="Elegir fecha"
    disabled
    className="w-full"
  />,
];

// --- Invalid cases -------------------------------------------------------------------------

const invalid = [
  // @ts-expect-error label is text: it names the trigger through aria-labelledby
  <DatePicker key="c" label={<span />} />,
  // @ts-expect-error error is the message, not a flag
  <DatePicker key="d" error />,
];

void valid;
void invalid;
