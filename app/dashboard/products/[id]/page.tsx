"use client";
import React, { useEffect, useState } from "react";
import { fetchProductByIdFromDb } from "@/lib/actions";
import { ProductssData } from "@/lib/definitions";
import Image from "next/image";

interface IParams {
  id?: string;
}

const ProductIdPage: React.FC<{ params: IParams }> = ({ params }) => {
  const [product, setProduct] = useState<ProductssData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const productId = params.id ? parseInt(params.id, 10) : undefined;

  useEffect(() => {
    if (productId !== undefined) {
      fetchProduct();
    } else {
      setLoading(false); // Stop loading if there's no productId
      setError("Invalid product ID.");
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const productData = await fetchProductByIdFromDb(productId as number); // Assert that productId is a number here
      setProduct(productData);
    } catch (error) {
      setError("Error fetching product data.");
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!product) {
    return <p>No product found with the given ID.</p>;
  }

  return (
    <div>
      <h1>Product Id: {product.id}</h1>
      <p>Name: {product.name}</p>
      <p>SKU: {product.sku}</p>
      <p>Description: {product.description}</p>
      <p>Category: {product.category}</p>
      <p>Status: {product.status}</p>
      <p>Price: {product.price}</p>
      <p>Discount: {product.discount}</p>
      <p>Quantity: {product.quantity}</p>
      <Image
        src={`data:image/jpeg;base64,${product.images.main}`}
        alt={product.name}
        height={40}
        width={40}
      />
      <div className="flex">
        {product.images.thumbnails.map((thumbnail, index) => (
          <img
            key={index}
            src={`data:image/jpeg;base64,${thumbnail}`}
            alt={`image-${index}`}
            style={{
              marginRight: "10px",
              marginBottom: "10px",
              width: "6rem",
              height: "6rem",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductIdPage;
