import type { Meta, StoryObj } from '@storybook/react';
import { expect, waitFor, within } from 'storybook/test';
import { InFrame } from '../../../.storybook/InFrame';
import { styleIn } from '../../../.storybook/styleIn';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from './Table';

const meta: Meta<typeof Table> = {
  title: 'Components/Table',
  component: Table,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof Table>;

const invoices = [
  { invoice: 'INV001', status: 'Pagada', method: 'Tarjeta de crédito', amount: '$250.00' },
  { invoice: 'INV002', status: 'Pendiente', method: 'PayPal', amount: '$150.00' },
  { invoice: 'INV003', status: 'Sin pagar', method: 'Transferencia bancaria', amount: '$350.00' },
];

// 1. Full static table (the 8 subcomponents composed together)
export const Simple: Story = {
  render: () => (
    <Table>
      <TableCaption>Listado de facturas recientes.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Factura</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Método</TableHead>
          <TableHead className="text-right">Monto</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((row) => (
          <TableRow key={row.invoice}>
            <TableCell className="font-medium">{row.invoice}</TableCell>
            <TableCell>{row.status}</TableCell>
            <TableCell>{row.method}</TableCell>
            <TableCell className="text-right">{row.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell className="text-right">$750.00</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Semantic structure: the 8 subcomponents compose an accessible table.
    const table = canvas.getByRole('table');
    await expect(table).toBeInTheDocument();

    // TableCaption
    await expect(canvas.getByText('Listado de facturas recientes.')).toBeInTheDocument();

    // TableHeader + TableHead: 4 encabezados de columna
    const columnHeaders = canvas.getAllByRole('columnheader');
    await expect(columnHeaders).toHaveLength(4);
    await expect(columnHeaders[0]).toHaveTextContent('Factura');

    // TableBody + TableRow + TableCell: 3 filas de datos + 1 de header + 1 de footer = 5 rows
    const rows = canvas.getAllByRole('row');
    await expect(rows).toHaveLength(5);
    await expect(canvas.getByText('INV001')).toBeInTheDocument();

    // TableFooter
    await expect(canvas.getByText('Total')).toBeInTheDocument();
    await expect(canvas.getByText('$750.00')).toBeInTheDocument();

    // Table: the <table> is wrapped in a container with overflow-x-auto (horizontal scroll is
    // the primitive's responsibility).
    const wrapper = table.parentElement;
    await expect(wrapper?.className).toContain('overflow-x-auto');

    // TableHead vs TableCell: different visual hierarchy (header with more weight and lower
    // secondary color opacity than the data cell).
    await expect(columnHeaders[0].className).toContain('font-medium');
    await expect(columnHeaders[0].className).toContain('text-base-content/65');
    const firstDataCell = canvas.getByText('INV001');
    await expect(firstDataCell.className).not.toContain('text-base-content/65');

    // TableRow: subtle hover with the same highlight token as SelectItem/DropdownMenuItem.
    const firstDataRow = firstDataCell.closest('tr');
    await expect(firstDataRow?.className).toContain('hover:bg-base-200');

    // className is merged (not replaced), same behavior checked in the Card test.
    // twMerge also resolves the utility conflict: 'text-left' (base) yields to
    // 'text-right' (consumer className) since they are the same category, as
    // expected from cn().
    const amountHeader = columnHeaders[3];
    const amountHeaderClasses = amountHeader.className.split(' ');
    await expect(amountHeaderClasses).toEqual(
      expect.arrayContaining(['px-4', 'py-3', 'align-middle', 'font-medium', 'text-right']),
    );
    await expect(amountHeaderClasses).not.toContain('text-left');
  },
};

// 2. Minimal table without caption or footer: standalone use without DataTable
export const WithoutFooterOrCaption: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Rol</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Ada Lovelace</TableCell>
          <TableCell>Ingeniería</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

// 3. responsive=false (default): it must not add any card mode class. The explicit
// roles (table/row/columnheader/cell) are always there, responsive or not; they are
// the defensive accessibility baseline, not something that depends on the prop.
export const NotResponsiveByDefault: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Rol</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell data-label="Nombre">Ada Lovelace</TableCell>
          <TableCell data-label="Rol">Ingeniería</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const table = canvas.getByRole('table');

    // Without responsive, no max-lg class (card mode) must be present.
    await expect(table.className).not.toContain('max-lg:');

    // Explicit roles present anyway (defensive accessibility baseline).
    await expect(table.getAttribute('role')).toBe('table');
    const dataRow = canvas.getByText('Ada Lovelace').closest('tr');
    await expect(dataRow?.getAttribute('role')).toBe('row');
    const cell = canvas.getByText('Ada Lovelace');
    await expect(cell.getAttribute('role')).toBe('cell');
    const columnHeader = canvas.getAllByRole('columnheader')[0];
    await expect(columnHeader.getAttribute('role')).toBe('columnheader');
  },
};

// 4. responsive=true: adds the card mode classes (collapse below `lg`) and keeps
// the data-label passed by hand in TableCell for those using the primitives directly
// without DataTable. Class check in headless; the real visual collapse below
// 1024px and the accessibility of the hidden thead are checked in a real Storybook
// window (same criterion as the rest of this DS's tasks).
export const Responsive: Story = {
  render: () => (
    <Table responsive>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Rol</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell data-label="Nombre">Ada Lovelace</TableCell>
          <TableCell data-label="Rol">Ingeniería</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const table = canvas.getByRole('table');

    // Key card mode classes: blockify of table/thead/tbody/tr/td, thead hidden
    // through sr-only (not display:none) and the column label through ::before + attr().
    await expect(table.className).toContain('max-lg:block');
    await expect(table.className).toContain('max-lg:[&_thead]:sr-only');
    await expect(table.className).toContain('max-lg:[&_tbody]:block');
    await expect(table.className).toContain('max-lg:[&_tr]:block');
    await expect(table.className).toContain('max-lg:[&_tr]:rounded-box');
    await expect(table.className).toContain('max-lg:[&_td]:flex');
    await expect(table.className).toContain(
      'max-lg:[&_td[data-label]]:before:content-[attr(data-label)]',
    );

    // The thead stays in the accessibility tree (sr-only, not display:none): its
    // columnheaders can still be queried by role.
    await expect(canvas.getAllByRole('columnheader')).toHaveLength(2);

    // data-label passed by hand by the consumer stays in the DOM as is.
    const cell = canvas.getByText('Ada Lovelace');
    await expect(cell.getAttribute('data-label')).toBe('Nombre');
  },
};

const breakpointTables = (
  <div className="flex flex-col gap-4">
    {(
      [
        ['sm', 'sm'],
        ['md', 'md'],
        ['lg', 'lg'],
        ['true', true],
        ['false', false],
      ] as const
    ).map(([name, responsive]) => (
      <Table key={name} responsive={responsive} aria-label={name}>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Rol</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell data-label="Nombre">Ada Lovelace</TableCell>
            <TableCell data-label="Rol">Ingeniería</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    ))}
  </div>
);

// Frame width → tables that must be cards there (sm 640px, md 768px, lg 1024px; true = lg).
const cardsAt: [number, string[]][] = [
  [600, ['sm', 'md', 'lg', 'true']],
  [700, ['md', 'lg', 'true']],
  [900, ['lg', 'true']],
  [1100, []],
];

// 5. responsive per breakpoint with the CSS applied: each frame sits on one side of a
// breakpoint, and each table is a card (block table, thead sr-only, flex cells with the label)
// only below its own. false is never a card.
export const ResponsiveBreakpoints: Story = {
  tags: ['real-css'],
  render: () => (
    <div className="flex flex-col gap-4">
      {cardsAt.map(([width]) => (
        <InFrame key={width} title={`${width}px`} width={width} height={200}>
          {breakpointTables}
        </InFrame>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const [width, cards] of cardsAt) {
      const frame = within(canvasElement).getByTitle(`${width}px`) as HTMLIFrameElement;
      await waitFor(() => expect(frame.contentDocument!.querySelectorAll('table').length).toBe(5));
      const frameBody = within(frame.contentDocument!.body);
      for (const name of ['sm', 'md', 'lg', 'true', 'false']) {
        const table = frameBody.getByRole('table', { name });
        const isCard = cards.includes(name);
        const cell = within(table).getByText('Ada Lovelace');
        const context = `${name} at ${width}px`;
        await expect(styleIn(table).display, context).toBe(isCard ? 'block' : 'table');
        await expect(styleIn(table.querySelector('thead')!).position, context).toBe(
          isCard ? 'absolute' : 'static',
        );
        await expect(styleIn(cell).display, context).toBe(isCard ? 'flex' : 'table-cell');
        await expect(styleIn(cell, '::before').content, context).toBe(isCard ? '"Nombre"' : 'none');
      }
    }
  },
};
