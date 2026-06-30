import { ColumnDef } from '@tanstack/react-table';

/**
 * Generic table export helpers (CSV + Print), dependency-free.
 * Mirrors the legacy DataTables Copy/CSV/Print export buttons.
 */

const ACTION_HEADERS = new Set([
  'Actions',
  'Action',
  'Update',
  'Generate PDF',
  'Reset Password',
  'Delete',
]);

interface ExportableColumn<T> {
  header: string;
  getValue: (row: T) => string;
}

const toText = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') {
    // Firestore timestamp-like objects
    if ((value as any)._seconds) {
      return new Date((value as any)._seconds * 1000).toLocaleString();
    }
    return '';
  }
  return String(value);
};

/**
 * Build the set of exportable columns from a tanstack column definition,
 * skipping action/button columns and columns without a string header or accessor.
 */
const resolveColumns = <T,>(columns: ColumnDef<T, unknown>[]): ExportableColumn<T>[] => {
  return columns
    .filter((col) => {
      const header = typeof col.header === 'string' ? col.header : '';
      if (!header || ACTION_HEADERS.has(header)) return false;
      const hasAccessor =
        typeof (col as any).accessorFn === 'function' || typeof (col as any).accessorKey === 'string';
      return hasAccessor;
    })
    .map((col) => {
      const header = col.header as string;
      const accessorFn = (col as any).accessorFn as ((row: T) => unknown) | undefined;
      const accessorKey = (col as any).accessorKey as string | undefined;
      return {
        header,
        getValue: (row: T) => {
          try {
            if (accessorFn) return toText(accessorFn(row));
            if (accessorKey) return toText((row as any)[accessorKey]);
          } catch {
            return '';
          }
          return '';
        },
      };
    });
};

const escapeCsv = (value: string): string => {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

export const exportToCsv = <T,>(filename: string, columns: ColumnDef<T, unknown>[], rows: T[]) => {
  const cols = resolveColumns(columns);
  const headerLine = cols.map((c) => escapeCsv(c.header)).join(',');
  const dataLines = rows.map((row) => cols.map((c) => escapeCsv(c.getValue(row))).join(','));
  const csv = [headerLine, ...dataLines].join('\n');

  const blob = new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const escapeHtml = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const printTable = <T,>(title: string, columns: ColumnDef<T, unknown>[], rows: T[]) => {
  const cols = resolveColumns(columns);
  const win = window.open('', '_blank', 'width=1000,height=800');
  if (!win) {
    throw new Error('Popup blocked. Please allow popups to print/export.');
  }
  const head = cols.map((c) => `<th>${escapeHtml(c.header)}</th>`).join('');
  const body = rows
    .map(
      (row) =>
        `<tr>${cols.map((c) => `<td>${escapeHtml(c.getValue(row))}</td>`).join('')}</tr>`,
    )
    .join('');

  win.document.write(`<!DOCTYPE html><html><head><title>${escapeHtml(title)}</title>
    <style>
      body { font-family: Arial, Helvetica, sans-serif; color: #222; padding: 24px; }
      h1 { color: #db2777; font-size: 20px; }
      table { width: 100%; border-collapse: collapse; margin-top: 12px; }
      th, td { text-align: left; padding: 6px 10px; border: 1px solid #d1d5db; font-size: 12px; }
      th { background: #fce7f3; }
    </style></head><body>
    <h1>${escapeHtml(title)}</h1>
    <table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>
    <script>window.onload = function(){ window.print(); }</script>
    </body></html>`);
  win.document.close();
};
