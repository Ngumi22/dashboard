"use client";
import Image from "next/image";

import React, { useState, useEffect } from "react";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import {
  File,
  ListFilter,
  MoreHorizontal,
  PlusCircle,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { handleDeleteAction } from "@/lib/actions/Product/delete";

interface ProductResponse {
  id: string | number;
  name: string;
  sku: string;
  price: number;
  discount: number;
  quantity: number;
  category: string;
  status: "approved" | "draft" | "pending";
  description: string;
  brand: string;
  createdAt: string;
  updatedAt: string;
  images: {
    mainImage: string | null;
    thumbnails: (string | null)[];
  };
  tags: string[];
}

export default function ProductsList() {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [brand, setBrand] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null); // For min and max price
  const [discount, setDiscount] = useState<[number, number] | null>(null); // For min and max discount
  const [supplier, setSupplier] = useState<string | null>(null);

  const { toast } = useToast();
  const [pagination, setPagination] = useState<{
    limit: number;
    offset: number;
  }>({
    limit: 10,
    offset: 0,
  });

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Construct API URL with pagination, search, and filters
        let url = `/api/productss?page=${
          pagination.offset / pagination.limit + 1
        }`;

        if (searchTerm) url += `&name=${encodeURIComponent(searchTerm)}`;
        if (activeTab !== "all") url += `&status=${activeTab}`;
        if (brand) url += `&brand=${encodeURIComponent(brand)}`;
        if (category) url += `&category=${encodeURIComponent(category)}`;
        if (priceRange) {
          url += `&minPrice=${priceRange[0]}&maxPrice=${priceRange[1]}`;
        }
        if (discount) {
          url += `&minDiscount=${discount[0]}&maxDiscount=${discount[1]}`;
        }
        if (supplier) url += `&supplier=${encodeURIComponent(supplier)}`;

        const res = await fetch(url);

        if (!res.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await res.json();
        setProducts(data.products); // Set the products array
        // Handle filter options (uniqueTags, uniqueCategories, uniqueBrands) if needed
      } catch (err) {
        console.error(err);
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred";
        setError(errorMessage);
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage,
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [
    pagination,
    searchTerm,
    activeTab,
    brand,
    category,
    priceRange,
    discount,
    supplier,
    toast,
  ]);

  const handleDelete = async (productId: number) => {
    try {
      // Perform the deletion action on the server
      await handleDeleteAction(productId);

      // Optionally, reset pagination, search, or other state variables to trigger re-fetch
      setPagination({ offset: 0, limit: pagination.limit }); // Reset to the first page
      setSearchTerm(""); // Clear search term if needed (or keep it as is)
      setActiveTab("all"); // Reset active tab (optional)

      // Show success toast
      toast({
        variant: "destructive",
        title: "Product Deleted",
        description: "Product deleted successfully.",
      });
    } catch (err) {
      console.error(err);

      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";

      // Show error toast
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPagination({ limit: 10, offset: 0 }); // Reset pagination when searching
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setPagination({ limit: 10, offset: 0 }); // Reset pagination when tab changes
  };

  return (
    <div className="py-8 sm:px-8 flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-0 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <Breadcrumb className="hidden md:flex">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard/products">Products</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="relative ml-auto flex-1 md:grow-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </header>
      <main className="grid grid-flow-row flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <Tabs defaultValue="all" onValueChange={handleTabChange}>
          <div className="flex items-center">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="draft">Draft</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
            </TabsList>
            <div className="ml-auto flex items-center gap-2 my-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1">
                    <ListFilter className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                      Filter
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                {/* Dropdown menu content */}
              </DropdownMenu>

              {/* Add Product link */}
              <Link href="/dashboard/products/create">
                <Button size="sm" className="h-8 gap-1">
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Add Product
                  </span>
                </Button>
              </Link>
            </div>
          </div>
          {/* TabsContent for different states */}
          {/* Example for 'all' state */}
          <TabsContent value={activeTab}>
            <ProductTable
              products={products}
              handleDelete={handleDelete}
              loading={loading}
              error={error}
            />
          </TabsContent>
          {/* Repeat TabsContent for other states as needed */}
        </Tabs>
        {/* Pagination buttons */}
        <div className="flex justify-end mt-4">
          {pagination.offset > 0 && (
            <button
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  offset: prev.offset - prev.limit,
                }))
              }
              className="px-3 py-1 mr-2 bg-green-400 hover:bg-gray-300 rounded-md">
              Previous
            </button>
          )}
          {products.length === pagination.limit && (
            <button
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  offset: prev.offset + prev.limit,
                }))
              }
              className="px-3 py-1 bg-green-400 hover:bg-gray-300 rounded-md">
              Next
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

type ProductTableProps = {
  products: ProductResponse[];
  handleDelete: (productId: number) => void;
  loading: boolean;
  error: string | null;
};

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  handleDelete,
  loading,
  error,
}) => {
  if (loading) {
    return <div>Loading....</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (products.length === 0) {
    return <div className="my-2">No products found.</div>;
  }

  return (
    <Table>
      {/* Table headers */}
      <TableHeader>
        <TableRow>
          <TableHead>SKU</TableHead>
          <TableHead className="hidden sm:table-cell">Image</TableHead>
          <TableHead>Name</TableHead>
          <TableHead className="hidden sm:table-cell">Brand</TableHead>
          <TableHead className="hidden sm:table-cell">Category</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Stock</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      {/* Table body */}
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id}>
            {/* Table cells for product data */}
            <TableCell>{product.sku}</TableCell>
            <TableCell className="hidden sm:table-cell">
              <Image
                src={`data:image/jpeg;base64,${product.images.mainImage}`}
                alt={product.name}
                width={40}
                height={40}
                className="aspect-square rounded-md object-cover"
                loading="lazy"
              />
            </TableCell>
            <TableCell>
              <Link href={`/dashboard/productss/${product.id}`}>
                {product.name}
              </Link>
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              {product.brand}
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              {product.category}
            </TableCell>
            <TableCell>{product.price}</TableCell>
            <TableCell>{product.quantity}</TableCell>
            <TableCell>
              {/* Badge component for status */}
              <Badge
                variant={
                  product.status === "approved"
                    ? "default"
                    : product.status === "draft"
                    ? "secondary"
                    : "outline"
                }>
                {product.status}
              </Badge>
            </TableCell>
            <TableCell>
              {/* Dropdown menu for actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {/* Edit link */}
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/productss/${product.id}/edit`}>
                      Edit
                    </Link>
                  </DropdownMenuItem>
                  {/* Delete action */}
                  <DropdownMenuItem
                    onClick={() => handleDelete(Number(product.id))}>
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
