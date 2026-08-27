import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
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
  { invoice: 'INV001', status: 'Paid', method: 'Credit Card', amount: '$250.00' },
  { invoice: 'INV002', status: 'Pending', method: 'PayPal', amount: '$150.00' },
  { invoice: 'INV003', status: 'Unpaid', method: 'Bank Transfer', amount: '$350.00' },
];

// 1. Tabla estática completa (los 8 subcomponentes compuestos juntos)
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

    // Estructura semántica: los 8 subcomponentes componen una tabla accesible.
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

    // Table: el <table> va envuelto en un contenedor con overflow-x-auto (scroll horizontal
    // responsabilidad del primitivo).
    const wrapper = table.parentElement;
    await expect(wrapper?.className).toContain('overflow-x-auto');

    // TableHead vs TableCell: jerarquía visual distinta (encabezado con más peso y menos
    // opacidad de color secundario que la celda de datos).
    await expect(columnHeaders[0].className).toContain('font-medium');
    await expect(columnHeaders[0].className).toContain('text-base-content/65');
    const firstDataCell = canvas.getByText('INV001');
    await expect(firstDataCell.className).not.toContain('text-base-content/65');

    // TableRow: hover sutil con el mismo token de highlight que SelectItem/DropdownMenuItem.
    const firstDataRow = firstDataCell.closest('tr');
    await expect(firstDataRow?.className).toContain('hover:bg-base-200');

    // className se mergea (no reemplaza) — mismo comportamiento verificado en el test de Card.
    // twMerge además resuelve el conflicto de utilidades: 'text-left' (base) cede ante
    // 'text-right' (className del consumidor) por ser la misma categoría, tal como se
    // espera de cn().
    const amountHeader = columnHeaders[3];
    const amountHeaderClasses = amountHeader.className.split(' ');
    await expect(amountHeaderClasses).toEqual(
      expect.arrayContaining(['px-4', 'py-3', 'align-middle', 'font-medium', 'text-right']),
    );
    await expect(amountHeaderClasses).not.toContain('text-left');
  },
};

// 2. Tabla mínima sin caption ni footer — uso standalone sin DataTable
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
          <TableCell>Engineer</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

// 3. responsive=false (default): no debe agregar ninguna clase del modo tarjeta. Los
// roles explícitos (table/row/columnheader/cell) están siempre, sea responsive o no —
// son el baseline defensivo de accesibilidad, no algo que dependa de la prop.
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
          <TableCell data-label="Rol">Engineer</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const table = canvas.getByRole('table');

    // Sin responsive, ninguna clase max-lg (modo tarjeta) debe estar presente.
    await expect(table.className).not.toContain('max-lg:');

    // Roles explícitos presentes de todas formas (baseline defensivo de accesibilidad).
    await expect(table.getAttribute('role')).toBe('table');
    const dataRow = canvas.getByText('Ada Lovelace').closest('tr');
    await expect(dataRow?.getAttribute('role')).toBe('row');
    const cell = canvas.getByText('Ada Lovelace');
    await expect(cell.getAttribute('role')).toBe('cell');
    const columnHeader = canvas.getAllByRole('columnheader')[0];
    await expect(columnHeader.getAttribute('role')).toBe('columnheader');
  },
};

// 4. responsive=true: agrega las clases del modo tarjeta (colapso por debajo de `lg`) y
// respeta el data-label pasado a mano en TableCell para quien usa los primitivos directo
// sin DataTable. Verificación de clases en headless — el colapso visual real por debajo
// de 1024px y la accesibilidad del thead oculto se verifican en una ventana de Storybook
// real (mismo criterio que el resto de tareas de este DS).
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
          <TableCell data-label="Rol">Engineer</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const table = canvas.getByRole('table');

    // Clases clave del modo tarjeta: blockify de table/thead/tbody/tr/td, thead oculto
    // vía sr-only (no display:none) y la etiqueta de columna vía ::before + attr().
    await expect(table.className).toContain('max-lg:block');
    await expect(table.className).toContain('max-lg:[&_thead]:sr-only');
    await expect(table.className).toContain('max-lg:[&_tbody]:block');
    await expect(table.className).toContain('max-lg:[&_tr]:block');
    await expect(table.className).toContain('max-lg:[&_tr]:rounded-box');
    await expect(table.className).toContain('max-lg:[&_td]:flex');
    await expect(table.className).toContain(
      'max-lg:[&_td[data-label]]:before:content-[attr(data-label)]',
    );

    // El thead sigue en el árbol de accesibilidad (sr-only, no display:none): sus
    // columnheaders siguen siendo queryables por rol.
    await expect(canvas.getAllByRole('columnheader')).toHaveLength(2);

    // data-label pasado a mano por el consumidor queda en el DOM tal cual.
    const cell = canvas.getByText('Ada Lovelace');
    await expect(cell.getAttribute('data-label')).toBe('Nombre');
  },
};
