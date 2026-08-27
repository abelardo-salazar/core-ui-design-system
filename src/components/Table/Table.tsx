import * as React from 'react';
import { cn } from '../../utils/cn';

// -----------------------------------------------------------------------------
// Table Root
// -----------------------------------------------------------------------------
// El <table> va envuelto en un contenedor con overflow-x-auto: una tabla de datos real
// puede tener más columnas de las que entran en el viewport, y ese scroll horizontal es
// responsabilidad del primitivo, no de quien lo consume. El ref se forwardea al <table>
// (no al div wrapper) porque quien usa el componente espera un HTMLTableElement.
//
// role="table" explícito: cambiar el display de las celdas (ver `responsive` más abajo)
// puede hacer que algunos navegadores le quiten el rol implícito de tabla al elemento.
// Se agrega siempre, no solo cuando responsive=true, como baseline defensivo.
//
// responsive (opt-in, default false): por debajo del breakpoint `lg` (1024px) cada
// TableRow colapsa de fila de tabla a tarjeta de bloque, y cada TableCell antepone su
// data-label vía ::before. Es puro CSS (variante `max-lg:` de Tailwind, sin JS de por
// medio) aplicado acá, en el root, con selectores descendientes (mismo patrón que ya usan
// TableHeader/TableBody con `[&_tr]:...`) — así TableRow/TableHead/TableCell no necesitan
// saber si están en modo responsive, sin Context ni props repetidas en cada subcomponente.
//
// thead/tbody/tfoot también se "blockifican" bajo `lg`: si el <table> pasa a block pero
// sus hijos siguen en display:table-row-group sin un ancestro table, el navegador genera
// una caja de tabla anónima alrededor (CSS2.1 §17.2.1) y el layout de tarjetas no se
// comporta como bloque real. El <thead> además queda oculto vía sr-only (no display:none)
// para que TableHeader siga en el árbol de accesibilidad — misma clase que ya usa el resto
// del DS (ver removeLabel en Chip) para texto visualmente oculto pero accesible.
const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement> & { responsive?: boolean }
>(({ className, responsive = false, ...props }, ref) => (
  <div className="relative w-full overflow-x-auto">
    <table
      ref={ref}
      role="table"
      className={cn(
        'w-full caption-bottom text-sm',
        responsive && [
          'max-lg:block',
          'max-lg:[&_thead]:sr-only',
          'max-lg:[&_tbody]:block',
          'max-lg:[&_tfoot]:block',
          'max-lg:[&_tr]:block',
          'max-lg:[&_tr]:rounded-box',
          'max-lg:[&_tr]:border',
          'max-lg:[&_tr]:border-base-300',
          'max-lg:[&_tr]:bg-base-100',
          'max-lg:[&_tr]:shadow-sm',
          'max-lg:[&_tr]:mb-4',
          'max-lg:[&_tr]:last:mb-0',
          'max-lg:[&_th]:block',
          'max-lg:[&_td]:flex',
          'max-lg:[&_td]:items-center',
          'max-lg:[&_td]:justify-between',
          'max-lg:[&_td]:gap-4',
          'max-lg:[&_td[data-label]]:before:content-[attr(data-label)]',
          'max-lg:[&_td[data-label]]:before:shrink-0',
          'max-lg:[&_td[data-label]]:before:font-medium',
          'max-lg:[&_td[data-label]]:before:text-base-content/65',
        ],
        className,
      )}
      {...props}
    />
  </div>
));
Table.displayName = 'Table';

// -----------------------------------------------------------------------------
// Table Header (<thead>)
// -----------------------------------------------------------------------------
// role="rowgroup" explícito por el mismo motivo que Table/TableRow/TableHead/TableCell:
// Table `responsive` cambia el display de este elemento bajo `lg`, lo que en algunos
// navegadores puede quitarle el rol implícito de grupo de filas.
const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  // Redundante hoy, pero es la compensación deliberada para cuando Table responsive cambia
  // el display de este thead (ver comentario arriba de Table): el lint no puede saber que
  // ese cambio existe.
  // eslint-disable-next-line jsx-a11y/no-redundant-roles
  <thead
    ref={ref}
    role="rowgroup"
    className={cn('[&_tr]:border-b [&_tr]:border-base-300', className)}
    {...props}
  />
));
TableHeader.displayName = 'TableHeader';

// -----------------------------------------------------------------------------
// Table Body (<tbody>)
// -----------------------------------------------------------------------------
const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  // eslint-disable-next-line jsx-a11y/no-redundant-roles -- ver mismo motivo en TableHeader
  <tbody
    ref={ref}
    role="rowgroup"
    className={cn('[&_tr:last-child]:border-0', className)}
    {...props}
  />
));
TableBody.displayName = 'TableBody';

// -----------------------------------------------------------------------------
// Table Footer (<tfoot>)
// -----------------------------------------------------------------------------
const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  // eslint-disable-next-line jsx-a11y/no-redundant-roles -- ver mismo motivo en TableHeader.
  <tfoot
    ref={ref}
    role="rowgroup"
    className={cn('border-t border-base-300 bg-base-200/50 font-medium [&_tr]:last:border-b-0', className)}
    {...props}
  />
));
TableFooter.displayName = 'TableFooter';

// -----------------------------------------------------------------------------
// Table Row (<tr>)
// -----------------------------------------------------------------------------
// hover:bg-base-200 — mismo token de highlight que SelectItem/DropdownMenuItem usan en
// focus:bg-base-200, pero en variante hover: una fila de tabla no es un ítem navegable por
// teclado por defecto, el problema acá es legibilidad de la fila bajo el mouse en tablas largas.
//
// role="row" explícito por el mismo motivo que el resto de los primitivos: Table
// `responsive` cambia el display de este elemento bajo `lg`.
const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      role="row"
      className={cn('border-b border-base-300 transition-colors hover:bg-base-200', className)}
      {...props}
    />
  ),
);
TableRow.displayName = 'TableRow';

// -----------------------------------------------------------------------------
// Table Head (<th>) — celda de encabezado
// -----------------------------------------------------------------------------
// font-medium + text-base-content/65: mismo criterio de jerarquía de texto secundaria que
// helperText/Label (Input.tsx) — más peso que la celda de datos, menos opacidad de color.
//
// role="columnheader" explícito (el rol implícito real de un <th> dentro de una tabla, no
// "cell") por el mismo motivo que el resto de los primitivos.
const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    role="columnheader"
    className={cn('px-4 py-3 text-left align-middle font-medium text-base-content/65', className)}
    {...props}
  />
));
TableHead.displayName = 'TableHead';

// -----------------------------------------------------------------------------
// Table Cell (<td>) — celda de datos
// -----------------------------------------------------------------------------
// role="cell" explícito por el mismo motivo que el resto de los primitivos.
//
// data-label opcional: quien use los primitivos directo (sin DataTable) en un Table
// responsive lo pasa a mano para que Table pinte la etiqueta de columna vía ::before por
// debajo de `lg` (DataTable la autogenera a partir del header de cada columna).
const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement> & { 'data-label'?: string }
>(({ className, ...props }, ref) => (
  // El plugin trata <td> como "interactivo" por su mapeo a gridcell; acá es un rol de
  // tabla simple ("cell"), y es la compensación deliberada para cuando Table responsive
  // cambia el display de esta celda (ver comentario arriba de Table).
  <td
    ref={ref}
    // eslint-disable-next-line jsx-a11y/no-interactive-element-to-noninteractive-role
    role="cell"
    className={cn('px-4 py-3 align-middle text-base-content', className)}
    {...props}
  />
));
TableCell.displayName = 'TableCell';

// -----------------------------------------------------------------------------
// Table Caption (<caption>)
// -----------------------------------------------------------------------------
const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption ref={ref} className={cn('mt-4 text-sm text-base-content/65', className)} {...props} />
));
TableCaption.displayName = 'TableCaption';

// Export all components
export { Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableCaption };
