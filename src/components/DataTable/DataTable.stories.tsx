import type { Meta, StoryObj } from '@storybook/react';
import { createColumnHelper } from '@tanstack/react-table';
import { expect, userEvent, within } from 'storybook/test';
import { DataTable } from './DataTable';
import { features } from './dataTableFeatures';
import { PersonIcon } from '@radix-ui/react-icons';
import { Button } from '../Button';
import {
  // Alias: the "EmptyState" story in this file already uses that name.
  EmptyState as EmptyStateRoot,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
} from '../EmptyState';

interface Person {
  id: string;
  name: string;
  email: string;
  role: string;
}

// 23 names from A to W, deliberately unsorted: enough for 3 pages with the default
// pageSize (10) and lets us check ascending order by name with a single letter.
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
const roles = ['Diseño', 'Ingeniería', 'Producto', 'Ventas', 'Soporte'];

const people: Person[] = names.map((name, index) => ({
  id: String(index + 1),
  name,
  email: `${name.toLowerCase()}@example.com`,
  role: roles[index % roles.length],
}));

const columnHelper = createColumnHelper<typeof features, Person>();
const columns = [
  columnHelper.accessor('name', { header: 'Nombre' }),
  columnHelper.accessor('email', { header: 'Correo' }),
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

// 1. Base render: the 23 records, search box always visible, pagination on the
// first page.
export const Default: Story = {
  render: () => <DataTable columns={columns} data={people} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('table')).toBeInTheDocument();
    await expect(canvas.getByPlaceholderText('Search...')).toBeInTheDocument();
    await expect(canvas.getAllByRole('columnheader')).toHaveLength(3);
    // rowPaginationFeature's default pageSize is 10 -> 23 records = 3 pages.
    await expect(canvas.getByText('Page 1 of 3')).toBeInTheDocument();
  },
};

// 2. Sort by clicking TableHead: toggles the sort of the matching column.
export const SortByHeader: Story = {
  render: () => <DataTable columns={columns} data={people} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const rows = () => canvas.getAllByRole('row');

    // Before sorting: the first data row is the first one of the unsorted array (Marta).
    await expect(rows()[1]).toHaveTextContent('Marta');

    const nameHeader = canvas.getByRole('button', { name: /Nombre/i });

    // Neutral state (CaretSortIcon): the icon doesn't have text-primary.
    await expect(nameHeader.querySelector('svg')).not.toHaveClass('text-primary');

    await userEvent.click(nameHeader);

    // sortFn_text (auto, registered in features) compares in lowercase with standard < / >:
    // 'Ana' is first alphabetically among the 23 names.
    await expect(rows()[1]).toHaveTextContent('Ana');

    // The sort icon changes from CaretSortIcon (unsorted) to CaretUpIcon (ascending) and
    // starts using text-primary to show visually that the column is sorted.
    await expect(nameHeader.querySelector('svg')).toBeInTheDocument();
    await expect(nameHeader.querySelector('svg')).toHaveClass('text-primary');
  },
};

// 3. Search box (global filter): typing filters the visible rows.
export const GlobalFilter: Story = {
  render: () => <DataTable columns={columns} data={people} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const searchBox = canvas.getByPlaceholderText('Search...');

    await userEvent.type(searchBox, 'Walter');

    // Only "Walter" matches -> 1 header row (thead) + 1 data row (tbody).
    await expect(canvas.getAllByRole('row')).toHaveLength(2);
    await expect(canvas.getByText('Walter')).toBeInTheDocument();
    await expect(canvas.queryByText('Ana')).not.toBeInTheDocument();

    // Searching also resets to the first page (23 -> 1 result = 1 page).
    await expect(canvas.getByText('Page 1 of 1')).toBeInTheDocument();
  },
};

// 4. Pagination: "Next"/"Previous" change the rows shown.
export const Pagination: Story = {
  render: () => <DataTable columns={columns} data={people} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const previousButton = canvas.getByRole('button', { name: 'Previous' });
    const nextButton = canvas.getByRole('button', { name: 'Next' });

    // Page 1: "Previous" disabled, the first row is "Marta" (original order).
    await expect(previousButton).toBeDisabled();
    await expect(canvas.getAllByRole('row')[1]).toHaveTextContent('Marta');

    await userEvent.click(nextButton);

    // Page 2: unsorted record #11 is "Rosa" (index 10 of the `names` array,
    // pageSize 10 -> page 2 starts at index 10).
    await expect(canvas.getByText('Page 2 of 3')).toBeInTheDocument();
    await expect(canvas.getAllByRole('row')[1]).toHaveTextContent('Rosa');
    await expect(previousButton).not.toBeDisabled();

    await userEvent.click(previousButton);

    // Back to page 1 with the same rows as at the start.
    await expect(canvas.getByText('Page 1 of 3')).toBeInTheDocument();
    await expect(canvas.getAllByRole('row')[1]).toHaveTextContent('Marta');
  },
};

// 4b. Touch target: the pagination buttons extend their hit area to 44px in height with an
// ::after and stay sm (32px). This project doesn't apply Tailwind, so the assertions are on classes.
export const PaginationTouchTarget: Story = {
  render: () => <DataTable columns={columns} data={people} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    for (const name of ['Previous', 'Next']) {
      const classes = canvas.getByRole('button', { name }).className.split(' ');
      await expect(classes).toContain('relative');
      await expect(classes).toContain("after:content-['']");
      await expect(classes).toContain('after:absolute');
      await expect(classes).toContain('after:rounded-btn');
      await expect(classes).toContain('after:-inset-x-px');
      await expect(classes).toContain('after:-inset-y-[7px]');
      await expect(classes).toContain('h-8');
    }
  },
};

// 5. Responsive mode: DataTable turns on Table `responsive` by itself (the consumer
// passes nothing) and generates each cell's data-label from the column header
// (string) defined in `columns`. Class check in headless; the real visual collapse
// below 1024px is checked in a real Storybook window.
export const ResponsiveCollapse: Story = {
  render: () => <DataTable columns={columns} data={people} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const table = canvas.getByRole('table');

    // The inner Table gets responsive=true without the DataTable consumer passing anything.
    await expect(table.className).toContain('max-lg:block');
    await expect(table.className).toContain('max-lg:[&_thead]:sr-only');

    // data-label generated from the header ('Nombre', 'Email', 'Rol', strings
    // defined in this story's `columns`) for each cell of the first data row.
    const firstDataRow = canvas.getByText('Marta').closest('tr');
    const cellsInRow = firstDataRow ? within(firstDataRow).getAllByRole('cell') : [];
    await expect(cellsInRow[0].getAttribute('data-label')).toBe('Nombre');
    await expect(cellsInRow[1].getAttribute('data-label')).toBe('Correo');
    await expect(cellsInRow[2].getAttribute('data-label')).toBe('Rol');
  },
};

// 6. Empty state: the filter with no results shows a single row with colSpan = columns.
export const EmptyState: Story = {
  render: () => <DataTable columns={columns} data={people} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const searchBox = canvas.getByPlaceholderText('Search...');

    await userEvent.type(searchBox, 'zzzzz');

    // Default: EmptyState sm with the usual title.
    const title = canvas.getByText('No results.');
    await expect(title.tagName).toBe('P');
    const root = title.closest('[data-size]');
    await expect(root).toHaveAttribute('data-size', 'sm');

    const emptyCell = title.closest('td')!;
    await expect(emptyCell.getAttribute('colspan')).toBe('3');
    // No data-label: in card mode (below lg) no column label is attached.
    await expect(emptyCell).not.toHaveAttribute('data-label');

    // A single data row (the empty state one) besides the header row.
    await expect(canvas.getAllByRole('row')).toHaveLength(2);
  },
};

// 7. Custom empty state: emptyState replaces the default inside the same cell.
export const CustomEmptyState: Story = {
  render: () => (
    <DataTable
      columns={columns}
      data={[]}
      emptyState={
        <EmptyStateRoot size="sm">
          <EmptyStateIcon>
            <PersonIcon />
          </EmptyStateIcon>
          <EmptyStateTitle>Todavía no hay personas</EmptyStateTitle>
          <EmptyStateDescription>Invita a alguien para empezar.</EmptyStateDescription>
          <EmptyStateActions>
            <Button size="sm">Invitar</Button>
          </EmptyStateActions>
        </EmptyStateRoot>
      }
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText('No results.')).not.toBeInTheDocument();

    const title = canvas.getByText('Todavía no hay personas');
    const emptyCell = title.closest('td')!;
    await expect(emptyCell.getAttribute('colspan')).toBe('3');
    await expect(emptyCell).not.toHaveAttribute('data-label');
    await expect(within(emptyCell).getByRole('button', { name: 'Invitar' })).toBeInTheDocument();
    await expect(canvas.getAllByRole('row')).toHaveLength(2);
  },
};

// 8. Custom texts: searchPlaceholder, previousLabel, nextLabel and pageLabel replace the
// English defaults. pageLabel gets the current page (from 1) and the total.
export const CustomLabels: Story = {
  render: () => (
    <DataTable
      columns={columns}
      data={people}
      searchPlaceholder="Buscar..."
      previousLabel="Anterior"
      nextLabel="Siguiente"
      pageLabel={(page, total) => `Página ${page} de ${total}`}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const searchBox = canvas.getByRole('textbox', { name: 'Buscar...' });
    await expect(searchBox).toHaveAttribute('placeholder', 'Buscar...');
    await expect(canvas.getByText('Página 1 de 3')).toBeInTheDocument();
    await expect(canvas.queryByText(/^Page /)).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: 'Siguiente' }));
    await expect(canvas.getByText('Página 2 de 3')).toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: 'Anterior' }));
    await expect(canvas.getByText('Página 1 de 3')).toBeInTheDocument();
  },
};
