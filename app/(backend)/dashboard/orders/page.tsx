"use client";

import ProductForm from "@/components/Product/Create/ProductForm";
import { fetchProductById, Product } from "@/lib/actions/Product/fetchById";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

export default function UpdateProductPage() {
  const [product, setProduct] = useState<Product | null>(null);

  const { id } = useParams();
  const { toast } = useToast();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        try {
          const productId = Array.isArray(id) ? Number(id[0]) : Number(id);
          const res = await fetchProductById(productId);
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
      setLoading(false);
    }
  }, [id, toast]);

  const processedData = useMemo(() => {
    if (!product) return null;

    return {
      product_id: product.product_id,
      product_name: product.product_name || "",
      product_sku: product.product_sku || "",
      product_description: product.product_description || "",
      product_price: Number(product.product_price) || 0,
      product_quantity: Number(product.product_quantity) || 0,
      product_discount: Number(product.product_discount) || 0,
      product_status: product.product_status || "draft",
      category_id: String(product.category_id || ""),
      tags: product.tags || [],
      suppliers:
        product.suppliers?.map((supplier) => ({
          supplier_id: supplier.supplier_id,
          supplier_name: supplier.supplier_name,
          supplier_email: supplier.supplier_email,
          supplier_phone_number: supplier.supplier_phone_number,
          supplier_location: supplier.supplier_location,
        })) || [],
      specifications: Array.isArray(product.specifications)
        ? product.specifications.map((spec) => ({
            specification_id: spec.specification_id || "",
            specification_name: spec.specification_name || "",
            specification_value: spec.specification_value || "",
            category_id: spec.category_id || "",
          }))
        : [],

      brand_id: product.brand?.brand_id ?? 0,
      brand_name: product.brand?.brand_name || "",
      brand_image: product.brand?.brand_image || "",
      main_image: product.main_image || "",
      thumbnails: Array.isArray(product.thumbnails) ? product.thumbnails : [],
    };
  }, [product]);

  if (loading) {
    return (
      <div className="w-full m-auto">
        <p>Loading... Please Wait</p>
      </div>
    );
  }

  if (!processedData || error) {
    return (
      <div>
        <p>Product not found.</p>
        <Button
          onClick={() => router.push("/dashboard/products")}
          variant="default">
          Back to Products
        </Button>
      </div>
    );
  }

  return <ProductForm initialData={processedData} />;
}
