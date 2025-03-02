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
import ProductCard from "@/components/Product/ProductCards/product-card";

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
