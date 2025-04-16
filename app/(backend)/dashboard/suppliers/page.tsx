"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
import { useSuppliers } from "@/lib/actions/Supplier/queries";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSupplierMutations } from "@/lib/actions/Supplier/hooks";
import SupplierForm from "./form";
import { Supplier } from "@/lib/actions/Supplier/supplierTypes";

export default function SuppliersPage() {
  const { data: allSuppliers = [], isLoading, isError } = useSuppliers();
  const { deleteSupplier } = useSupplierMutations();
  const router = useRouter();
  const { toast } = useToast();
  const [supplierToDelete, setSupplierToDelete] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const handleAddNewSupplier = () => {
    setIsDialogOpen(true);
  };

  const handleEditSupplier = async (supplier: Supplier) => {
    try {
      setEditingSupplier(supplier);
      setIsDialogOpen(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open dialog",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSupplier = async (supplier: Supplier) => {
    try {
      await deleteSupplier(String(supplier.supplier_id));
      toast({
        title: "Success",
        description: "Supplier deleted successfully",
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete supplier",
        variant: "destructive",
      });
    } finally {
      setSupplierToDelete(null);
    }
  };

  const confirmDelete = (supplier: Supplier) => {
    setSupplierToDelete(supplier.supplier_id ?? null);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingSupplier(null); // Reset editing state when dialog closes
  };

  const handleFormSuccess = () => {
    setIsDialogOpen(false);
    setEditingSupplier(null); // Reset editing state on success
    router.refresh(); // Refresh data after successful operation
  };

  // Define supplier-specific actions
  const supplierActions = [
    {
      label: "Actions",
      items: [
        {
          label: "Edit",
          icon: <Pencil className="h-4 w-4" />,
          onClick: handleEditSupplier,
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
  const columns: ColumnDef<Supplier>[] = [
    {
      accessorKey: "supplier_id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Id" />
      ),
      size: 20,
    },
    {
      accessorKey: "supplier_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      size: 40,
    },

    {
      accessorKey: "supplier_email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
      size: 60,
    },
    {
      accessorKey: "supplier_phone_number",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Contact" />
      ),
      size: 40,
    },

    {
      id: "actions",
      cell: ({ row }) => (
        <DataTableRowActions row={row} actions={supplierActions} />
      ),
      size: 60,
    },
  ];

  if (isLoading) return <div>Loading suppliers...</div>;
  if (isError) return <div>Error loading suppliers</div>;

  return (
    <>
      <div className="container mx-auto py-4">
        <div className="flex gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold mb-6">Suppliers</h1>
        </div>

        <DataTable
          columns={columns}
          data={allSuppliers}
          searchKey="supplier_name"
          addNewButton={{
            text: "Add Supplier",
            icon: <Plus className="h-4 w-4" />,
            onClick: handleAddNewSupplier,
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
              {editingSupplier ? "Edit Supplier" : "Add New Supplier"}
            </DialogTitle>
            <DialogDescription>
              {editingSupplier
                ? "Modify the supplier details below."
                : "Create a new supplier."}
            </DialogDescription>
          </DialogHeader>
          <SupplierForm
            initialData={editingSupplier || undefined}
            onClose={handleDialogClose}
            onSuccess={handleFormSuccess}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!supplierToDelete}
        onOpenChange={(open) => !open && setSupplierToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              supplier and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const supplier = allSuppliers.find(
                  (b) => b.supplier_id === supplierToDelete
                );
                if (supplier) handleDeleteSupplier(supplier);
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
