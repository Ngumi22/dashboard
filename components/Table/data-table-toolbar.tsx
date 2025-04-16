"use client";

import type { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { X } from "lucide-react";
import { DataTableViewOptions } from "./data-table-view-options";
import type { ReactNode } from "react";

interface AddNewButtonProps {
  text: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
}

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  searchKey?: string;
  filterableColumns?: {
    id: string;
    title: string;
    options: {
      label: string;
      value: string;
    }[];
  }[];
  addNewButton?: AddNewButtonProps;
}

export function DataTableToolbar<TData>({
  table,
  searchKey,
  filterableColumns = [],
  addNewButton,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {searchKey && (
          <Input
            placeholder={`Search...`}
            value={
              (table.getColumn(searchKey)?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn(searchKey)?.setFilterValue(event.target.value)
            }
            className="h-9 w-full sm:max-w-[250px]"
          />
        )}
        {filterableColumns.length > 0 &&
          filterableColumns.map(
            (column) =>
              table.getColumn(column.id) && (
                <DataTableFacetedFilter
                  key={column.id}
                  column={table.getColumn(column.id)}
                  title={column.title}
                  options={column.options}
                />
              )
          )}

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-9 px-2 lg:px-3">
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <DataTableViewOptions table={table} />
        {addNewButton && (
          <Button
            variant={addNewButton.variant || "default"}
            onClick={addNewButton.onClick}>
            {addNewButton.icon && (
              <span className="mr-2">{addNewButton.icon}</span>
            )}
            {addNewButton.text}
          </Button>
        )}
      </div>
    </div>
  );
}
