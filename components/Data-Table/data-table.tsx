"use client";

import React, { useState } from "react";
import Image from "next/image"; // Import Image component from Next.js
import { Table } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";
import TableHeader from "./table-header";
import TablePagination from "./table-pagination";
import TableRowActions from "./table-row-actions";
import TableFilters from "./table-filters";
import ActiveFilters from "./active-filters";
import { DataTableProps, SortDirection } from "./types";
import { useRouter } from "next/navigation";

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
}: DataTableProps<T>) {
  const [selectedRows, setSelectedRows] = useState<T[]>([]);
  const [sortColumn, setSortColumn] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const router = useRouter();

  const handleSort = (key: keyof T) => {
    const newDirection =
      sortColumn === key && sortDirection === "asc" ? "desc" : "asc";
    setSortColumn(key);
    setSortDirection(newDirection);
    onSort(key, newDirection);
  };

  const handleRowSelect = (item: T) => {
    const newSelectedRows = selectedRows.includes(item)
      ? selectedRows.filter((row) => row !== item)
      : [...selectedRows, item];
    setSelectedRows(newSelectedRows);
    onRowSelect(newSelectedRows);
  };

  const handleSelectAll = () => {
    const newSelectedRows =
      selectedRows.length === data.length ? [] : [...data];
    setSelectedRows(newSelectedRows);
    onRowSelect(newSelectedRows);
  };

  const handleAddNew = () => {
    router.push("/dashboard/products/create");
  };

  return (
    <div className="space-y-4">
      <TableHeader onSearch={onSearch} onAddNew={handleAddNew} />
      <TableFilters
        filters={filters}
        activeFilters={activeFilters}
        onFilter={onFilter}
        onResetFilters={onResetFilters}
      />
      <ActiveFilters
        activeFilters={activeFilters}
        onClearFilter={onClearFilter}
      />
      <div className="rounded-md border">
        <Table>
          <thead>
            <tr>
              <th className="w-[40px]">
                <Checkbox
                  checked={selectedRows.length === data.length}
                  onCheckedChange={handleSelectAll}
                />
              </th>
              {includedKeys.map((key) => (
                <th
                  key={key as string}
                  className="cursor-pointer"
                  onClick={() => handleSort(key)}>
                  <div className="flex items-center">
                    {String(key)}
                    <Button variant="ghost" size="sm" className="ml-2">
                      {sortColumn === key ? (
                        sortDirection === "asc" ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )
                      ) : (
                        <ChevronUp className="h-4 w-4 opacity-0" />
                      )}
                    </Button>
                  </div>
                </th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id}>
                <td>
                  <Checkbox
                    checked={selectedRows.includes(item)}
                    onCheckedChange={() => handleRowSelect(item)}
                  />
                </td>
                {includedKeys.map((key) => (
                  <td key={key as string}>
                    {columnRenderers && columnRenderers[key]
                      ? columnRenderers[key]!(item)
                      : String(item[key])}
                  </td>
                ))}

                <td>
                  <TableRowActions item={item} actions={rowActions} />
                </td>
              </tr>
            ))}
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
