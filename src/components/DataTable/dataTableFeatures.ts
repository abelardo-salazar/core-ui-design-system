import {
  columnFilteringFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
} from '@tanstack/react-table';

// -----------------------------------------------------------------------------
// Fixed features of DataTable v1
// -----------------------------------------------------------------------------
// Sorting + global filter + pagination, nothing else (no row selection, column
// visibility, resize, grouping/aggregation or pinning for v1).
//
// columnFilteringFeature is registered here ONLY because the v9 types require it as a
// prerequisite of globalFilteringFeature/filteredRowModel/filterFns (see
// FeatureSlotPrereqs in @tanstack/table-core/dist/types/TableFeatures.d.ts:
// "globalFilteringFeature: 'columnFilteringFeature'", "filteredRowModel:
// 'columnFilteringFeature'"). DataTable exposes no per-column filter input and doesn't
// touch columnFilters; the only filter with a UI is the global one.
//
// Individual imports of sortFn_*/filterFn_* instead of the full sortFns/filterFns
// registries (deprecated in v9 in favor of tree-shaking, see the JSDoc of those exports).
// filterFn_includesString is NOT registered in the filterFns slot: the default global filter
// ('auto') resolves to filterFn_includesString by importing it directly inside
// @tanstack/table-core itself (table_getGlobalAutoFilterFn), without going through a
// registry; registering it here would be an import with no real use. sortFns is needed:
// column_getAutoSortFn looks up by name in the registry for the 3 forms it can auto-detect
// (plain text, mixed alphanumeric, dates); without registering them it falls back to
// sortFn_basic with a warning in dev.
export const features = tableFeatures({
  rowSortingFeature,
  columnFilteringFeature,
  globalFilteringFeature,
  rowPaginationFeature,
  sortedRowModel: createSortedRowModel(),
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    text: sortFn_text,
    datetime: sortFn_datetime,
  },
});
