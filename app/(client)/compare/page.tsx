"use client";

import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { MinimalProduct, useCompareStore } from "@/app/store/compare";
import Base64Image from "@/components/Data-Table/base64-image";
import { fetchProductById } from "@/lib/actions/Product/fetchById";
import { formatCurrency } from "@/components/Product/ProductCards/product-card";
import { useCartStore } from "@/app/store/cart";
import { X } from "lucide-react";
import Link from "next/link";

export default function ProductComparison() {
  const compareItems = useCompareStore((state) => state.compareItems);
  const removeItem = useCompareStore((state) => state.removeItemFromCompare);
  const addItemToCart = useCartStore((state) => state.addItemToCart);

  const {
    data: products,
    isLoading,
    isError,
  } = useQuery<MinimalProduct[], Error>({
    queryKey: ["compareProducts", compareItems],
    queryFn: async () => {
      if (compareItems.length === 0) return [];
      const productDetails = await Promise.all(
        compareItems.map((item) => fetchProductById(item.id))
      );
      return productDetails;
    },
    enabled: compareItems.length > 0,
  });

  const handleAddToCart = (product: MinimalProduct) => {
    addItemToCart({ ...product, quantity: 1 });
  };

  const handleRemoveFromCompare = (product: MinimalProduct) => {
    removeItem(product.id);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        Loading products...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500 mt-[9.7rem] lg:mt-[12rem] bg-muted/80 p-2 sm:p-5 text-center">
        Failed to load product details
      </div>
    );
  }

  if (compareItems.length === 0) {
    return (
      <div className="mt-[9.7rem] lg:mt-[12rem] bg-muted/80 p-2 sm:p-5 text-center">
        <div className="grid h-64 py-8">
          <p className="text-xl font-semibold">No products added to compare.</p>
          <Link href={"/"}>
            <Button>Back Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-[9.7rem] lg:mt-[12rem] bg-muted/80 p-2 sm:p-5 text-center">
      <h2 className="text-xl sm:text-2xl font-bold mb-3">Compare Products</h2>

      {/* Desktop Table */}
      <div className="hidden md:block">
        <table className="w-full border-collapse border border-gray-200">
          {/* ... rest of your existing table code ... */}
          <thead>
            <tr>
              <th className="border border-gray-200 p-3 text-left">Product</th>
              {products?.map((product) => (
                <th
                  key={`header-${product.id}`}
                  className="border border-gray-200 p-3 text-center relative">
                  <div className="flex flex-col items-center">
                    <Base64Image
                      src={product.main_image}
                      alt={product.name}
                      width={100}
                      height={100}
                    />
                    <h3 className="mt-2 font-medium">{product.name}</h3>
                    <Button
                      className="mt-2"
                      disabled={product.quantity <= 0}
                      onClick={() => handleAddToCart(product)}>
                      Add to cart
                    </Button>

                    {product.quantity > 0 && (
                      <X
                        className="h-6 w-6 mt-2 absolute top-0 right-4 cursor-pointer hover:text-red-600"
                        onClick={() => handleRemoveFromCompare(product)}
                      />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            <tr>
              <td className="border border-gray-200 p-3 text-gray-600">
                Brand
              </td>
              {products?.map((product) => (
                <td key={`brand-${product.id}`} className="font-bold">
                  {product.brand_name || "N/A"}
                </td>
              ))}
            </tr>

            <tr>
              <td className="border border-gray-200 p-3 text-gray-600">
                Category
              </td>
              {products?.map((product) => (
                <td
                  key={`category-${product.id}`}
                  className="border border-gray-200 p-3 text-center">
                  <span className="font-bold">
                    {product.category_name || "Uncategorized"}
                  </span>
                </td>
              ))}
            </tr>

            <tr>
              <td className="border border-gray-200 p-3 text-gray-600">
                Price
              </td>
              {products?.map((product) => (
                <td
                  key={`price-${product.id}`}
                  className="font-bold p-3 text-center">
                  {formatCurrency(product.price)}
                  {product.discount > 0 && (
                    <span className="ml-2 text-green-600 text-sm">
                      {product.discount}% off
                    </span>
                  )}
                </td>
              ))}
            </tr>

            <tr>
              <td className="border border-gray-200 p-3 text-gray-600">
                Availability
              </td>
              {products?.map((product) => (
                <td
                  key={`availability-${product.id}`}
                  className="border border-gray-200 p-3 text-center">
                  {product.quantity > 0
                    ? `In Stock (${product.quantity})`
                    : "Out of Stock"}
                </td>
              ))}
            </tr>

            {/* Technical Specifications */}
            {products &&
              products.length > 0 &&
              products[0].specifications &&
              [
                ...new Set(
                  products.flatMap(
                    (p) =>
                      p.specifications?.map((s) => s.specification_name) || []
                  )
                ),
              ].map((specName) => (
                <tr key={specName}>
                  <td className="border border-gray-200 p-3 text-gray-600">
                    {specName}
                  </td>
                  {products.map((product) => {
                    const spec = product.specifications?.find(
                      (s) => s.specification_name === specName
                    );
                    return (
                      <td
                        key={`spec-${product.id}-${specName}`}
                        className="border border-gray-200 p-3 text-center">
                        {spec ? spec.specification_value : "N/A"}
                      </td>
                    );
                  })}
                </tr>
              ))}

            {/* No Technical Specifications */}
            {(!products ||
              !products[0].specifications ||
              products[0].specifications.length === 0) && (
              <tr>
                <td
                  colSpan={(products?.length ?? 0) + 1}
                  className="p-4 text-center text-gray-500">
                  No technical specifications available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {products?.map((product) => (
          <div
            key={`mobile-${product.id}`}
            className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 relative">
            <div className="flex justify-between items-start mb-3">
              <Base64Image
                src={product.main_image}
                alt={product.name}
                width={80}
                height={80}
              />
              <X
                className="h-5 w-5 cursor-pointer hover:text-red-600"
                onClick={() => handleRemoveFromCompare(product)}
              />
            </div>

            <h3 className="font-medium text-lg mb-2">{product.name}</h3>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-600">Brand:</div>
              <div className="font-medium">{product.brand_name || "N/A"}</div>

              <div className="text-gray-600">Category:</div>
              <div className="font-medium">
                {product.category_name || "Uncategorized"}
              </div>

              <div className="text-gray-600">Price:</div>
              <div className="font-medium">
                {formatCurrency(product.price)}
                {product.discount > 0 && (
                  <span className="ml-1 text-green-600 text-xs">
                    {product.discount}% off
                  </span>
                )}
              </div>

              <div className="text-gray-600">Availability:</div>
              <div className="font-medium">
                {product.quantity > 0
                  ? `In Stock (${product.quantity})`
                  : "Out of Stock"}
              </div>
            </div>

            {/* Specifications */}
            {product.specifications && product.specifications.length > 0 && (
              <div className="mt-3">
                <h4 className="font-medium text-gray-700 mb-1">
                  Specifications:
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {product.specifications.map((spec) => (
                    <>
                      <div className="text-gray-600">
                        {spec.specification_name}:
                      </div>
                      <div>{spec.specification_value || "N/A"}</div>
                    </>
                  ))}
                </div>
              </div>
            )}

            <Button
              className="w-full mt-4"
              disabled={product.quantity <= 0}
              onClick={() => handleAddToCart(product)}>
              Add to cart
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
