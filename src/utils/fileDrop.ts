// Internal module, not exported from any barrel: file validation and the drop zone logic shared by
// the file components (FileInput, and ImageUploader later on).
//
// No 'use client' here: useFileDrop is a hook, but this module is only reachable through client
// components, whose own directive marks the boundary (see scripts/client-entry-points.mjs).
import * as React from 'react';

/** Why files were rejected: they don't pass `accept`, or there are more than one without `multiple`. */
export type FileRejectReason = 'type' | 'count';

// The same rules as the native attribute, which only filters the dialog: a token is an extension
// (".pdf"), a MIME wildcard ("image/*") or an exact MIME. Everything case-insensitive. A file whose
// type the browser doesn't know has an empty type, so it only passes by extension.
export function matchesAccept(file: File, accept: string | undefined) {
  const tokens = accept
    ?.split(',')
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);
  if (!tokens?.length) return true;

  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return tokens.some((token) => {
    if (token.startsWith('.')) return name.endsWith(token);
    if (token.endsWith('/*')) return type.startsWith(token.slice(0, -1));
    return type === token;
  });
}

// Without `multiple`, several files are rejected as a whole: picking one of them for the user
// would be a guess. Otherwise each file is checked against `accept`.
export function sortFiles(
  files: File[],
  { accept, multiple }: { accept?: string; multiple?: boolean },
): { accepted: File[]; rejected: File[]; reason: FileRejectReason } {
  if (!multiple && files.length > 1) return { accepted: [], rejected: files, reason: 'count' };
  return {
    accepted: files.filter((file) => matchesAccept(file, accept)),
    rejected: files.filter((file) => !matchesAccept(file, accept)),
    reason: 'type',
  };
}

// So that a form submit only carries the files shown. Setting `files` doesn't fire `change`.
export function setNativeFiles(input: HTMLInputElement, files: File[]) {
  const transfer = new DataTransfer();
  files.forEach((file) => transfer.items.add(file));
  input.files = transfer.files;
}

// Only drags that carry files make the zone a target; text or links dragged over it are ignored.
const carriesFiles = (event: React.DragEvent) => event.dataTransfer.types.includes('Files');

/**
 * Drag and drop handlers for a zone. `dragging` is true while files are dragged over it.
 *
 * `dragenter`/`dragleave` fire again on every child the pointer crosses, so a boolean would
 * flicker: a depth counter keeps `dragging` until the pointer really leaves the zone.
 * With `disabled`, the drop is still cancelled (so the browser doesn't open the file) but shows
 * `dropEffect: 'none'` and `onDrop` isn't called.
 */
export function useFileDrop({
  disabled,
  onDrop,
}: {
  disabled?: boolean;
  onDrop: (files: File[]) => void;
}) {
  const [dragging, setDragging] = React.useState(false);
  const depth = React.useRef(0);

  const dropZoneProps = {
    onDragEnter: (event: React.DragEvent) => {
      if (!carriesFiles(event)) return;
      event.preventDefault();
      depth.current += 1;
      if (!disabled) setDragging(true);
    },
    onDragOver: (event: React.DragEvent) => {
      if (!carriesFiles(event)) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = disabled ? 'none' : 'copy';
    },
    onDragLeave: (event: React.DragEvent) => {
      if (!carriesFiles(event)) return;
      depth.current = Math.max(0, depth.current - 1);
      if (depth.current === 0) setDragging(false);
    },
    onDrop: (event: React.DragEvent) => {
      if (!carriesFiles(event)) return;
      event.preventDefault();
      depth.current = 0;
      setDragging(false);
      const files = Array.from(event.dataTransfer.files);
      if (!disabled && files.length > 0) onDrop(files);
    },
  };

  // If it becomes disabled mid-drag, the zone stops looking like a target right away.
  return { dragging: dragging && !disabled, dropZoneProps };
}
