"use client";

import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { MinimalProduct, useCompareStore } from "@/app/store/compare";
import Base64Image from "@/components/Data-Table/base64-image";
import { fetchProductById } from "@/lib/actions/Product/fetchById";
import { formatCurrency } from "@/components/Product/ProductCards/product-card";
import { useCartStore } from "@/app/store/cart";
import { X } from "lucide-react";

export default function ProductComparison() {
  const compareItems = useCompareStore((state) => state.compareItems);
  const removeItem = useCompareStore((state) => state.removeItemFromCompare);
  const addItemToCart = useCartStore((state) => state.addItemToCart);

  // Fetch product details using React Query
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
    enabled: compareItems.length > 0, // Only fetch if there are items to compare
  });

  const handleAddToCart = (product: MinimalProduct) => {
    addItemToCart({ ...product, quantity: 1 }); // Add one product at a time
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
      <div className="flex justify-center items-center h-64 text-red-500">
        Failed to load product details
      </div>
    );
  }

  if (compareItems.length === 0) {
    return (
      <div className="mx-auto px-6 bg-white rounded-lg shadow-sm">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-600">No products added to compare.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-6 bg-white rounded-lg shadow-sm">
      <div>
        <h2 className="text-4xl text-gray-900 font-bold text-center my-4">
          Compare Products
        </h2>
      </div>
      <table className="w-full border-collapse border border-gray-200">
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
                  <Button
                    variant="destructive"
                    size="sm"
                    className="mt-2 absolute top-0 right-4"
                    disabled={product.quantity <= 0}
                    onClick={() => handleRemoveFromCompare(product)}>
                    <X className="h-6 w-6" />
                  </Button>
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          <tr>
            <td className="border border-gray-200 p-3 text-gray-600">Brand</td>
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
            <td className="border border-gray-200 p-3 text-gray-600">Price</td>
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
  );
}
