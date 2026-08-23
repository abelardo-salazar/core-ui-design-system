import type { Meta, StoryObj } from '@storybook/react';
import { createColumnHelper } from '@tanstack/react-table';
import { expect, userEvent, within } from 'storybook/test';
import { DataTable } from './DataTable';
import { features } from './dataTableFeatures';

interface Person {
  id: string;
  name: string;
  email: string;
  role: string;
}

// 23 nombres en A-W, deliberadamente desordenados: alcanza para 3 páginas con el pageSize
// default (10) y permite verificar el orden ascendente por nombre con una sola letra.
const names = [
  'Marta',
  'Bruno',
  'Teresa',
  'Ana',
  'Hugo',
  'Elena',
  'Walter',
  'Carla',
  'Ines',
  'Diego',
  'Rosa',
  'Franco',
  'Valeria',
  'Gabriela',
  'Ulises',
  'Javier',
  'Olivia',
  'Karina',
  'Quintin',
  'Lucas',
  'Sergio',
  'Nestor',
  'Pablo',
];
const roles = ['Design', 'Engineering', 'Product', 'Sales', 'Support'];

const people: Person[] = names.map((name, index) => ({
  id: String(index + 1),
  name,
  email: `${name.toLowerCase()}@example.com`,
  role: roles[index % roles.length],
}));

const columnHelper = createColumnHelper<typeof features, Person>();
const columns = [
  columnHelper.accessor('name', { header: 'Nombre' }),
  columnHelper.accessor('email', { header: 'Email' }),
  columnHelper.accessor('role', { header: 'Rol' }),
];

const meta: Meta<typeof DataTable> = {
  title: 'Components/DataTable',
  component: DataTable,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof DataTable<Person>>;

// 1. Render base: los 23 registros, caja de búsqueda siempre visible, paginación en la
// primera página.
export const Default: Story = {
  render: () => <DataTable columns={columns} data={people} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('table')).toBeInTheDocument();
    await expect(canvas.getByPlaceholderText('Buscar...')).toBeInTheDocument();
    await expect(canvas.getAllByRole('columnheader')).toHaveLength(3);
    // pageSize default de rowPaginationFeature es 10 -> 23 registros = 3 páginas.
    await expect(canvas.getByText('Página 1 de 3')).toBeInTheDocument();
  },
};

// 2. Ordenar por click en TableHead: alterna el sort de la columna correspondiente.
export const SortByHeader: Story = {
  render: () => <DataTable columns={columns} data={people} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const rows = () => canvas.getAllByRole('row');

    // Antes de ordenar: primera fila de datos es la primera del array sin ordenar (Marta).
    await expect(rows()[1]).toHaveTextContent('Marta');

    const nameHeader = canvas.getByRole('button', { name: /Nombre/i });

    // Estado neutro (CaretSortIcon): el ícono no lleva text-primary.
    await expect(nameHeader.querySelector('svg')).not.toHaveClass('text-primary');

    await userEvent.click(nameHeader);

    // sortFn_text (auto, registrado en features) compara en minúscula con < / > estándar:
    // 'Ana' es la primera alfabéticamente entre los 23 nombres.
    await expect(rows()[1]).toHaveTextContent('Ana');

    // El ícono de sort cambia de CaretSortIcon (sin ordenar) a CaretUpIcon (ascendente) y
    // pasa a usar text-primary para distinguir visualmente que la columna está ordenada.
    await expect(nameHeader.querySelector('svg')).toBeInTheDocument();
    await expect(nameHeader.querySelector('svg')).toHaveClass('text-primary');
  },
};

// 3. Caja de búsqueda (global filter): escribir filtra las filas visibles.
export const GlobalFilter: Story = {
  render: () => <DataTable columns={columns} data={people} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const searchBox = canvas.getByPlaceholderText('Buscar...');

    await userEvent.type(searchBox, 'Walter');

    // Solo "Walter" matchea -> 1 fila de header (thead) + 1 fila de datos (tbody).
    await expect(canvas.getAllByRole('row')).toHaveLength(2);
    await expect(canvas.getByText('Walter')).toBeInTheDocument();
    await expect(canvas.queryByText('Ana')).not.toBeInTheDocument();

    // La búsqueda también resetea a la primera página (23 -> 1 resultado = 1 página).
    await expect(canvas.getByText('Página 1 de 1')).toBeInTheDocument();
  },
};

// 4. Paginación: "Siguiente"/"Anterior" cambian las filas mostradas.
export const Pagination: Story = {
  render: () => <DataTable columns={columns} data={people} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const previousButton = canvas.getByRole('button', { name: 'Anterior' });
    const nextButton = canvas.getByRole('button', { name: 'Siguiente' });

    // Página 1: "Anterior" deshabilitado, primera fila es "Marta" (orden original).
    await expect(previousButton).toBeDisabled();
    await expect(canvas.getAllByRole('row')[1]).toHaveTextContent('Marta');

    await userEvent.click(nextButton);

    // Página 2: el registro #11 sin ordenar es "Rosa" (índice 10 del array `names`,
    // pageSize 10 -> la página 2 arranca en el índice 10).
    await expect(canvas.getByText('Página 2 de 3')).toBeInTheDocument();
    await expect(canvas.getAllByRole('row')[1]).toHaveTextContent('Rosa');
    await expect(previousButton).not.toBeDisabled();

    await userEvent.click(previousButton);

    // Vuelve a la página 1 con las mismas filas que al inicio.
    await expect(canvas.getByText('Página 1 de 3')).toBeInTheDocument();
    await expect(canvas.getAllByRole('row')[1]).toHaveTextContent('Marta');
  },
};

// 5. Estado vacío: el filtro sin resultados muestra una única fila con colSpan = columnas.
export const EmptyState: Story = {
  render: () => <DataTable columns={columns} data={people} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const searchBox = canvas.getByPlaceholderText('Buscar...');

    await userEvent.type(searchBox, 'zzzzz');

    await expect(canvas.getByText('Sin resultados.')).toBeInTheDocument();

    const emptyCell = canvas.getByText('Sin resultados.');
    await expect(emptyCell.tagName).toBe('TD');
    await expect(emptyCell.getAttribute('colspan')).toBe('3');

    // Una sola fila de datos (la del estado vacío) además de la fila de header.
    await expect(canvas.getAllByRole('row')).toHaveLength(2);
  },
};
