'use client';

import type * as React from 'react';
import { useTable, type ColumnDef, type RowData } from '@tanstack/react-table';
import {
  CaretDownIcon,
  CaretSortIcon,
  CaretUpIcon,
  MagnifyingGlassIcon,
} from '@radix-ui/react-icons';
import { cn } from '../../utils/cn';
import { Button } from '../Button';
import { EmptyState, EmptyStateTitle } from '../EmptyState';
import { Input } from '../Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../Table';
import { features } from './dataTableFeatures';

// `features` se re-exporta desde este directorio vía index.ts (dataTableFeatures.ts),
// no desde este archivo, para que quien consuma el componente pueda tipar su propio array
// de columnas: ColumnDef<typeof features, TData>[] — requisito real de los generics de v9
// (ver JSDoc de createColumnHelper), no un detalle opcional.

export interface DataTableProps<TData extends RowData> {
  /**
   * Definiciones de columnas armadas con las herramientas propias de @tanstack/react-table
   * (createColumnHelper, etc.) tipadas contra `typeof features` exportado por este módulo.
   */
  columns: ColumnDef<typeof features, TData>[];
  data: TData[];
  /** Placeholder de la caja de búsqueda global. Siempre visible: no es opcional vía prop. */
  searchPlaceholder?: string;
  /**
   * Contenido de la fila vacía (sin datos o filtro sin resultados). Por defecto, un
   * `EmptyState` `sm` con el título "Sin resultados.".
   */
  emptyState?: React.ReactNode;
  className?: string;
}

const defaultEmptyState = (
  <EmptyState size="sm">
    <EmptyStateTitle>Sin resultados.</EmptyStateTitle>
  </EmptyState>
);

function DataTable<TData extends RowData>({
  columns,
  data,
  searchPlaceholder = 'Buscar...',
  emptyState = defaultEmptyState,
  className,
}: DataTableProps<TData>) {
  const table = useTable({ features, columns, data });

  const rows = table.getRowModel().rows;
  const columnCount = table.getAllLeafColumns().length;
  const pageCount = table.getPageCount();

  return (
    <div className={cn('w-full space-y-4', className)}>
      <Input
        value={(table.state.globalFilter as string | undefined) ?? ''}
        onChange={(event) => table.setGlobalFilter(event.target.value)}
        placeholder={searchPlaceholder}
        startIcon={<MagnifyingGlassIcon />}
        aria-label={searchPlaceholder}
        className="max-w-sm"
      />

      <Table responsive>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort();
                const sortDirection = header.column.getIsSorted();

                return (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder ? null : canSort ? (
                      <button
                        type="button"
                        className="flex items-center gap-1.5 select-none rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <table.FlexRender header={header} />
                        {sortDirection === 'asc' ? (
                          <CaretUpIcon className="size-4 text-primary" />
                        ) : sortDirection === 'desc' ? (
                          <CaretDownIcon className="size-4 text-primary" />
                        ) : (
                          <CaretSortIcon className="size-4" />
                        )}
                      </button>
                    ) : (
                      <table.FlexRender header={header} />
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {rows.length ? (
            rows.map((row) => (
              <TableRow key={row.id}>
                {row.getAllCells().map((cell) => {
                  // data-label para el modo tarjeta de Table (responsive): si el header de
                  // la columna es un string lo usamos tal cual (caso real de uso del DS);
                  // si es una función/JSX no se puede aplanar a un valor de attr(), así que
                  // cae a column.id antes que dejar la celda sin etiqueta.
                  const header = cell.column.columnDef.header;
                  const dataLabel = typeof header === 'string' ? header : cell.column.id;

                  return (
                    <TableCell key={cell.id} data-label={dataLabel}>
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          ) : (
            <TableRow>
              {/* Sin data-label: en modo tarjeta no cuelga ninguna etiqueta de columna. El
                  div w-full es necesario porque bajo `lg` Table pone el td en flex
                  justify-between, que dejaría un hijo único pegado a la izquierda. */}
              <TableCell colSpan={columnCount} className="text-center">
                <div className="w-full">{emptyState}</div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/*
        Breakpoint `md` (no `lg`, a diferencia del colapso a tarjeta de la tabla arriba):
        estos son solo un input + 2 botones + texto de página, entran en una fila en más
        anchos que una tabla completa de columnas — usar `lg` acá forzaría un stack
        innecesario en una tablet donde el toolbar entra perfecto en horizontal.
      */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-end md:gap-4">
        <p className="text-sm text-base-content/65">
          Página {table.state.pagination.pageIndex + 1} de {Math.max(pageCount, 1)}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
DataTable.displayName = 'DataTable';

export { DataTable };
