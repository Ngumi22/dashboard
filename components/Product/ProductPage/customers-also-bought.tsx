"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RelatedProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  discount?: number;
  status: "IN_STOCK" | "OUT_OF_STOCK" | "LOW_STOCK";
}

interface CustomersAlsoBoughtProps {
  currentProductId: string;
}

export default function CustomersAlsoBought({
  currentProductId,
}: CustomersAlsoBoughtProps) {
  // This would normally come from your data store based on purchase history
  const relatedProducts: RelatedProduct[] = [
    {
      id: "1",
      name: "AirPods Pro",
      price: 249,
      image: "/placeholder.svg",
      discount: 10,
      status: "IN_STOCK" as "IN_STOCK",
    },
    {
      id: "2",
      name: "iPhone 12 Pro Case",
      price: 49,
      image: "/placeholder.svg",
      status: "IN_STOCK" as "IN_STOCK",
    },
    {
      id: "3",
      name: "MagSafe Charger",
      price: 39,
      image: "/placeholder.svg",
      discount: 15,
      status: "LOW_STOCK" as "LOW_STOCK",
    },
    {
      id: "4",
      name: "Apple Watch Series 7",
      price: 399,
      image: "/placeholder.svg",
      status: "IN_STOCK" as "IN_STOCK",
    },
    {
      id: "5",
      name: "iPad Pro 12.9",
      price: 1099,
      image: "/placeholder.svg",
      discount: 20,
      status: "IN_STOCK" as "IN_STOCK",
    },
  ].filter((product) => product.id !== currentProductId);

  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -200 : 200;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="mt-12 mb-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Customers also bought</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => scroll("left")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => scroll("right")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide scroll-smooth">
        {relatedProducts.map((product) => (
          <Card key={product.id} className="min-w-[240px] bg-card">
            <CardContent className="p-4">
              <Link href={`/products/${product.id}`}>
                <div className="relative aspect-square mb-4">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover rounded-lg"
                  />
                  {product.discount && (
                    <Badge
                      variant="destructive"
                      className="absolute top-2 right-2">
                      -{product.discount}%
                    </Badge>
                  )}
                  {product.status === "LOW_STOCK" && (
                    <Badge
                      variant="secondary"
                      className="absolute bottom-2 right-2">
                      Low Stock
                    </Badge>
                  )}
                </div>
                <h3 className="font-medium line-clamp-1">{product.name}</h3>
                <div className="mt-2 flex items-center gap-2">
                  <span className="font-semibold text-primary">
                    $
                    {product.discount
                      ? (product.price * (1 - product.discount / 100)).toFixed(
                          2
                        )
                      : product.price.toFixed(2)}
                  </span>
                  {product.discount && (
                    <span className="text-sm text-muted-foreground line-through">
                      ${product.price.toFixed(2)}
                    </span>
                  )}
                </div>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
