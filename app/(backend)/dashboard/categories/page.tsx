"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Edit, Trash, Eye, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Category, Filter, RowAction } from "@/components/Data-Table/types";
import { filterData, searchData } from "@/components/Data-Table/utils";
import DataTable from "@/components/Data-Table/data-table";
import { useStore } from "@/app/store";
import Image from "next/image";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useRouter, useParams } from "next/navigation";
import Base64Image from "@/components/Data-Table/base64-image";
import { useToast } from "@/hooks/use-toast";
import CategoryForm from "@/components/Categories/form";
import { Button } from "@/components/ui/button";
import { deleteCategory } from "@/lib/actions/Category/delete";

const includedKeys: (keyof Category)[] = [
  "category_id",
  "category_name",
  "category_image",
  "category_description",
  "category_status",
];

const columnRenderers = {
  category_image: (category: Category) => (
    <Base64Image
      src={category.category_image}
      alt={category.category_name}
      width={50}
      height={50}
    />
  ),
  status: (category: { status: string }) => (
    <Badge
      variant={
        category.status === "Active"
          ? "default"
          : category.status === "Inactive"
          ? "secondary"
          : "destructive"
      }>
      {category.status.charAt(0).toUpperCase() + category.status.slice(1)}
    </Badge>
  ),
};

export default function CategoriesPage() {
  const fetchUniqueCategories = useStore(
    (state) => state.fetchUniqueCategories
  );
  const categories = useStore((state) => state.categories);
  // const deleteCategory = useStore((state) => state.deleteCategoryState);
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
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] =
    useState<keyof Category>("category_id");
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchUniqueCategories(); // Fetch initial page
  }, [fetchUniqueCategories, currentPage]);

  const filters: Filter<any>[] = useMemo(
    () => [
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
    []
  );

  const rowActions: RowAction<any>[] = [
    {
      label: "Edit",
      icon: Edit,
      onClick: (category) => {
        setEditingCategory(category);
        setIsDialogOpen(true);
      },
    },
    {
      label: "Delete",
      icon: Trash,
      onClick: async (category) => {
        const confirmDelete = window.confirm(
          `Are you sure you want to delete the category "${category.category_name}"?`
        );
        if (!confirmDelete) return;

        try {
          const response = await deleteCategory(category.category_id);
          if (response.success) {
            toast({ title: "Success", description: response.message });
            fetchUniqueCategories(); // Refresh the data
          } else {
            toast({ title: "Error", description: response.error });
          }
        } catch (error) {
          console.error(error);
          toast({
            title: "Error",
            description: "An error occurred while deleting the category.",
          });
        }
      },
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
    setIsDialogOpen(true);
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
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error</p>
      ) : (
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
          columnRenderers={columnRenderers} // Updated
        />
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[40rem]">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Add New Category"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? "Modify the category details below."
                : "Create a new category."}
            </DialogDescription>
          </DialogHeader>
          <CategoryForm
            initialData={editingCategory || undefined}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
