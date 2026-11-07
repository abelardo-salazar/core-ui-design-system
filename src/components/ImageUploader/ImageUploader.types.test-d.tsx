// Pure TYPE test (see Badge.types.test-d.tsx for why the .test-d.tsx name): fails `tsc -b` if the
// contract of ImageUploader changes.
import * as React from 'react';
import { ImageUploader, type ImageUploaderItem } from './ImageUploader';

const file = new File(['x'], 'a.png', { type: 'image/png' });

// --- Valid cases ---------------------------------------------------------------------------

const items: ImageUploaderItem[] = [
  { kind: 'file', id: '1', file },
  { kind: 'remote', id: '2', src: '/a.png' },
  { kind: 'remote', id: '3', src: '/b.png', alt: 'Fachada' },
];

// The union narrows by kind.
const sources = items.map((item) => (item.kind === 'file' ? item.file.name : item.src));

const valid = [
  <ImageUploader key="a" label="Fotos" value={items} onValueChange={(value) => void value} />,
  <ImageUploader key="b" aria-label="Fotos" value={[]} onValueChange={(value) => void value} />,
  <ImageUploader
    key="c"
    label="Fotos"
    value={items}
    onValueChange={(value) => void value}
    accept=".png,.jpg"
    max={10}
    onReject={(files: File[], reason: 'type' | 'count') => void [files, reason]}
    error="Falta la portada"
    helperText="Hasta 10"
    disabled
    labels={{ add: 'Agregar', moved: (name, position, total) => `${name} ${position}/${total}` }}
    id="fotos"
    className="max-w-lg"
    ref={React.createRef<HTMLDivElement>()}
  />,
];

// --- Invalid cases -------------------------------------------------------------------------

const invalidItems: ImageUploaderItem[] = [
  // @ts-expect-error a file item has no src
  { kind: 'file', id: '1', file, src: '/a.png' },
  // @ts-expect-error a remote item needs src
  { kind: 'remote', id: '2' },
  // @ts-expect-error every item needs an id
  { kind: 'remote', src: '/a.png' },
  // @ts-expect-error kind is 'file' or 'remote'
  { kind: 'url', id: '3', src: '/a.png' },
];

const invalid = [
  // @ts-expect-error a name is required: label or aria-label
  <ImageUploader key="d" value={[]} onValueChange={(value) => void value} />,
  // @ts-expect-error label and aria-label are exclusive
  <ImageUploader
    key="e"
    label="Fotos"
    aria-label="Fotos"
    value={[]}
    onValueChange={(value) => void value}
  />,
  // @ts-expect-error it is controlled: value is required
  <ImageUploader key="f" label="Fotos" onValueChange={(value) => void value} />,
  // @ts-expect-error it is controlled: onValueChange is required
  <ImageUploader key="g" label="Fotos" value={[]} />,
  <ImageUploader
    key="h"
    label="Fotos"
    value={[]}
    onValueChange={(value) => void value}
    // @ts-expect-error the reason is 'type' or 'count'
    onReject={(files: File[], reason: 'size') => void [files, reason]}
  />,
  <ImageUploader
    key="i"
    label="Fotos"
    value={[]}
    onValueChange={(value) => void value}
    // @ts-expect-error labels.image receives a number, not a string
    labels={{ image: (position: string) => position }}
  />,
];

void sources;
void valid;
void invalidItems;
void invalid;
