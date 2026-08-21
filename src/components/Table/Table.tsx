import * as React from 'react';
import { cn } from '../../utils/cn';

// -----------------------------------------------------------------------------
// Table Root
// -----------------------------------------------------------------------------
// El <table> va envuelto en un contenedor con overflow-x-auto: una tabla de datos real
// puede tener más columnas de las que entran en el viewport, y ese scroll horizontal es
// responsabilidad del primitivo, no de quien lo consume. El ref se forwardea al <table>
// (no al div wrapper) porque quien usa el componente espera un HTMLTableElement.
const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="relative w-full overflow-x-auto">
      <table
        ref={ref}
        className={cn('w-full caption-bottom text-sm', className)}
        {...props}
      />
    </div>
  ),
);
Table.displayName = 'Table';

// -----------------------------------------------------------------------------
// Table Header (<thead>)
// -----------------------------------------------------------------------------
const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn('[&_tr]:border-b [&_tr]:border-base-300', className)} {...props} />
));
TableHeader.displayName = 'TableHeader';

// -----------------------------------------------------------------------------
// Table Body (<tbody>)
// -----------------------------------------------------------------------------
const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn('[&_tr:last-child]:border-0', className)} {...props} />
));
TableBody.displayName = 'TableBody';

// -----------------------------------------------------------------------------
// Table Footer (<tfoot>)
// -----------------------------------------------------------------------------
const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
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
const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
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
const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn('px-4 py-3 text-left align-middle font-medium text-base-content/65', className)}
    {...props}
  />
));
TableHead.displayName = 'TableHead';

// -----------------------------------------------------------------------------
// Table Cell (<td>) — celda de datos
// -----------------------------------------------------------------------------
const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td ref={ref} className={cn('px-4 py-3 align-middle text-base-content', className)} {...props} />
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
