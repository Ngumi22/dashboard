"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ProductData, CategoryData } from "@/lib/definitions";
import Image from "next/image";

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
    <div className="container my-10">
      <Tabs defaultValue={categories[0]?.name}>
        <TabsList className="grid grid-flow-col gap-4">
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.name}>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="my-2">
          {categories.map((category) => (
            <TabsContent
              key={category.id}
              value={category.name}
              className="grid grid-cols-3 gap-5">
              {productsByCategory[category.name]?.length > 0 ? (
                productsByCategory[category.name].map((product) => (
                  <Card key={product.id} className="mb-4">
                    <CardHeader>
                      <CardTitle>{product.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{product.description}</p>
                      <p>Price: {product.price}</p>
                      <p>Discount: {product.discount}</p>
                      <p>Quantity: {product.quantity}</p>
                      <p>Brand: {product.brand}</p>
                      <div className="flex gap-2 w-full">
                        <Image
                          loading="lazy"
                          className="h-14 w-14"
                          src={`data:image/jpeg;base64,${product.images.main}`}
                          alt={product.name}
                          height={100}
                          width={100}
                        />
                        {product.images.thumbnails.map((thumb, index) => (
                          <Image
                            height={100}
                            width={100}
                            loading="lazy"
                            className="h-14 w-14"
                            key={index}
                            src={`data:image/jpeg;base64,${thumb}`}
                            alt={`Thumbnail ${index + 1}`}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p>No products found in this category.</p>
              )}
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
}
