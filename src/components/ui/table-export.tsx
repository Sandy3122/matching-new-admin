import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';
import { exportToCsv, printTable } from '@/lib/export';
import { useToast } from '@/hooks/use-toast';

interface TableExportButtonsProps<T> {
  columns: ColumnDef<T, unknown>[];
  rows: T[];
  filename: string;
  title: string;
}

export function TableExportButtons<T>({ columns, rows, filename, title }: TableExportButtonsProps<T>) {
  const { toast } = useToast();

  const handleCsv = () => {
    try {
      if (!rows.length) {
        toast({ title: 'Nothing to export', description: 'There are no rows to export.' });
        return;
      }
      exportToCsv(filename, columns, rows);
    } catch (error) {
      toast({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'Could not export CSV',
        variant: 'destructive',
      });
    }
  };

  const handlePrint = () => {
    try {
      if (!rows.length) {
        toast({ title: 'Nothing to print', description: 'There are no rows to print.' });
        return;
      }
      printTable(title, columns, rows);
    } catch (error) {
      toast({
        title: 'Print failed',
        description: error instanceof Error ? error.message : 'Could not open print view',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={handleCsv} className="h-9">
        <Download className="h-4 w-4 mr-1" />
        CSV
      </Button>
      <Button variant="outline" size="sm" onClick={handlePrint} className="h-9">
        <Printer className="h-4 w-4 mr-1" />
        Print
      </Button>
    </div>
  );
}

export default TableExportButtons;
