"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProductsByTagQuery } from "@/lib/actions/Hooks/useTags";
import ProductCard from "@/components/Product/ProductCards/product-card";

export default function ProductsByTagPage({
  params,
}: {
  params: { tag: string };
}) {
  const {
    data: products,
    isLoading,
    isError,
  } = useProductsByTagQuery(params.tag);

  console.log(products);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error fetching products. Please try again later.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-[9.7rem] lg:mt-[11rem] bg-muted/80">
      <div className="mb-8 flex justify-between items-center">
        <Button
          variant="ghost"
          asChild
          className="gap-2 pl-2 hover:bg-transparent">
          <Link href="/products">
            <ChevronLeft className="h-4 w-4" />
            Back to All Products
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">
          Products tagged with {params.tag}
        </h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products?.products?.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            description={product.description}
            price={product.price}
            main_image={product.main_image}
            ratings={product.ratings}
            discount={product.discount}
            quantity={product.quantity}
          />
        ))}
      </div>
    </div>
  );
}
