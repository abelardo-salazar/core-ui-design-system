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
// Features fijas de DataTable v1
// -----------------------------------------------------------------------------
// Sorting + global filter + paginación, nada más (sin selección de filas, visibilidad de
// columnas, resize, agrupación/agregación ni pinning para v1).
//
// columnFilteringFeature está registrada acá SOLO porque los tipos de v9 la exigen como
// prerequisito de globalFilteringFeature/filteredRowModel/filterFns (ver
// FeatureSlotPrereqs en @tanstack/table-core/dist/types/TableFeatures.d.ts —
// "globalFilteringFeature: 'columnFilteringFeature'", "filteredRowModel:
// 'columnFilteringFeature'"). DataTable no expone ningún input de filtro por columna ni
// toca columnFilters — el único filtro con UI es el global.
//
// Imports individuales de sortFn_*/filterFn_* en vez de los registries sortFns/filterFns
// completos (deprecados en v9 a favor de tree-shaking, ver JSDoc de esos exports).
// filterFn_includesString NO se registra en el slot filterFns: el filtro global por
// default ('auto') resuelve a filterFn_includesString importándola directo dentro del
// propio @tanstack/table-core (table_getGlobalAutoFilterFn), sin pasar por un registry —
// registrarla acá sería un import sin uso real. sortFns sí hace falta: column_getAutoSortFn
// busca por nombre en el registro para las 3 formas que puede autodetectar (texto plano,
// alfanumérico mixto, fechas); sin registrarlas cae a sortFn_basic con un warning en dev.
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
