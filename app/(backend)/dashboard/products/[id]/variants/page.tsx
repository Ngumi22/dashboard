"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Edit, Trash, Eye, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Filter, RowAction } from "@/components/Data-Table/types";
import { filterData, searchData } from "@/components/Data-Table/utils";
import DataTable from "@/components/Data-Table/data-table";
import { useStore } from "@/app/store";

import { useParams, useRouter } from "next/navigation";
import Base64Image from "@/components/Data-Table/base64-image";
import { useToast } from "@/hooks/use-toast";
import { VariantForm } from "@/components/Product/Variants/variant-form";
import { fetchVariantById } from "@/lib/actions/Variants/fetch";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Variant } from "@/lib/actions/Variants/types";

const includedKeys: (keyof Variant)[] = [
  "variant_id",
  "product_id",
  "specifications",
  "variant_price",
  "variant_quantity",
  "variant_status",
  "images",
];

const columnRenderers = {
  images: (variant: Variant) => (
    <div className="flex gap-2">
      {variant.images?.map((image, index) => (
        <Base64Image
          key={index}
          src={image.imageData}
          alt={`Variant ${variant.specifications[0]?.variantValue}`}
          width={50}
          height={50}
        />
      ))}
    </div>
  ),
  variant_status: (variant: { variant_status: string }) => (
    <Badge
      variant={
        variant.variant_status === "active"
          ? "default"
          : variant.variant_status === "inactive"
          ? "secondary"
          : "destructive"
      }>
      {variant.variant_status.charAt(0).toUpperCase() +
        variant.variant_status.slice(1)}
    </Badge>
  ),
};

export default function VariantsPage() {
  const params = useParams();
  const productId = Array.isArray(params.id) ? params.id[0] : params.id;

  const fetchVariantsByProductId = useStore(
    (state) => state.fetchVariantsState
  );
  const variants = useStore((state) => state.variants);
  const loading = useStore((state) => state.loading);
  const error = useStore((state) => state.error);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>(
    {}
  );
  const [sortKey, setSortKey] = useState<keyof Variant>("variant_id");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);
  const [deletingVariant, setDeletingVariant] = useState<number | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (productId) {
      fetchVariantsByProductId(Number(productId));
    }
  }, [productId, fetchVariantsByProductId, currentPage]);

  // Dynamically generate variant options for filters
  const variantOptions = useMemo(() => {
    const uniqueValues = new Set(
      variants.map(
        (variant: Variant) => variant.specifications[0]?.variantValue
      )
    );
    return Array.from(uniqueValues).map((value) => ({
      value: value || "",
      label: value || "",
    }));
  }, [variants]);

  const filters: Filter<any>[] = useMemo(
    () => [
      {
        key: "specifications",
        label: "Specifications",
        type: "select",
        options: variantOptions,
      },
      {
        key: "variant_status",
        label: "Status",
        type: "select",
        options: [
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
        ],
      },
    ],
    [variantOptions]
  );

  const handleDeleteVariant = async (variant_id: number | null) => {
    if (!variant_id) {
      alert("No variant ID provided.");
      return;
    }
    // Add your delete logic here
  };

  const handleViewVariant = async (variant_id: number | null) => {
    if (!variant_id) {
      alert("No variant ID provided.");
      return;
    }

    const result = fetchVariantById(variant_id);
    if (result == result) {
      router.push(`/dashboard/products/${productId}/variants/${variant_id}`);
    } else {
      throw new Error("Failed to fetch variant.");
    }
  };

  const rowActions: RowAction<any>[] = [
    {
      label: "View",
      icon: Eye,
      onClick: (variant) => {
        handleViewVariant(variant.variant_id);
      },
    },
    {
      label: "Edit",
      icon: Edit,
      onClick: (variant) => {
        setEditingVariant(variant);
        setIsDialogOpen(true);
      },
    },
    {
      label: "Delete",
      icon: Trash,
      onClick: (variant) => {
        setDeletingVariant(variant.variant_id);
        setIsAlertDialogOpen(true);
      },
    },
  ];

  const filteredAndSortedData = useMemo(() => {
    let result = variants;
    result = searchData(result, searchTerm, "specifications");
    result = filterData(result, filters, activeFilters);
    return result;
  }, [variants, searchTerm, activeFilters, filters]);

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
      includedKeys.includes(key as keyof Variant)
    ) {
      setSortKey(key as keyof Variant);
    } else {
      console.error("Invalid sort key:", key);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchVariantsByProductId(Number(productId));
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
          columnRenderers={columnRenderers}
        />
      )}

      <Drawer open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              {editingVariant ? "Edit Variant" : "Add New Variant"}
            </DrawerTitle>
            <DrawerDescription>
              {editingVariant
                ? "Update the details of an existing variant."
                : "Fill in the details to create a new product variant."}
            </DrawerDescription>
          </DrawerHeader>
          <VariantForm
            productId={productId}
            variantId={editingVariant?.variant_id}
          />
        </DrawerContent>
      </Drawer>
    </div>
  );
}
