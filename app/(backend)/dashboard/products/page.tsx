"use client";
import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/Table/data-table-column-header";
import { DataTableRowActions } from "@/components/Table/data-table-row-actions";
import { DataTable } from "@/components/Table/data-table";
import { Product } from "@/lib/actions/Product/actions/search-params";
import { useProductMutations, useProducts } from "@/lib/actions/Product/hooks";
import Base64Image from "@/components/Data-Table/base64-image";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
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
import { useState } from "react";
import { ArrowLeft, Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ProductsPage() {
  const { data: products = [], isLoading, isError } = useProducts();
  const { deleteProduct } = useProductMutations();
  const router = useRouter();
  const { toast } = useToast();
  const [productToDelete, setProductToDelete] = useState<number | null>(null);

  const handleAddNewProduct = () => {
    router.push("/dashboard/products/create");
  };

  const handleViewProduct = async (product: Product) => {
    try {
      const id = product.id;
      router.push(`/dashboard/products/${id}/product`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to view product details",
        variant: "destructive",
      });
    }
  };

  const handleEditProduct = async (product: Product) => {
    try {
      const id = product.id;
      router.push(`/dashboard/products/${id}/edit`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open edit page",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    try {
      await deleteProduct(product.id);
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });

      // Refresh the data
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    } finally {
      setProductToDelete(null);
    }
  };

  const confirmDelete = (product: Product) => {
    setProductToDelete(product.id);
  };

  // Define product-specific actions
  const productActions = [
    {
      label: "Actions",
      items: [
        {
          label: "View",
          icon: <Eye className="h-4 w-4" />,
          onClick: handleViewProduct,
        },
        {
          label: "Edit",
          icon: <Pencil className="h-4 w-4" />,
          onClick: handleEditProduct,
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
  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "sku",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="SKU" />
      ),
      size: 30,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      size: 80,
    },
    {
      accessorKey: "main_image",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Image" />
      ),
      cell: ({ row }) => {
        const image = String(row.getValue("main_image"));
        return (
          <div className="font-medium">
            <Base64Image src={image} alt={""} width={50} height={50} />
          </div>
        );
      },
      size: 50,
    },
    {
      accessorKey: "price",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Price" />
      ),
      cell: ({ row }) => {
        const amount = Number.parseFloat(row.getValue("price"));
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "Kes",
        }).format(amount);
        return <div className="font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge
            className="capitalize"
            variant={
              status === "approved"
                ? "default"
                : status === "draft"
                  ? "secondary"
                  : status === "pending"
                    ? "outline"
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
      accessorKey: "category_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Category" />
      ),
      size: 40,
    },
    {
      accessorKey: "brand_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Brand" />
      ),
      size: 40,
    },

    {
      id: "actions",
      cell: ({ row }) => (
        <DataTableRowActions row={row} actions={productActions} />
      ),
      size: 60,
    },
  ];

  const filterableColumns = [
    {
      id: "status",
      title: "Status",
      options: [
        { label: "Approved", value: "approved" },
        { label: "Draft", value: "draft" },
        { label: "Pending", value: "pending" },
      ],
    },
  ];

  return (
    <>
      <div className="container mx-auto py-4">
        <div className="flex gap-4">
          <Link href="/dashboard/products">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold mb-6">Products</h1>
        </div>
        <DataTable
          columns={columns}
          data={products}
          searchKey="name"
          filterableColumns={filterableColumns}
          addNewButton={{
            text: "Add Product",
            icon: <Plus className="h-4 w-4" />,
            onClick: handleAddNewProduct,
          }}
        />
      </div>

      <AlertDialog
        open={!!productToDelete}
        onOpenChange={(open) => !open && setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              product and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const product = products.find((p) => p.id === productToDelete);
                if (product) handleDeleteProduct(product);
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
