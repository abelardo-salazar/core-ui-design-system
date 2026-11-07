// Internal: not re-exported from index.ts. Shared by the filter helpers and the "create" match,
// so both compare text the same way.

// Without case or diacritics: "mexico" finds "México".
export const normalizeText = (text: string) =>
  text.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase();
