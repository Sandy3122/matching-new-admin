
import React, { useState, useMemo, useCallback } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ColumnDef as TanstackColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  getFilteredRowModel,
  getSortedRowModel,
  Row,
} from "@tanstack/react-table"
import {
  ChevronDown,
  ChevronUp,
  ChevronsDown,
  ChevronsUp
} from "lucide-react"
import LoadingSpinner from "./loading-spinner";
import { Skeleton } from "./skeleton";

export type ColumnDef<T> = TanstackColumnDef<T, unknown>;

export interface EnhancedTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  title: string;
  searchPlaceholder?: string;
  itemsPerPageOptions?: number[];
  defaultItemsPerPage?: number;
  isLoading?: boolean;
  onRowClick?: (row: T) => void;
  headerActions?: React.ReactNode;
}

export const EnhancedTable = <T extends object>({
  data,
  columns,
  title,
  searchPlaceholder = "Search...",
  itemsPerPageOptions = [10, 20, 30, 40, 50],
  defaultItemsPerPage = 10,
  isLoading = false,
  onRowClick,
  headerActions,
}: EnhancedTableProps<T>) => {
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState({})
  const [globalFilter, setGlobalFilter] = useState("")
  const [sorting, setSorting] = useState([])

  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
      columnVisibility,
      globalFilter,
      sorting,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    debugTable: false,
    initialState: {
      pagination: {
        pageSize: defaultItemsPerPage,
        pageIndex: 0,
      },
    },
  })

  const handleItemsPerPageChange = useCallback((value: number) => {
    table.setPageSize(value);
  }, [table]);

  // Helper for row click
  const handleRowClick = (row: Row<T>) => {
    if (onRowClick) {
      onRowClick(row.original);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
        <h3 className="text-lg font-bold">{title}</h3>
        <div className="flex w-full md:w-auto items-center gap-2 md:gap-4 flex-wrap">
          <Input
            placeholder={searchPlaceholder}
            value={globalFilter ?? ""}
            onChange={
              (e) => {
                table.setGlobalFilter(e.target.value)
                setGlobalFilter(e.target.value)
              }
            }
            className="w-full md:max-w-sm"
          />
          {headerActions}
        </div>
      </div>
      <div className="border rounded-lg bg-white overflow-x-auto min-h-[200px] relative">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center h-full bg-gray-50/90 z-10">
            <LoadingSpinner size={40} />
            <div className="mt-2 text-pink-500">Loading...</div>
            <Table className="w-full">
              <TableHeader>
                {table.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map(header => {
                      return (
                        <TableHead key={header.id}>
                          <Skeleton className="h-6 w-full my-1" />
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {[...Array(6)].map((_, idx) => (
                  <TableRow key={idx}>
                    {columns.map((col: any, colIdx: number) => (
                      <TableCell key={col.key || colIdx}><Skeleton className="h-6 w-full my-1" /></TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <Table className="w-full">
            <TableCaption>{title}</TableCaption>
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => {
                    return (
                      <TableHead key={header.id} className="font-bold">
                        {header.isPlaceholder
                          ? null
                          : (
                            <div className="flex items-center">
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                              {header.column.getCanSort() && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => header.column.toggleSorting(header.column.getIsSorted() === "asc")}
                                  className="px-1"
                                >
                                  {header.column.getIsSorted() === "asc" ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : header.column.getIsSorted() === "desc" ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronsDown className="h-4 w-4" />
                                  )}
                                </Button>
                              )}
                            </div>
                          )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map(row => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    onClick={() => handleRowClick(row)}
                    className={onRowClick ? "cursor-pointer hover:bg-pink-50 transition-color duration-150" : ""}
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mt-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} of {data.length} row(s)
        </div>
        <div className="flex items-center flex-wrap gap-2">
          <Select value={String(table.getState().pagination.pageSize)} onValueChange={(value) => handleItemsPerPageChange(Number(value))}>
            <SelectTrigger className="w-full md:w-[120px]">
              <SelectValue placeholder={`${table.getState().pagination.pageSize} items per page`} />
            </SelectTrigger>
            <SelectContent>
              {itemsPerPageOptions.map((option) => (
                <SelectItem key={option} value={String(option)}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center flex-wrap gap-2 md:gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="h-8 w-8 p-0"
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsDown className="h-4 w-4 rotate-90" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="h-8 w-8 p-0"
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsUp className="h-4 w-4 rotate-90" />
            </Button>
          </div>
          <div className="flex w-full md:w-[100px] items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
        </div>
      </div>
    </div>
  );
};
