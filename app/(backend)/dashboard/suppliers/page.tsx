"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Edit, Trash, Eye, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Filter, Product, RowAction } from "@/components/Data-Table/types";
import {
  filterData,
  searchData,
  sortData,
} from "@/components/Data-Table/utils";
import DataTable from "@/components/Data-Table/data-table";
import { useStore } from "@/app/store";

export interface Supplier {
  supplier_id?: number;
  supplier_name?: string;
  supplier_email?: string;
  supplier_phone_number?: string;
  supplier_location?: string;
  isNew?: boolean;
}

const includedKeys: (keyof Supplier)[] = [
  "supplier_id",
  "supplier_name",
  "supplier_email",
  "supplier_phone_number",
  "supplier_location",
  "isNew",
];

import { useRouter, useParams } from "next/navigation";
import Base64Image from "@/components/Data-Table/base64-image";
import { useToast } from "@/hooks/use-toast";

const columnRenderers = {
  isNew: (item: { isNew: string }) => (
    <Badge
      variant={
        item.isNew === "True"
          ? "default"
          : item.isNew === "False"
          ? "secondary"
          : "destructive"
      }>
      {item.isNew
        ? item.isNew.charAt(0).toUpperCase() + item.isNew.slice(1)
        : "New"}
    </Badge>
  ),
};

export default function Home() {
  const fetchUniqueSuppliers = useStore((state) => state.fetchUniqueSuppliers);
  const suppliers = useStore((state) => state.suppliers);
  const loading = useStore((state) => state.loading);
  const error = useStore((state) => state.error);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>(
    {}
  );
  const [sortKey, setSortKey] = useState<keyof Supplier>("supplier_name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchUniqueSuppliers();
  }, [fetchUniqueSuppliers, currentPage]);

  // Dynamically generate category supplier_name from the products data
  const supplierOptions = useMemo(() => {
    const uniqueSuppliers = new Set(
      suppliers.map((supplier) => supplier.supplier_name)
    );
    return Array.from(uniqueSuppliers).map((supplier) => ({
      value: supplier || "",
      label: supplier || "",
    }));
  }, [suppliers]);

  const filters: Filter<any>[] = useMemo(
    () => [
      {
        key: "category",
        label: "Supplier",
        type: "select",
        options: supplierOptions, // Dynamically populated suppliers
      },
      {
        key: "inNew",
        label: "IsNew",
        type: "select",
        options: [
          { value: "true", label: "True" },
          { value: "false", label: "false" },
        ],
      },
    ],
    [supplierOptions]
  );

  const rowActions: RowAction<any>[] = [
    {
      label: "Edit",
      icon: Edit,
      onClick: (category) => {
        // Navigate to the edit page
        router.push(`/dashboard/suppliers/${category.supplier_id}/edit`);
      },
    },
    {
      label: "Delete",
      icon: Trash,
      onClick: async (category) => {},
    },
    {
      label: "View",
      icon: Eye,
      onClick: (category) => {
        router.push(`/dashboard/suppliers/${category.supplier_id}/category`);
      },
    },
  ];

  const filteredAndSortedData = useMemo(() => {
    let result = searchData(suppliers, searchTerm, "supplier_name");
    result = filterData(result, filters, activeFilters);
    return result;
  }, [suppliers, searchTerm, activeFilters, sortKey, sortDirection, filters]);

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
    if (
      typeof key === "string" &&
      includedKeys.includes(key as keyof Supplier)
    ) {
      setSortKey(key as keyof Supplier); // Set sort key safely
    } else {
      console.error("Invalid sort key:", key);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchUniqueSuppliers(); // Fetch data for the new page
  };

  const handleRowsPerPageChange = (rows: number) => {
    setRowsPerPage(rows);
    setCurrentPage(1);
  };

  const handleRowSelect = (selectedRows: any[]) => {
    console.log("Selected rows:", selectedRows);
  };

  const handleAddNew = () => {
    router.push("/dashboard/products/create");
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
      <h1 className="text-2xl font-bold mb-4">Suppliers Management</h1>
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
