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

interface Category {
  category_id: number;
  category_name: string;
  category_image: string;
  category_description: string;
  status: "active" | "inactive";
}

const includedKeys: (keyof Category)[] = [
  "category_id",
  "category_name",
  "category_image",
  "category_description",
  "status",
];

import { useRouter, useParams } from "next/navigation";
import Base64Image from "@/components/Data-Table/base64-image";
import { useToast } from "@/hooks/use-toast";

const columnRenderers = {
  status: (item: { status: string }) => (
    <Badge
      variant={
        item.status === "active"
          ? "default"
          : item.status === "inactive"
          ? "secondary"
          : "destructive"
      }>
      {item.status
        ? item.status.charAt(0).toUpperCase() + item.status.slice(1)
        : "Unknown"}
    </Badge>
  ),

  images: (item: Category) =>
    item.category_image && item.category_image ? (
      <Base64Image
        src={item.category_image}
        alt={item.category_name}
        width={50}
        height={50}
      />
    ) : (
      <span>No image</span>
    ),
};

export default function Home() {
  const fetchUniqueCategories = useStore(
    (state) => state.fetchUniqueCategories
  );
  const categories = useStore((state) => state.categories);
  const loading = useStore((state) => state.loading);
  const error = useStore((state) => state.error);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>(
    {}
  );
  const [sortKey, setSortKey] = useState<keyof Category>("category_name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchUniqueCategories(); // Fetch initial page
  }, [fetchUniqueCategories, currentPage]);

  // Dynamically generate category category_name from the products data
  const categoryOptions = useMemo(() => {
    const uniqueCategories = new Set(
      categories.map((category) => category.category_name)
    );
    return Array.from(uniqueCategories).map((category) => ({
      value: category,
      label: category,
    }));
  }, [categories]);

  const filters: Filter<any>[] = useMemo(
    () => [
      {
        key: "category",
        label: "Category",
        type: "select",
        options: categoryOptions, // Dynamically populated categories
      },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
        ],
      },
    ],
    [categoryOptions]
  );

  const rowActions: RowAction<any>[] = [
    {
      label: "Edit",
      icon: Edit,
      onClick: (category) => {
        // Navigate to the edit page
        router.push(`/dashboard/categories/${category.category_id}/edit`);
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
        router.push(`/dashboard/categories/${category.category_id}/category`);
      },
    },
  ];

  const filteredAndSortedData = useMemo(() => {
    let result = searchData(categories, searchTerm, "category_name");
    result = filterData(result, filters, activeFilters);
    return result;
  }, [categories, searchTerm, activeFilters, sortKey, sortDirection, filters]);

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
      includedKeys.includes(key as keyof Category)
    ) {
      setSortKey(key as keyof Category); // Set sort key safely
    } else {
      console.error("Invalid sort key:", key);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchUniqueCategories(); // Fetch data for the new page
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
      <h1 className="text-2xl font-bold mb-4">Customers Management</h1>
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
