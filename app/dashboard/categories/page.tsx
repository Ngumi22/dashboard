"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  sku: string;
  status: string;
  category: string;
  name: string;
  description: string;
  brand: string;
  price: number;
  discount: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  images: {
    main: string;
    thumbnails: string[];
  };
}

export default function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [productsByCategory, setProductsByCategory] = useState<{
    [key: string]: Product[];
  }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");

        if (!res.ok) {
          throw new Error("Failed to fetch categories");
        }

        const data = await res.json();
        setCategories(data);

        // Fetch products for each category
        for (const category of data) {
          await fetchProducts(category.name);
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
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [toast]);

  // Fetch products for a specific category
  const fetchProducts = async (categoryName: string) => {
    try {
      const res = await fetch(`/api/products?category=${categoryName}`);

      if (!res.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await res.json();
      setProductsByCategory((prev) => ({ ...prev, [categoryName]: data }));
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
  };

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
        {categories.map((category) => (
          <TabsContent key={category.id} value={category.name}>
            <div className="flex flex-wrap gap-4">
              {productsByCategory[category.name]?.length > 0 ? (
                productsByCategory[category.name].map((product) => (
                  <Card key={product.id} className="w-full md:w-1/2 lg:w-1/2">
                    <CardHeader>
                      <CardTitle>{product.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{product.description}</p>
                      <p>Price: {product.price}</p>
                      <p>Discount: {product.discount}</p>
                      <p>Quantity: {product.quantity}</p>
                      <p>Brand: {product.brand}</p>
                      <div className="flex gap-2">
                        <img
                          className="h-20 w-20"
                          src={`data:image/jpeg;base64,${product.images.main}`}
                          alt={product.name}
                        />
                        {product.images.thumbnails.map((thumb, index) => (
                          <img
                            className="h-20 w-20"
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
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
