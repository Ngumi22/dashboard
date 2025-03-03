"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Edit, Trash, Eye, Plus } from "lucide-react";
import { Filter, RowAction } from "@/components/Data-Table/types";
import {
  filterData,
  searchData,
  sortData,
} from "@/components/Data-Table/utils";
import DataTable from "@/components/Data-Table/data-table";
import { useStore } from "@/app/store";

export interface Brand {
  brand_id: number;
  brand_name: string;
  brand_image: string;
}

const includedKeys: (keyof Brand)[] = ["brand_id", "brand_name", "brand_image"];

import { useRouter, useParams } from "next/navigation";
import Base64Image from "@/components/Data-Table/base64-image";
import { useToast } from "@/hooks/use-toast";
import { deleteBrandAction } from "@/lib/actions/Brand/delete";

const columnRenderers = {
  brand_image: (brand: Brand) => (
    <Base64Image
      src={brand.brand_image}
      alt={brand.brand_name}
      width={50}
      height={50}
    />
  ),
};

export default function BrandPage() {
  const fetchUniqueBrands = useStore((state) => state.fetchUniqueBrands);
  const brands = useStore((state) => state.brands);
  const loading = useStore((state) => state.loading);
  const error = useStore((state) => state.error);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>(
    {}
  );
  const [sortKey, setSortKey] = useState<keyof Brand>("brand_name");
  const router = useRouter();

  useEffect(() => {
    fetchUniqueBrands(); // Fetch initial page
  }, [fetchUniqueBrands, currentPage]);

  const filters: Filter<any>[] = useMemo(() => [], []);

  const rowActions: RowAction<any>[] = [
    {
      label: "Delete",
      icon: Trash,
      onClick: async (brand) => {
        deleteBrandAction(brand.brand_id);
      },
    },
  ];

  const filteredAndSortedData = useMemo(() => {
    let result = searchData(brands, searchTerm, "brand_name");
    result = filterData(result, filters, activeFilters);
    return result;
  }, [brands, searchTerm, activeFilters, filters]);

  const paginatedData = filteredAndSortedData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleSearch = (query: string) => {
    setSearchTerm(query);
    setCurrentPage(1);
  };

  const handleFilter = (key: string, value: string) => {
    setActiveFilters((prev) => {
      const newFilters = { ...prev };
      if (key === "price" || key === "discount") {
        // For range filters, we only want one active value at a time
        newFilters[key] = [value];
      } else {
        if (newFilters[key]) {
          const index = newFilters[key].indexOf(value);
          if (index > -1) {
            newFilters[key] = newFilters[key].filter((v) => v !== value);
            if (newFilters[key].length === 0) {
              delete newFilters[key];
            }
          } else {
            newFilters[key] = [...newFilters[key], value];
          }
        } else {
          newFilters[key] = [value];
        }
      }
      return newFilters;
    });
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setActiveFilters({});
    setCurrentPage(1);
  };

  const handleSort = (key: string | number | symbol) => {
    if (typeof key === "string" && includedKeys.includes(key as keyof Brand)) {
      setSortKey(key as keyof Brand); // Set sort key safely
    } else {
      console.error("Invalid sort key:", key);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchUniqueBrands(); // Fetch data for the new page
  };

  const handleRowsPerPageChange = (rows: number) => {
    setRowsPerPage(rows);
    setCurrentPage(1);
  };

  const handleRowSelect = (selectedRows: any[]) => {
    console.log("Selected rows:", selectedRows);
  };

  const handleAddNew = () => {
    router.push("/dashboard/brands");
  };

  const handleClearFilter = (key: string, value: string) => {
    const newActiveFilters = { ...activeFilters };
    newActiveFilters[key] = newActiveFilters[key].filter((v) => v !== value);
    if (newActiveFilters[key].length === 0) {
      delete newActiveFilters[key];
    }
    setActiveFilters(newActiveFilters);
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Brand Management</h1>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <DataTable
        data={paginatedData}
        includedKeys={includedKeys}
        filters={filters}
        rowActions={rowActions}
        onSearch={handleSearch}
        onFilter={handleFilter}
        onSort={handleSort}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onRowSelect={handleRowSelect}
        onAddNew={handleAddNew}
        totalItems={filteredAndSortedData.length}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        activeFilters={activeFilters}
        onClearFilter={handleClearFilter}
        onResetFilters={handleResetFilters}
        columnRenderers={columnRenderers}
      />
    </div>
  );
}
