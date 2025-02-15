"use client";
import React, { useState } from "react";
import { Table } from "@/components/ui/table";
import TableHeader from "./table-header";
import TablePagination from "./table-pagination";
import TableRowActions from "./table-row-actions";
import TableFilters from "./table-filters";
import ActiveFilters from "./active-filters";
import { DataTableProps, SortDirection } from "./types";

export default function DataTable<T extends { id: string | number }>({
  data,
  includedKeys,
  filters,
  rowActions,
  onSearch,
  onFilter,
  onResetFilters,
  onSort,
  onPageChange,
  onRowsPerPageChange,
  onRowSelect,
  onAddNew,
  totalItems,
  currentPage,
  rowsPerPage,
  activeFilters,
  onClearFilter,
  columnRenderers,
  noDataMessage = "No data available", // Default message if noDataMessage is not provided
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = (key: keyof T) => {
    const newDirection =
      sortColumn === key && sortDirection === "asc" ? "desc" : "asc";
    setSortColumn(key);
    setSortDirection(newDirection);
    onSort(key, newDirection);
  };

  return (
    <div className="py-4 space-y-4">
      <TableHeader onSearch={onSearch} />
      <TableFilters
        filters={filters}
        activeFilters={activeFilters}
        onFilter={onFilter}
        onResetFilters={onResetFilters}
        onAddNew={onAddNew}
      />
      <ActiveFilters
        activeFilters={activeFilters}
        onClearFilter={onClearFilter}
      />
      <div className="border p-2">
        <Table>
          <thead className="border-b">
            <tr>
              {includedKeys.map((key) => (
                <th
                  key={key as string}
                  className="capitalize"
                  onClick={() => handleSort(key)}>
                  <div className="flex items-center">{String(key)}</div>
                </th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((item) => (
                <tr key={item.id}>
                  {includedKeys.map((key) => (
                    <td key={`${item.id}-${key as string}`}>
                      {columnRenderers && columnRenderers[key]
                        ? columnRenderers[key]!(item)
                        : String(item[key])}
                    </td>
                  ))}
                  <td>
                    <TableRowActions item={item} actions={rowActions} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={includedKeys.length + 1}
                  className="text-center py-4">
                  {noDataMessage}
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
      <TablePagination
        totalItems={totalItems}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
      />
    </div>
  );
}
