// Pure helpers, without 'use client': a module that only builds a custom `filter` can import
// them without pulling in the client component.
import type { ComboboxOption } from './Combobox';

// Without case or diacritics: "mexico" finds "México".
const normalize = (text: string) =>
  text.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase();

/**
 * Whether `query` appears anywhere in `text`, ignoring case and accents. It's the comparison
 * of the default filter, to compose a custom `filter` over other fields.
 */
export const comboboxTextMatch = (text: string, query: string): boolean =>
  normalize(text).includes(normalize(query));

/** Default filter of `Combobox`: `query` anywhere in the option's `label`. */
export const comboboxFilter = (option: ComboboxOption, query: string): boolean =>
  comboboxTextMatch(option.label, query);
