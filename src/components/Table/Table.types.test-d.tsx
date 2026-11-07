// Pure TYPE test (see Badge.types.test-d.tsx for why the .test-d.tsx name): fails `tsc -b` if
// the `responsive` union of Table, which DataTable forwards, breaks.
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable, type features } from '../DataTable';
import { Table, type TableResponsive } from './Table';

type Row = { name: string };
declare const columns: ColumnDef<typeof features, Row>[];
declare const data: Row[];
declare const dynamic: TableResponsive;

// --- Valid cases ---------------------------------------------------------------------------

const valid = [
  <Table key="a" />,
  <Table key="b" responsive />,
  <Table key="c" responsive={false} />,
  <Table key="d" responsive="sm" />,
  <Table key="e" responsive="md" />,
  <Table key="f" responsive="lg" />,
  <Table key="g" responsive={dynamic} />,
  <DataTable key="h" columns={columns} data={data} />,
  <DataTable key="i" columns={columns} data={data} responsive={false} />,
  <DataTable key="j" columns={columns} data={data} responsive="md" />,
  <DataTable key="k" columns={columns} data={data} responsive={dynamic} />,
];

// --- Invalid cases -------------------------------------------------------------------------

const invalid = [
  // @ts-expect-error unknown breakpoint
  <Table key="a" responsive="xl" />,
  // @ts-expect-error not a pixel width
  <Table key="b" responsive={768} />,
  // @ts-expect-error unknown breakpoint
  <DataTable key="c" columns={columns} data={data} responsive="xs" />,
  // @ts-expect-error the string 'true' is not the boolean
  <DataTable key="d" columns={columns} data={data} responsive="true" />,
];

void valid;
void invalid;
