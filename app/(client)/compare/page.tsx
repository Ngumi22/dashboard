"use client";

import { useCompareStore } from "@/app/store/compare";
import ProductCard from "@/components/Product/ProductCards/product-card";

export default function Comparelist() {
  const compareItems = useCompareStore((state) => state.compareItems);

  const decreaseQuantity = useCompareStore(
    (state) => state.decreaseItemQuantity
  );
  const clearCompare = useCompareStore((state) => state.clearCompare);

  const handleRemoveFromCompare = (id: number) => {
    decreaseQuantity(id);
  };

  const handleClearCompare = () => {
    clearCompare();
  };

  return (
    <p>
      {compareItems.map((item) => (
        <ProductCard
          key={item.id}
          id={item.id}
          name={item.name}
          description={item.description}
          price={item.price}
          discount={item.discount}
          quantity={item.quantity}
          main_image={item.main_image}
          ratings={item.ratings}
        />
      ))}
    </p>
  );
}
