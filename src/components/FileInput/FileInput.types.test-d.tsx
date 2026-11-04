// Pure TYPE test (see Badge.types.test-d.tsx for why the .test-d.tsx name): fails `tsc -b` if the
// contract of FileInput changes.
import * as React from 'react';
import { FileInput } from './FileInput';

// --- Valid cases ---------------------------------------------------------------------------

const valid = [
  <FileInput key="a" />,
  <FileInput
    key="b"
    label="Contrato"
    error="Falta el archivo"
    variant="secondary"
    size="sm"
    accept=".pdf"
    multiple
    required
    name="contrato"
    chooseLabel="Elegir"
    changeLabel="Cambiar"
    onFilesChange={(files: File[]) => void files}
    onReject={(files: File[]) => void files}
    className="w-full"
    ref={React.createRef<HTMLInputElement>()}
  />,
];

// --- Invalid cases -------------------------------------------------------------------------

const invalid = [
  // @ts-expect-error a native input can't be given a value
  <FileInput key="c" value="contrato.pdf" />,
  // @ts-expect-error the type is always file
  <FileInput key="d" type="text" />,
  // @ts-expect-error icon has no text, and the trigger always shows one
  <FileInput key="e" size="icon" />,
  // @ts-expect-error onFilesChange receives an array of File
  <FileInput key="f" onFilesChange={(files: string) => void files} />,
];

void valid;
void invalid;
