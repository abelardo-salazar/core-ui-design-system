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

// `features` is re-exported from this directory through index.ts (dataTableFeatures.ts),
// not from this file, so the component's consumer can type their own array
// of columns: ColumnDef<typeof features, TData>[], a real requirement of the v9 generics
// (see createColumnHelper's JSDoc), not an optional detail.

export interface DataTableProps<TData extends RowData> {
  /**
   * Column definitions built with @tanstack/react-table's own tools
   * (createColumnHelper, etc.) typed against the `typeof features` exported by this module.
   */
  columns: ColumnDef<typeof features, TData>[];
  data: TData[];
  /**
   * Placeholder (and accessible name) of the global search box. Always visible: it can't be
   * turned off through a prop. @default 'Search...'
   */
  searchPlaceholder?: string;
  /**
   * Content of the empty row (no data or a filter with no results). By default, an
   * `EmptyState` `sm` with the title "No results.".
   */
  emptyState?: React.ReactNode;
  /** Text of the previous page button. @default 'Previous' */
  previousLabel?: string;
  /** Text of the next page button. @default 'Next' */
  nextLabel?: string;
  /**
   * Text of the page indicator. Gets the current page (from 1) and the total (at least 1).
   * @default (page, total) => `Page ${page} of ${total}`
   */
  pageLabel?: (page: number, total: number) => string;
  className?: string;
}

const defaultEmptyState = (
  <EmptyState size="sm">
    <EmptyStateTitle>No results.</EmptyStateTitle>
  </EmptyState>
);

const defaultPageLabel = (page: number, total: number) => `Page ${page} of ${total}`;

// Extends the height of the sm pagination buttons' hit area to 44px without touching their 32px
// look. An absolute ::after is placed from the padding box (inside the 1px border), hence 7px per
// side, not 6, and -inset-x-px to match the visible width. Vertical only: the gap-2 between both
// buttons stays dead. Local on purpose, not in Button sm: a global ::after would overlap
// neighboring sm buttons in the consumers' toolbars.
const PAGINATION_HIT_AREA =
  "relative after:content-[''] after:absolute after:rounded-btn after:-inset-x-px after:-inset-y-[7px]";

function DataTable<TData extends RowData>({
  columns,
  data,
  searchPlaceholder = 'Search...',
  emptyState = defaultEmptyState,
  previousLabel = 'Previous',
  nextLabel = 'Next',
  pageLabel = defaultPageLabel,
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
                  // data-label for Table's card mode (responsive): if the column header
                  // is a string we use it as is (the real use case of the DS);
                  // if it's a function/JSX it can't be flattened into an attr() value, so
                  // it falls back to column.id rather than leaving the cell without a label.
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
              {/* No data-label: in card mode no column label is attached. The
                  w-full div is needed because below `lg` Table makes the td flex
                  justify-between, which would push a single child to the left. */}
              <TableCell colSpan={columnCount} className="text-center">
                <div className="w-full">{emptyState}</div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/*
        Breakpoint `md` (not `lg`, unlike the table's card collapse above): this is just
        an input + 2 buttons + page text, which fit in one row at more widths than a full
        table of columns; using `lg` here would force an unnecessary stack on a tablet
        where the toolbar fits perfectly horizontally.
      */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-end md:gap-4">
        <p className="text-sm text-base-content/65">
          {pageLabel(table.state.pagination.pageIndex + 1, Math.max(pageCount, 1))}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className={PAGINATION_HIT_AREA}
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {previousLabel}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={PAGINATION_HIT_AREA}
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {nextLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
DataTable.displayName = 'DataTable';

export { DataTable };
