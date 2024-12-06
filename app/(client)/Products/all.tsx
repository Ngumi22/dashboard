"use client";

import { useProductStore } from "@/app/store/products";
import { ProductCard } from "@/components/Product/ProductCards/card";
import { SearchParams } from "@/lib/types";
import React, { useEffect } from "react";

const ProductList = () => {
  const { products, loading, error, fetchProducts, setFilters } =
    useProductStore();

  useEffect(() => {
    fetchProducts(); // Automatically checks cache before fetching
  }, [fetchProducts]);

  const handleFilterChange = (newFilters: SearchParams) => {
    setFilters(newFilters);
    fetchProducts(1, newFilters); // Resets to page 1 and fetches with updated filters
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="container">
      <h1>Product List</h1>
      {loading ? (
        <>
          <div className="grid grid-cols-1 gap-y-5 gap-x-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 xl:gap-x-8 mb-4">
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className="p-2 md:p-3 lg:p-5 lg:basis-64 flex-grow text-center shadow-lg bg-gray-400 animate-pulse h-10 "></div>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-y-5 gap-x-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 xl:gap-x-8">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="gap-y-8">
                <div className="p-2 md:p-5 lg:p-11 lg:basis-64 flex-grow text-center shadow-lg bg-gray-400 animate-pulse h-72"></div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 gap-y-5 gap-x-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-4">
          {products.map((product) => (
            <div key={product.product_id}>
              <ProductCard
                name={product.name}
                description={product.description}
                price={product.price}
                image={String(product.images.mainImage)}
                rating={product.ratings}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;
