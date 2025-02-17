"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Edit, MoreHorizontal, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ProductVariants } from "@/components/Product/ProductPage/product-variants";
import { ProductReviews } from "@/components/Product/ProductPage/product-reviews";
import { ProductAnalytics } from "@/components/Product/ProductPage/product-analytics";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { fetchProductById, Product } from "@/lib/actions/Product/fetchById";
import { useStore } from "@/app/store";

export default function ProductPage() {
  const fetchUniqueCategoriesWithSubs = useStore(
    (state) => state.fetchUniqueCategoriesWithSubs
  );
  const categories = useStore((state) => state.categories);
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchUniqueCategoriesWithSubs(); // Fetch initial page
  }, [fetchUniqueCategoriesWithSubs]);

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        try {
          const res = await fetchProductById(Number(id));

          setProduct(res);
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to fetch product",
          });
        }
      };

      fetchProduct();
    }
  }, [id, toast]);

  if (error) {
    return (
      <div>
        <p>{error}</p>
        <button
          onClick={() => router.push("/dashboard/products")}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
          Back to Products
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div>
        <p>Product not found.</p>
        <button
          onClick={() => router.push("/dashboard/products")}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
          Back to Products
        </button>
      </div>
    );
  }
  return (
    <div className="flex flex-col space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/dashboard/products">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Product Details</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Edit Product
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuItem>Archive</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-8">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div>
                    {product.main_image && (
                      <Image
                        src={`data:image/jpeg;base64,${product.main_image}`}
                        alt="Main Image"
                        width={400}
                        height={400}
                        className="rounded-lg object-cover"
                      />
                    )}
                  </div>

                  <div className="mt-3 grid grid-cols-5 gap-4">
                    {product.thumbnails
                      .flatMap((thumbnailObj) => Object.values(thumbnailObj))
                      .map((thumbnail, index) => (
                        <Image
                          key={index}
                          src={`data:image/webp;base64,${thumbnail}`}
                          alt={`Thumbnail ${index + 1}`}
                          width={50}
                          height={50}
                          className="h-12 w-12 object-cover"
                        />
                      ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Product Name</Label>
                    <Input id="name" value={product.product_name} readOnly />
                  </div>
                  <div>
                    <Label htmlFor="sku">SKU</Label>
                    <Input id="sku" value={product.product_sku} readOnly />
                  </div>
                  <div>
                    <Label htmlFor="price">Price</Label>
                    <Input id="price" value={product.product_price} readOnly />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={
                        categories.find(
                          (category) =>
                            Number(category.category_id) ===
                            Number(product.category_id)
                        )?.category_name || "Category not found"
                      }
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Product Description</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                className="min-h-[100px]"
                value={product.product_description}
                readOnly
              />
            </CardContent>
          </Card>
          <Tabs defaultValue="variants">
            <TabsList>
              <TabsTrigger value="variants">Variants</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            <TabsContent value="variants">
              <ProductVariants />
            </TabsContent>
            <TabsContent value="reviews">
              <ProductReviews />
            </TabsContent>
            <TabsContent value="analytics">
              <ProductAnalytics />
            </TabsContent>
          </Tabs>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <CardDescription>Total Sales</CardDescription>
                <p className="text-2xl font-bold">1,234</p>
              </div>
              <Separator />
              <div>
                <CardDescription>Revenue</CardDescription>
                <p className="text-2xl font-bold">$98,765</p>
              </div>
              <Separator />
              <div>
                <CardDescription>Average Rating</CardDescription>
                <div className="flex items-center">
                  <p className="text-2xl font-bold mr-2">4.5</p>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= 4
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Inventory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <CardDescription>In Stock</CardDescription>
                <p className="text-2xl font-bold">{product.product_quantity}</p>
              </div>
              <div>
                <CardDescription>Low Stock Threshold</CardDescription>
                <p className="text-2xl font-bold">50</p>
              </div>
              <Button className="w-full">Manage Inventory</Button>
            </CardContent>
          </Card>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline">
                Update Price
              </Button>
              <Button className="w-full" variant="outline">
                Add to Collection
              </Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button className="w-full" variant="outline">
                      Generate Report
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Generate a detailed report for this product</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
