import * as React from 'react';
import { cn } from '../../utils/cn';

// -----------------------------------------------------------------------------
// Table Root
// -----------------------------------------------------------------------------
// The <table> is wrapped in a container with overflow-x-auto: a real data table
// can have more columns than fit in the viewport, and that horizontal scroll is the
// primitive's responsibility, not the consumer's. The ref is forwarded to the <table>
// (not to the wrapper div) because whoever uses the component expects an HTMLTableElement.
//
// Explicit role="table": changing the display of the cells (see `responsive` below)
// can make some browsers drop the element's implicit table role.
// It's always added, not only when responsive=true, as a defensive baseline.
//
// responsive (opt-in, default false): below the `lg` breakpoint (1024px) each
// TableRow collapses from a table row to a block card, and each TableCell prepends its
// data-label through ::before. It's pure CSS (Tailwind's `max-lg:` variant, no JS
// involved) applied here, on the root, with descendant selectors (same pattern that
// TableHeader/TableBody already use with `[&_tr]:...`), so TableRow/TableHead/TableCell don't
// need to know whether they're in responsive mode, with no Context or props repeated in each
// subcomponent.
//
// thead/tbody/tfoot are also "blockified" below `lg`: if the <table> becomes block but
// its children stay display:table-row-group without a table ancestor, the browser generates
// an anonymous table box around them (CSS2.1 §17.2.1) and the card layout doesn't
// behave like a real block. The <thead> is also hidden through sr-only (not display:none)
// so TableHeader stays in the accessibility tree; the same class the rest of the DS
// uses (see removeLabel in Chip) for visually hidden but accessible text.
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
// Explicit role="rowgroup" for the same reason as Table/TableRow/TableHead/TableCell:
// Table `responsive` changes this element's display below `lg`, which in some
// browsers can drop its implicit row group role.
const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  // Redundant today, but it's the deliberate compensation for when Table responsive changes
  // this thead's display (see the comment above Table): the linter can't know that
  // change exists.
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
  // eslint-disable-next-line jsx-a11y/no-redundant-roles -- same reason as in TableHeader
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
  // eslint-disable-next-line jsx-a11y/no-redundant-roles -- same reason as in TableHeader.
  <tfoot
    ref={ref}
    role="rowgroup"
    className={cn(
      'border-t border-base-300 bg-base-200/50 font-medium [&_tr]:last:border-b-0',
      className,
    )}
    {...props}
  />
));
TableFooter.displayName = 'TableFooter';

// -----------------------------------------------------------------------------
// Table Row (<tr>)
// -----------------------------------------------------------------------------
// hover:bg-base-200: same highlight token that SelectItem/DropdownMenuItem use in
// focus:bg-base-200, but as a hover variant: a table row isn't a keyboard-navigable item
// by default; the issue here is the readability of the row under the mouse in long tables.
//
// Explicit role="row" for the same reason as the rest of the primitives: Table
// `responsive` changes this element's display below `lg`.
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
// Table Head (<th>), header cell
// -----------------------------------------------------------------------------
// font-medium + text-base-content/65: same secondary text hierarchy criterion as
// helperText/Label (Input.tsx): more weight than the data cell, lower color opacity.
//
// Explicit role="columnheader" (the real implicit role of a <th> inside a table, not
// "cell") for the same reason as the rest of the primitives.
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
// Table Cell (<td>), data cell
// -----------------------------------------------------------------------------
// Explicit role="cell" for the same reason as the rest of the primitives.
//
// Optional data-label: whoever uses the primitives directly (without DataTable) in a
// responsive Table passes it by hand so Table draws the column label through ::before
// below `lg` (DataTable generates it from each column's header).
const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement> & { 'data-label'?: string }
>(({ className, ...props }, ref) => (
  // The plugin treats <td> as "interactive" because of its mapping to gridcell; here it's a
  // plain table role ("cell"), and it's the deliberate compensation for when Table responsive
  // changes this cell's display (see the comment above Table).
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
