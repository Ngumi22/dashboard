"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Edit, Trash, Eye, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Filter, RowAction } from "@/components/Data-Table/types";
import {
  filterData,
  searchData,
  sortData,
} from "@/components/Data-Table/utils";
import DataTable from "@/components/Data-Table/data-table";
import { useStore } from "@/app/store";

import { useRouter } from "next/navigation";
import Base64Image from "@/components/Data-Table/base64-image";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@/lib/actions/Product/productTypes";
import { handleDeleteAction } from "@/lib/actions/Product/delete";
import { fetchProductById } from "@/lib/actions/Product/fetchById";

const includedKeys: (keyof Product)[] = [
  "sku",
  "name",
  "images",
  "category",
  "quantity",
  "status",
  "price",
  "discount",
];

const columnRenderers = {
  status: (item: { status: string }) => (
    <Badge
      variant={
        item.status === "approved"
          ? "default"
          : item.status === "pending"
          ? "secondary"
          : "destructive"
      }>
      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
    </Badge>
  ),

  images: (item: Product) =>
    item.images && item.images.mainImage ? (
      <Base64Image
        src={item.images.mainImage}
        alt={item.name}
        width={50}
        height={50}
      />
    ) : (
      <span>No image</span>
    ),

  discount: (item: { discount: any }) => `${item.discount}%`,
};

export default function ProductsPage() {
  const [deletingProduct, setDeletingProduct] = useState<string | null>(null);
  const fetchProducts = useStore((state) => state.fetchProductsState);

  const products = useStore((state) => state.products);
  const loading = useStore((state) => state.loading);
  const error = useStore((state) => state.error);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>(
    {}
  );
  const [sortKey, setSortKey] = useState<keyof Product>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchProducts(currentPage, {}); // Fetch initial page
  }, [fetchProducts, currentPage]);

  // Dynamically generate category options from the products data
  const categoryOptions = useMemo(() => {
    const uniqueCategories = new Set(
      products.map((product) => product.category)
    );
    return Array.from(uniqueCategories).map((category) => ({
      value: category,
      label: category,
    }));
  }, [products]);

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
          { value: "draft", label: "Draft" },
          { value: "pending", label: "Pending" },
          { value: "approved", label: "Approved" },
        ],
      },
      {
        key: "price",
        label: "Price",
        type: "range",
        options: [
          { value: "lowest", label: "Lowest to Highest" },
          { value: "highest", label: "Highest to Lowest" },
        ],
      },
      {
        key: "discount",
        label: "Discount",
        type: "range",
        options: [
          { value: "lowest", label: "Lowest to Highest" },
          { value: "highest", label: "Highest to Lowest" },
        ],
      },
    ],
    [categoryOptions]
  );

  const handleViewProduct = async (product_id: number) => {
    if (!product_id) {
      alert("No product ID provided.");
      return;
    }

    const result = fetchProductById(product_id);
    if (result == result) {
      router.push(`/dashboard/products/${product_id}/product`);
    } else {
      throw new Error("Failed to open page.");
    }
  };

  const handleEditProduct = async (product_id: number) => {
    if (!product_id) {
      alert("No product ID provided.");
      return;
    }

    const result = fetchProductById(product_id);
    if (result == result) {
      router.push(`/dashboard/products/${product_id}/edit`);
    } else {
      throw new Error("Failed to open page.");
    }
  };

  const handleAddVariant = async (product_id: string) => {
    if (!product_id) {
      alert("No product ID provided.");
      return;
    }

    const result = await handleDeleteAction(Number(product_id)); // Ensure this is an async call
    if (result == result) {
      router.push(`/dashboard/products/${product_id}/addVariants`);
    } else {
      throw new Error("Failed to open page.");
    }
  };

  const handleDeleteProduct = async (product_id: string) => {
    if (!product_id) {
      alert("No product ID provided.");
      return;
    }

    setDeletingProduct(product_id); // Track the product being deleted

    try {
      const result = await handleDeleteAction(Number(product_id)); // Ensure this is an async call
      if (result) {
        toast({
          title: "Success",
          description: "Product deleted successfully.",
        });
        fetchProducts(currentPage, {}); // Refresh data
      } else {
        throw new Error("Failed to delete product.");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "An error occurred while deleting the product.",
      });
    } finally {
      setDeletingProduct(null); // Reset the deleting state
    }
  };

  const rowActions: RowAction<any>[] = [
    {
      label: "View",
      icon: Eye,
      onClick: (product) => {
        handleViewProduct(product.product_id); // Extract and set only the `product_id`
      },
    },
    {
      label: "Edit",
      icon: Edit,
      onClick: (product) => {
        handleEditProduct(product.product_id);
      },
    },
    {
      label: "Variant",
      icon: Plus,

      onClick: (product) => {
        handleAddVariant(product.product_id);
      },
    },
    {
      label: "Delete",
      icon: Trash,
      onClick: (product) => {
        handleDeleteProduct(product.product_id); // Pass only the `product_id`
      },
      disabled: (product: { product_id: string | null }) =>
        deletingProduct === product.product_id, // Disable while deleting
    },
  ];

  const filteredAndSortedData = useMemo(() => {
    let result = searchData(products, searchTerm, "name");

    result = filterData(result, filters, activeFilters);

    // Handle range sorting for price, quantity, and discount dynamically
    const numericFilters: (keyof Product)[] = ["price", "quantity", "discount"];

    for (const key of numericFilters) {
      if (activeFilters[key] && activeFilters[key].length > 0) {
        const direction = activeFilters[key][0] === "lowest" ? "asc" : "desc";
        result = sortData(result, key, direction);
      }
    }

    // Fallback to normal sorting if no numeric filter is active
    if (!numericFilters.some((key) => activeFilters[key]?.length > 0)) {
      result = sortData(result, sortKey, sortDirection);
    }

    return result;
  }, [products, searchTerm, activeFilters, sortKey, sortDirection, filters]);

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
      includedKeys.includes(key as keyof Product)
    ) {
      setSortKey(key as keyof Product); // Set sort key safely
    } else {
      console.error("Invalid sort key:", key);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchProducts(page, {}); // Fetch data for the new page
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
          columnRenderers={columnRenderers}
        />
      )}
    </div>
  );
}
