"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchProductsAndFilters } from "@/lib/actions/Product/fetchByFilters";
import { formatCurrency } from "@/lib/utils";

interface RelatedProductsProps {
  currentProductId: string;
  currentProductCategory: string;
  maxItems?: number;
}

const STALE_TIME = 1000 * 60 * 5; // 5 minutes

export default function RelatedProducts({
  currentProductId,
  currentProductCategory,
  maxItems = 4,
}: RelatedProductsProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["related-products", currentProductCategory],
    queryFn: () =>
      fetchProductsAndFilters({
        category: currentProductCategory,
        page: 1,
        perPage: 10, // reasonable fetch size for related items
      }),
    placeholderData: keepPreviousData,
    staleTime: STALE_TIME,
    refetchOnWindowFocus: false,
  });

  // Get related products with some simple heuristics
  const relatedProducts =
    data?.products
      ?.filter((product) => product.id !== Number(currentProductId))
      // Optional: Add more sorting criteria to improve relevance
      .sort((a, b) => {
        // Then by discount (show discounted items first)
        if (b.discount && a.discount) return b.discount - a.discount;
        return 0;
      })
      .slice(0, maxItems) || [];

  if (isLoading || relatedProducts.length === 0) return null;

  return (
    <div className="w-full">
      <h2 className="text-lg font-bold mb-4">Related Products</h2>
      <div className="space-y-3">
        {relatedProducts.map((product) => {
          const hasDiscount =
            product.discount !== undefined &&
            product.discount !== null &&
            product.discount > 0;

          return (
            <Card key={product.id} className="w-full bg-card overflow-hidden">
              <CardContent className="p-3">
                <Link
                  href={`/products/${product.name}`}
                  className="flex items-center gap-3">
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <Image
                      src={product.main_image}
                      alt={product.name}
                      fill
                      className="object-cover rounded-md"
                    />
                    {hasDiscount && (
                      <Badge
                        variant="destructive"
                        className="absolute top-2 right-2 text-xs font-medium">
                        -{product.discount}%
                      </Badge>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm line-clamp-2">
                      {product.description}
                    </h3>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="font-semibold text-sm text-primary">
                        {hasDiscount
                          ? formatCurrency(
                              product.price * (1 - product.discount / 100)
                            )
                          : formatCurrency(product.price)}
                      </span>
                      {hasDiscount && (
                        <span className="text-xs text-muted-foreground line-through">
                          {formatCurrency(product.price)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
