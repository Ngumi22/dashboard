"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Product } from "@/lib/actions/Product/productTypes";
import Base64Image from "@/components/Data-Table/base64-image";

interface ProductsGridProps {
  products: Product[];
  productsPerRow: string;
  productsPerPage: string;
  sortBy: string;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export default function ProductsGrid({
  products,
  productsPerRow,
  productsPerPage,
  sortBy,
  currentPage,
  onPageChange,
}: ProductsGridProps) {
  const [sortedProducts, setSortedProducts] = useState<Product[]>([]);

  useEffect(() => {
    const sorted = [...products].sort((a, b) => {
      switch (sortBy) {
        case "alphabetical_asc":
          return a.name.localeCompare(b.name);
        case "alphabetical_desc":
          return b.name.localeCompare(a.name);
        case "price_asc":
          return a.price - b.price;
        case "price_desc":
          return b.price - a.price;
        case "date_asc":
          return (
            new Date(a.created_at || "").getTime() -
            new Date(b.created_at || "").getTime()
          );
        case "date_desc":
          return (
            new Date(b.created_at || "").getTime() -
            new Date(a.created_at || "").getTime()
          );
        case "rating_desc":
          return b.ratings - a.ratings;
        case "rating_asc":
          return a.ratings - b.ratings;
        default:
          return 0;
      }
    });
    setSortedProducts(sorted);
  }, [products, sortBy]);

  const gridCols = {
    "1": "grid-cols-1",
    "2": "grid-cols-1 sm:grid-cols-2",
    "3": "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
    "4": "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  }[productsPerRow];

  const itemsPerPage = Number.parseInt(productsPerPage);
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = sortedProducts.slice(startIndex, endIndex);

  return (
    <div>
      <div className={`grid ${gridCols} gap-4`}>
        {currentProducts.map((product) => (
          <Card key={product.id}>
            <CardHeader>
              <Base64Image
                src={product.main_image}
                alt={product.name}
                width={200}
                height={200}
              />
            </CardHeader>
            <CardContent>
              <CardTitle>{product.name}</CardTitle>
              <p className="text-2xl font-bold">${product.price}</p>
              <div className="flex items-center mt-2">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.round(product.ratings)
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="ml-2 text-sm text-gray-600">
                  ({product.ratings})
                </span>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Add to Cart</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      <Pagination className="mt-8">
        <PaginationContent>
          <PaginationItem className="cursor-pointer">
            <PaginationPrevious
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1) onPageChange(currentPage - 1);
              }}
              className={currentPage === 1 ? "disabled" : ""}
            />
          </PaginationItem>
          {[...Array(totalPages)].map((_, i) => (
            <PaginationItem className="cursor-pointer" key={i}>
              <PaginationLink
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(i + 1);
                }}
                isActive={currentPage === i + 1}>
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem className="cursor-pointer">
            <PaginationNext
              onClick={(e) => {
                if (currentPage < totalPages) onPageChange(currentPage + 1);
              }}
              className={currentPage === totalPages ? "disabled" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
