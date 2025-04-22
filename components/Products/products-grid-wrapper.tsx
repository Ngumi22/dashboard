"use client";

import { useState } from "react";
import { ProductsHeader } from "./products-header";
import { ProductsGrid } from "./products-grid";
import { Product, SearchParams } from "@/lib/actions/Product/searchTypes";
import { ProductsPagination } from "./products-pagination";

const gridColsMap = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
} as const;

type GridValue = keyof typeof gridColsMap;

const isValidGridKey = (value: any): value is GridValue =>
  [1, 2, 3, 4].includes(Number(value));

interface ProductsGridClientWrapperProps {
  products: Product[];
  totalProducts: number;
  searchParams: SearchParams;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalProducts: number;
    perPage: number;
  };
}

export function ProductsGridClientWrapper({
  products,
  totalProducts,
  pagination,
  searchParams,
}: ProductsGridClientWrapperProps) {
  const initialGrid = isValidGridKey(searchParams.grid)
    ? (Number(searchParams.grid) as GridValue)
    : 4;

  const [grid, setGrid] = useState<GridValue>(initialGrid);
  const gridCols = gridColsMap[grid];

  return (
    <>
      <ProductsHeader
        totalProducts={totalProducts}
        searchParams={searchParams}
        grid={grid}
        onGridChange={setGrid}
      />

      <ProductsGrid
        products={products}
        searchParams={searchParams}
        gridCols={gridCols}
      />

      {totalProducts > 0 && (
        <ProductsPagination
          pagination={pagination}
          searchParams={searchParams}
        />
      )}
    </>
  );
}
