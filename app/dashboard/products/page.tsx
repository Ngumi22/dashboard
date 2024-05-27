// components/ProductList.tsx
"use client";

import { useState, useEffect } from "react";
import { ToastAction } from "@/components/ui/toast";

import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Product {
  id: number;
  sku: string;
  name: string;
  description: string;
  category: string;
  status: string;
  price: number;
  discount: number;
  quantity: number;
  images: {
    main: string | null;
    thumbnails: string[];
  };
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");

        if (!res.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await res.json();
        setProducts(data);
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
  }, [toast]);

  const handleDelete = async (productId: number) => {
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete product");
      }

      setProducts(products.filter((product) => product.id !== productId));

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
        {products.map((product) => (
          <li key={product.id} className="my-5">
            <h2>{product.name}</h2>
            <p>SKU: {product.sku}</p>
            <p>Price: {product.price}</p>
            <p>Quantity: {product.quantity}</p>
            <p>Discount: {product.discount}</p>
            <p>Description: {product.description}</p>
            <p>Category: {product.category}</p>
            <p>Status: {product.status}</p>
            <div>
              {product.images.main && (
                <img
                  className="h-24 w-24"
                  src={`data:image/jpeg;base64,${product.images.main}`}
                  alt="Main Image"
                />
              )}
            </div>
            <div className="flex gap-2">
              {product.images.thumbnails.map((thumbnail, index) => (
                <img
                  className="h-20 w-20"
                  key={index}
                  src={`data:image/jpeg;base64,${thumbnail}`}
                  alt={`Thumbnail ${index + 1}`}
                />
              ))}
            </div>
            <div className="flex gap-x-4 my-2">
              <Button variant="default">
                <Link href={`/dashboard/products/${product.id}/edit`}>
                  Edit
                </Link>
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(product.id)}>
                Delete
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
