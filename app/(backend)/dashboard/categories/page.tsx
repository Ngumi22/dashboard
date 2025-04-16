"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import Base64Image from "@/components/Data-Table/base64-image";
import { useToast } from "@/hooks/use-toast";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/Table/data-table-column-header";
import { DataTableRowActions } from "@/components/Table/data-table-row-actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { DataTable } from "@/components/Table/data-table";
import { Category } from "@/lib/actions/Category/catType";
import { useCategories } from "@/lib/actions/Category/queries";
import { useCategoryMutations } from "@/lib/actions/Category/hooks";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CategoryForm from "@/components/Categories/form";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CategoriesPage() {
  const { data: allCategories = [], isLoading, isError } = useCategories();
  const { deleteCategory } = useCategoryMutations();
  const router = useRouter();
  const { toast } = useToast();
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Filter to show only parent categories (those without a parent_category_id)
  const parentCategories = allCategories.filter(
    (category) => !category.parent_category_id
  );

  const handleAddNewCategory = () => {
    setIsDialogOpen(true);
  };

  const handleViewCategory = async (category: Category) => {
    try {
      // Navigate to the subcategories page for this category
      router.push(`/dashboard/categories/${category.category_id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to view category details",
        variant: "destructive",
      });
    }
  };

  const handleEditCategory = async (category: Category) => {
    try {
      setEditingCategory(category);
      setIsDialogOpen(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open dialog",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    try {
      await deleteCategory(category.category_id);
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    } finally {
      setCategoryToDelete(null);
    }
  };

  const confirmDelete = (category: Category) => {
    setCategoryToDelete(category.category_id);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingCategory(null); // Reset editing state when dialog closes
  };

  const handleFormSuccess = () => {
    setIsDialogOpen(false);
    setEditingCategory(null); // Reset editing state on success
    router.refresh(); // Refresh data after successful operation
  };

  // Define category-specific actions
  const categoryActions = [
    {
      label: "Actions",
      items: [
        {
          label: "View Subcategories",
          icon: <Eye className="h-4 w-4" />,
          onClick: handleViewCategory,
        },
        {
          label: "Edit",
          icon: <Pencil className="h-4 w-4" />,
          onClick: handleEditCategory,
        },
        {
          label: "Delete",
          icon: <Trash2 className="h-4 w-4" />,
          onClick: confirmDelete,
          className: "text-destructive focus:text-destructive",
        },
      ],
    },
  ];

  // Columns with customizable actions
  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: "category_id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Id" />
      ),
      size: 80,
    },
    {
      accessorKey: "category_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      size: 80,
    },
    {
      accessorKey: "category_image",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Image" />
      ),
      cell: ({ row }) => {
        const image = String(row.getValue("category_image"));
        return (
          <div className="font-medium">
            <Base64Image src={image} alt={""} width={50} height={50} />
          </div>
        );
      },
      size: 50,
    },
    {
      accessorKey: "category_status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.getValue("category_status") as string;
        return (
          <Badge
            className="capitalize"
            variant={
              status === "active"
                ? "default"
                : status === "inactive"
                  ? "secondary"
                  : "destructive"
            }>
            {status}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DataTableRowActions row={row} actions={categoryActions} />
      ),
      size: 60,
    },
  ];

  const filterableColumns = [
    {
      id: "category_status",
      title: "Status",
      options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ],
    },
  ];

  if (isLoading) return <div>Loading categories...</div>;
  if (isError) return <div>Error loading categories</div>;

  return (
    <>
      <div className="container mx-auto py-4">
        <div className="flex gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold mb-6">Categories</h1>
        </div>

        <DataTable
          columns={columns}
          data={parentCategories}
          searchKey="category_name"
          filterableColumns={filterableColumns}
          addNewButton={{
            text: "Add Category",
            icon: <Plus className="h-4 w-4" />,
            onClick: handleAddNewCategory,
          }}
        />
      </div>
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) handleDialogClose();
          else setIsDialogOpen(open);
        }}>
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
            onCancel={handleDialogClose}
            onSuccess={handleFormSuccess}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!categoryToDelete}
        onOpenChange={(open) => !open && setCategoryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              category and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const category = parentCategories.find(
                  (c) => c.category_id === categoryToDelete
                );
                if (category) handleDeleteCategory(category);
              }}
              className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
