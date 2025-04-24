"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";
import { Product, SearchParams } from "@/lib/actions/Product/searchTypes";

const ProductsHeader = dynamic(() =>
  import("./products-header").then((mod) => mod.ProductsHeader)
);
const ProductsGrid = dynamic(() =>
  import("./products-grid").then((mod) => mod.ProductsGrid)
);
const ProductsPagination = dynamic(() =>
  import("./products-pagination").then((mod) => mod.ProductsPagination)
);

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
  searchParams: Pick<SearchParams, "grid" | "filters" | "sort" | "page">;
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

  const gridCols = useMemo(() => gridColsMap[grid], [grid]);
  const handleGridChange = useCallback(
    (value: GridValue) => setGrid(value),
    []
  );

  return (
    <>
      <ProductsHeader
        totalProducts={totalProducts}
        searchParams={{
          sort: searchParams.sort,
          filters: searchParams.filters,
        }}
        grid={grid}
        onGridChange={handleGridChange}
      />

      <ProductsGrid
        products={products}
        gridCols={gridCols}
        searchParams={{ filters: searchParams.filters }}
      />

      {totalProducts > 0 && (
        <ProductsPagination
          pagination={pagination}
          searchParams={{ page: searchParams.page }}
        />
      )}
    </>
  );
}
