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
import {
  useCategories,
  useSubCategoriesWithCatId,
} from "@/lib/actions/Category/queries";
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

export default function SubCategoriesPage({
  params,
}: {
  params: { id: number };
}) {
  const router = useRouter();
  const { toast } = useToast();

  // This should directly fetch only the immediate subcategories
  const {
    data: subCategories = [],
    isLoading,
    isError,
  } = useSubCategoriesWithCatId(params.id);

  const { deleteCategory } = useCategoryMutations();

  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleAddNewCategory = () => setIsDialogOpen(true);

  const handleViewCategory = (category: Category) => {
    router.push(`/dashboard/categories/${category.category_id}/category`);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsDialogOpen(true);
  };

  const handleDeleteCategory = async (category: Category) => {
    try {
      await deleteCategory(category.category_id);
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
      router.refresh();
    } catch {
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

  const categoryActions = [
    {
      label: "Actions",
      items: [
        {
          label: "View",
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

  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: "category_id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ID" />
      ),
      size: 80,
    },
    {
      accessorKey: "category_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
    },
    {
      accessorKey: "category_image",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Image" />
      ),
      cell: ({ row }) => {
        const image = String(row.getValue("category_image"));
        return (
          <Base64Image src={image} alt="Category" width={50} height={50} />
        );
      },
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
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DataTableRowActions row={row} actions={categoryActions} />
      ),
    },
  ];

  return (
    <>
      <div className="container mx-auto py-4">
        <div className="flex gap-4 items-center mb-6">
          <Link href="/dashboard/categories">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <DataTable
          columns={columns}
          data={subCategories}
          searchKey="category_name"
          filterableColumns={[
            {
              id: "category_status",
              title: "Status",
              options: [
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
              ],
            },
          ]}
          addNewButton={{
            text: "Add Subcategory",
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
              This will permanently delete the category and all its
              subcategories.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const cat = subCategories.find(
                  (c) => c.category_id === categoryToDelete
                );
                if (cat) handleDeleteCategory(cat);
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
