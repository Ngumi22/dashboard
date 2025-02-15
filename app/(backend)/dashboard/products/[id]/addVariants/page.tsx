"use client";
import { VariantForm } from "@/components/Product/Variants/variant-form";
import { useParams } from "next/navigation";

export default function ProductPage() {
  const params = useParams();
  const productId = Array.isArray(params.productId)
    ? params.productId[0]
    : params.productId;
  return (
    <div>
      <h1>Add/Edit Variant</h1>
      <h2>{productId}</h2>
      <VariantForm productId={String(productId)} />
    </div>
  );
}
