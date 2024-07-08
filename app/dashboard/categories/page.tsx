"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ProductData, CategoryData } from "@/lib/definitions";
import Image from "next/image";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function CategoryList() {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [productsByCategory, setProductsByCategory] = useState<{
    [key: string]: ProductData[];
  }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const fetchedCategories = useRef(new Set<string>());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resCategories = await fetch("/api/categories");

        if (!resCategories.ok) {
          throw new Error("Failed to fetch categories");
        }

        const categoriesData = await resCategories.json();
        setCategories(categoriesData);

        categoriesData.forEach((category: CategoryData) => {
          fetchProducts(category.name);
        });
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

    fetchData();
  }, [toast]);

  const fetchProducts = useCallback(
    async (categoryName: string) => {
      if (fetchedCategories.current.has(categoryName)) {
        return;
      }
      fetchedCategories.current.add(categoryName);

      try {
        const res = await fetch(`/api/products?category=${categoryName}`);

        if (!res.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await res.json();

        if (data.length === 0) {
          await fetch(`/api/categories/${categoryName}`, { method: "DELETE" });
          setCategories((prevCategories) =>
            prevCategories.filter((category) => category.name !== categoryName)
          );
        } else {
          setProductsByCategory((prev) => ({ ...prev, [categoryName]: data }));
        }
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
      }
    },
    [toast]
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <section className="flex min-h-screen w-full flex-col bg-muted/40">
      <Tabs defaultValue={categories[0]?.name}>
        <TabsList className="grid grid-flow-col">
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.name}>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
        {categories.map((category) => (
          <TabsContent key={category.id} value={category.name}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Stock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="container">
                {productsByCategory[category.name]?.length > 0 ? (
                  productsByCategory[category.name].map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Image
                          loading="lazy"
                          className="h-14 w-14"
                          src={`data:image/jpeg;base64,${product.images.main}`}
                          alt={product.name}
                          height={100}
                          width={100}
                        />
                      </TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.status}</TableCell>
                      <TableCell>{product.price}</TableCell>
                      <TableCell>{product.brand}</TableCell>
                      <TableCell>{product.quantity}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6}>
                      No products found in this category.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}
