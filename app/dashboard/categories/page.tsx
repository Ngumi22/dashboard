// components/ProductList.tsx
"use client";

import { useState, useEffect } from "react";
import { ToastAction } from "@/components/ui/toast";

import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Category {
  id: number;
  name: string;
}

export default function CategoryList() {
  const [categories, setCategory] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await fetch("/api/categories");

        if (!res.ok) {
          throw new Error("Failed to fetch categories");
        }

        const data = await res.json();
        setCategory(data);
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

    fetchCategory();
  }, [toast]);

  const handleDelete = async (productId: number) => {
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete product");
      }

      setCategory(categories.filter((category) => category.id !== category.id));

      toast({
        title: "Product Deleted",
        description: "The product has been deleted successfully.",
      });
    } catch (err) {
      console.error(err);

      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";

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
    <div>
      <h1>Product List</h1>
      <div>
        <Link href="/dashboard/products/create"></Link>
      </div>
      <ul className="my-5">
        {categories.map((category) => (
          <li key={category.id} className="my-5">
            <p>{category.name}</p>
            <div className="flex gap-x-4 my-2">
              <Button variant="default">
                <Link href={`/dashboard/categories/${category.id}/edit`}>
                  Edit
                </Link>
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(category.id)}
              >
                Delete
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
