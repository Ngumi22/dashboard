"use client";

import TabbedScrollableSection from "@/components/Client-Side/Features/TabbedScrollableSection";

const categories = [
  {
    name: "Laptops",
    products: Array.from({ length: 10 }, (_, i) => ({
      id: `laptop-${i + 1}`,
      title: `Laptop ${i + 1}`,
      price: `$${(Math.random() * 1000 + 500).toFixed(2)}`,
      imageUrl: `https://fastly.picsum.photos/id/2/5000/3333.jpg?hmac=_KDkqQVttXw_nM-RyJfLImIbafFrqLsuGO5YuHqD-qQ`,
    })),
  },
  {
    name: "Phones",
    products: Array.from({ length: 10 }, (_, i) => ({
      id: `phone-${i + 1}`,
      title: `Phone ${i + 1}`,
      price: `$${(Math.random() * 500 + 200).toFixed(2)}`,
      imageUrl: `https://fastly.picsum.photos/id/2/5000/3333.jpg?hmac=_KDkqQVttXw_nM-RyJfLImIbafFrqLsuGO5YuHqD-qQ`,
    })),
  },
  {
    name: "Tablets",
    products: Array.from({ length: 10 }, (_, i) => ({
      id: `tablet-${i + 1}`,
      title: `Tablet ${i + 1}`,
      price: `$${(Math.random() * 800 + 300).toFixed(2)}`,
      imageUrl: `https://fastly.picsum.photos/id/2/5000/3333.jpg?hmac=_KDkqQVttXw_nM-RyJfLImIbafFrqLsuGO5YuHqD-qQ`,
    })),
  },
];

export default function PopularProducts() {
  return (
    <section>
      <h1 className="text-xl font-bold mb-8">Popular Products</h1>
      <TabbedScrollableSection
        categories={categories}
        className="mb-8"
        itemClassName="w-[250px]"
      />
    </section>
  );
}
