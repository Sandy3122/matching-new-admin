
import React, { useState, useMemo, useCallback } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
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
  Column,
} from "@tanstack/react-table"
import {
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
  ArrowUp,
  ArrowDown,
  FilterX,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import LoadingSpinner from "./loading-spinner";
import { Skeleton } from "./skeleton";

export type ColumnDef<T> = TanstackColumnDef<T, unknown>;

export interface AdvancedTableProps<T> {
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

const ColumnFilter = ({ column }: { column: Column<any, any> }) => {
  const columnFilterValue = column.getFilterValue();
  
  return (
    <div className="flex items-center space-x-1">
      <div className="relative">
        <Filter className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
        <Input
          type="text"
          value={(columnFilterValue ?? "") as string}
          onChange={(e) => column.setFilterValue(e.target.value)}
          placeholder={`Filter...`}
          className="h-7 pl-7 text-xs border-gray-200 focus:border-pink-300 focus:ring-pink-200 bg-white"
          onClick={(e) => e.stopPropagation()}
        />
        {columnFilterValue && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-5 w-5 p-0 hover:bg-gray-100"
            onClick={(e) => {
              e.stopPropagation();
              column.setFilterValue("");
            }}
          >
            <FilterX className="h-3 w-3 text-gray-400" />
          </Button>
        )}
      </div>
    </div>
  );
};

export const AdvancedTable = <T extends object>({
  data,
  columns,
  title,
  searchPlaceholder = "Search...",
  itemsPerPageOptions = [10, 25, 50, 100],
  defaultItemsPerPage = 25,
  isLoading = false,
  onRowClick,
  headerActions,
}: AdvancedTableProps<T>) => {
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

  const handleRowClick = (row: Row<T>) => {
    if (onRowClick) {
      onRowClick(row.original);
    }
  };

  const totalPages = table.getPageCount();
  const currentPage = table.getState().pagination.pageIndex + 1;

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <Button
          key={i}
          variant={i === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => table.setPageIndex(i - 1)}
          className={i === currentPage ? "bg-pink-500 hover:bg-pink-600 text-white" : "border-gray-200 text-gray-600 hover:bg-gray-50"}
        >
          {i}
        </Button>
      );
    }
    
    return buttons;
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">{title}</h2>
            <p className="text-xs sm:text-sm text-gray-600">
              {table.getFilteredRowModel().rows.length} of {data.length} records
            </p>
          </div>
          <div className="flex w-full md:w-auto items-center md:justify-end gap-2 md:gap-4 flex-wrap">
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={searchPlaceholder}
                value={globalFilter ?? ""}
                onChange={(e) => {
                  table.setGlobalFilter(e.target.value)
                  setGlobalFilter(e.target.value)
                }}
                className="pl-10 w-full md:w-80 border-gray-200 focus:border-pink-300 focus:ring-pink-200 bg-white shadow-sm"
              />
            </div>
            <Select value={String(table.getState().pagination.pageSize)} onValueChange={(value) => handleItemsPerPageChange(Number(value))}>
              <SelectTrigger className="w-full md:w-32 border-gray-200 bg-white shadow-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200 shadow-lg">
                {itemsPerPageOptions.map((option) => (
                  <SelectItem key={option} value={String(option)} className="hover:bg-pink-50">
                    {option} rows
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {headerActions}
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="relative">
            <div className="absolute inset-0 flex flex-col items-center justify-center h-96 bg-white/90 z-10">
              <LoadingSpinner size={40} />
              <div className="mt-3 text-pink-500 font-medium">Loading...</div>
            </div>
            <Table className="w-full">
              <TableHeader>
                {table.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id} className="border-b border-gray-100">
                    {headerGroup.headers.map(header => (
                      <TableHead key={header.id} className="bg-gray-50">
                        <Skeleton className="h-6 w-full my-1" />
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {[...Array(6)].map((_, idx) => (
                  <TableRow key={idx} className="border-b border-gray-50">
                    {columns.map((col: any, colIdx: number) => (
                      <TableCell key={col.key || colIdx} className="py-4">
                        <Skeleton className="h-6 w-full my-1" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                {table.getHeaderGroups().map(headerGroup => (
                  <React.Fragment key={headerGroup.id}>
                    {/* Main Header Row */}
                    <TableRow className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                      {headerGroup.headers.map(header => (
                        <TableHead 
                          key={header.id} 
                          className="font-semibold text-gray-800 py-3 px-3 sm:px-4 md:px-6 text-left border-r border-gray-200 last:border-r-0"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {header.isPlaceholder ? null : (
                                <>
                                  <span className="text-pink-700 text-sm font-medium">
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                  </span>
                                  {header.column.getCanSort() && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => header.column.toggleSorting(header.column.getIsSorted() === "asc")}
                                      className="h-6 w-6 p-0 hover:bg-pink-100 rounded-full"
                                    >
                                      {header.column.getIsSorted() === "asc" ? (
                                        <ArrowUp className="h-4 w-4 text-pink-600" />
                                      ) : header.column.getIsSorted() === "desc" ? (
                                        <ArrowDown className="h-4 w-4 text-pink-600" />
                                      ) : (
                                        <ChevronDown className="h-4 w-4 text-gray-400" />
                                      )}
                                    </Button>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                    {/* Filter Row */}
                    <TableRow className="bg-white border-b border-gray-100">
                      {headerGroup.headers.map(header => (
                        <TableHead key={`${header.id}-filter`} className="py-2 px-3 sm:px-4 md:px-6 border-r border-gray-100 last:border-r-0">
                          {header.column.getCanFilter() && !header.isPlaceholder ? (
                            <ColumnFilter column={header.column} />
                          ) : null}
                        </TableHead>
                      ))}
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row, index) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      onClick={() => handleRowClick(row)}
                      className={`
                        ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} 
                        ${onRowClick ? "cursor-pointer hover:bg-pink-50" : ""} 
                        border-b border-gray-100 transition-all duration-200 hover:shadow-sm
                      `}
                    >
                      {row.getVisibleCells().map(cell => (
                        <TableCell key={cell.id} className="py-3 px-3 sm:px-4 md:px-6 text-sm text-gray-900 border-r border-gray-100 last:border-r-0">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-32 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="text-gray-400 text-lg">📋</div>
                        <div className="font-medium">No results found</div>
                        <div className="text-sm">Try adjusting your search or filter criteria</div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Pagination Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center text-sm text-gray-600">
            <span className="font-medium">
              Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
              {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} of{' '}
              {table.getFilteredRowModel().rows.length} entries
            </span>
            {globalFilter && (
              <span className="ml-2 text-pink-600">
                (filtered from {data.length} total entries)
              </span>
            )}
          </div>
          
          <div className="flex items-center flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="h-8 w-8 p-0 border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            
            <div className="flex space-x-1">
              {totalPages > 1 && renderPaginationButtons()}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="h-8 w-8 p-0 border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
