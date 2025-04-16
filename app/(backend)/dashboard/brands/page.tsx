"use client";

import React, { useState } from "react";
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
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
import { DataTable } from "@/components/Table/data-table";
import { useBrands } from "@/lib/actions/Brand/queries";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Brand } from "@/lib/actions/Brand/brandType";
import { useBrandMutations } from "@/lib/actions/Brand/hooks";
import BrandForm from "./form";

export default function BrandsPage() {
  const { data: allBrands = [], isLoading, isError } = useBrands();
  const { deleteBrand } = useBrandMutations();
  const router = useRouter();
  const { toast } = useToast();
  const [brandToDelete, setBrandToDelete] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  const handleAddNewBrand = () => {
    setIsDialogOpen(true);
  };

  const handleEditBrand = async (brand: Brand) => {
    try {
      setEditingBrand(brand);
      setIsDialogOpen(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open dialog",
        variant: "destructive",
      });
    }
  };

  const handleDeleteBrand = async (brand: Brand) => {
    try {
      await deleteBrand(brand.brand_id);
      toast({
        title: "Success",
        description: "Brand deleted successfully",
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete brand",
        variant: "destructive",
      });
    } finally {
      setBrandToDelete(null);
    }
  };

  const confirmDelete = (brand: Brand) => {
    setBrandToDelete(brand.brand_id);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingBrand(null); // Reset editing state when dialog closes
  };

  const handleFormSuccess = () => {
    setIsDialogOpen(false);
    setEditingBrand(null); // Reset editing state on success
    router.refresh(); // Refresh data after successful operation
  };

  // Define brand-specific actions
  const brandActions = [
    {
      label: "Actions",
      items: [
        {
          label: "Edit",
          icon: <Pencil className="h-4 w-4" />,
          onClick: handleEditBrand,
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
  const columns: ColumnDef<Brand>[] = [
    {
      accessorKey: "brand_id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Id" />
      ),
      size: 80,
    },
    {
      accessorKey: "brand_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      size: 80,
    },
    {
      accessorKey: "brand_image",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Image" />
      ),
      cell: ({ row }) => {
        const image = String(row.getValue("brand_image"));
        return (
          <div className="font-medium">
            <Base64Image src={image} alt={""} width={50} height={50} />
          </div>
        );
      },
      size: 50,
    },

    {
      id: "actions",
      cell: ({ row }) => (
        <DataTableRowActions row={row} actions={brandActions} />
      ),
      size: 60,
    },
  ];

  if (isLoading) return <div>Loading brands...</div>;
  if (isError) return <div>Error loading brands</div>;

  return (
    <>
      <div className="container mx-auto py-4">
        <div className="flex gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold mb-6">Brands</h1>
        </div>

        <DataTable
          columns={columns}
          data={allBrands}
          searchKey="brand_name"
          addNewButton={{
            text: "Add Brand",
            icon: <Plus className="h-4 w-4" />,
            onClick: handleAddNewBrand,
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
              {editingBrand ? "Edit Brand" : "Add New Brand"}
            </DialogTitle>
            <DialogDescription>
              {editingBrand
                ? "Modify the brand details below."
                : "Create a new brand."}
            </DialogDescription>
          </DialogHeader>
          <BrandForm
            initialData={editingBrand || undefined}
            onClose={handleDialogClose}
            onSuccess={handleFormSuccess}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!brandToDelete}
        onOpenChange={(open) => !open && setBrandToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              brand and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const brand = allBrands.find(
                  (b) => b.brand_id === brandToDelete
                );
                if (brand) handleDeleteBrand(brand);
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
