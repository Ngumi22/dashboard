import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter } from "./types";
import { Plus } from "lucide-react";

interface TableFiltersProps<T> {
  filters: Filter<T>[];
  activeFilters: Record<string, string[]>;
  onFilter: (key: string, value: string) => void;
  onResetFilters: () => void;
  onAddNew: () => void;
}

export default function TableFilters<T>({
  filters,
  activeFilters,
  onFilter,
  onResetFilters,
  onAddNew,
}: TableFiltersProps<T>) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex-1 space-x-2">
        {filters.map((filter) => (
          <DropdownMenu key={filter.key as string}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">{filter.label}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>{filter.label}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {filter.options.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.value}
                  checked={activeFilters[filter.key as string]?.includes(
                    option.value
                  )}
                  onCheckedChange={() =>
                    onFilter(filter.key as string, option.value)
                  }>
                  {option.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ))}
        <Button variant="outline" onClick={onResetFilters}>
          Reset Filters
        </Button>
      </div>

      <Button onClick={onAddNew}>
        <Plus className="mr-2 h-4 w-4" /> Add New
      </Button>
    </div>
  );
}
