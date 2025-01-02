"use client";
import { useStore } from "@/app/store";
import { useToast } from "@/components/ui/use-toast";
import { Product } from "@/lib/actions/Product/productTypes";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AddVariants({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const [productData, setProductData] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const id = params.id;
  const router = useRouter();

  const fetchProductById = useStore((state) => state.fetchProductById);

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        try {
          setLoading(true);
          const product = await fetchProductById(id); // Now it returns Product or null
          setProductData(product); // Set the fetched product to state
        } catch (err) {
          setError("Failed to fetch product");
          toast({
            title: "Error",
            description: "There was an issue fetching the product.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      };

      fetchProduct();
    }
  }, [id, toast, fetchProductById]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return <p>Product ID: {productData?.product_id}</p>;
}
