"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Product } from "@/lib/actions/Product/actions/types";
import { fetchProductById } from "@/lib/actions/Product/actions/fetchById";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ProductForm from "@/components/Admin/Products/Forms/AddProduct";

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
          throw error;
        }
      };

      fetchProduct();
      setLoading(false);
    }
  }, [id, toast]);

  const processedData = useMemo(() => {
    if (!product) return null;

    return {
      product_id: product.id,
      product_name: product.name || "",
      product_sku: product.sku || "",
      product_description: product.description || "",
      long_description: product.long_description || "",
      product_price: Number(product.price) || 0,
      product_quantity: Number(product.quantity) || 0,
      product_discount: Number(product.discount) || 0,
      product_status: product.status || "draft",
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
      thumbnails: Array.isArray(product.thumbnails)
        ? product.thumbnails.flatMap((t) => t)
        : [],
    };
  }, [product]);

  return (
    <section>
      {loading ? (
        <div>
          <p>Loading... Please Wait</p>
          {/* Optionally add a spinner or skeleton loader */}
        </div>
      ) : error ? (
        <div>
          <p>Error: {error || "Something went wrong."}</p>
          <Link href="/dashboard/products">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      ) : !processedData ? (
        <div>
          <p>Product not found.</p>
          <Link href="/dashboard/products">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      ) : (
        <ProductForm initialData={processedData} />
      )}
    </section>
  );
}
