"use client";

import ScrollableSection from "@/components/Client-Side/Features/ScrollableSection";

const ExampleProductCard: React.FC<{ title: string; price: string }> = ({
  title,
  price,
}) => (
  <div className="border rounded-lg p-4 h-[320px] flex flex-col">
    <div className="bg-gray-200 w-full h-48 mb-4 rounded"></div>
    <h3 className="font-semibold">{title}</h3>
    <p className="text-gray-600 mt-auto">{price}</p>
  </div>
);

export default function FeaturedProducts() {
  const featuredProducts = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    content: (
      <ExampleProductCard
        title={`Product ${i + 1}`}
        price={`$${(Math.random() * 100).toFixed(2)}`}
      />
    ),
  }));

  const bannerImages = [
    {
      src: "https://fastly.picsum.photos/id/2/5000/3333.jpg?hmac=_KDkqQVttXw_nM-RyJfLImIbafFrqLsuGO5YuHqD-qQ",
      alt: "Banner 1",
      link: "/promo1",
    },
    {
      src: "https://fastly.picsum.photos/id/0/5000/3333.jpg?hmac=_j6ghY5fCfSD6tvtcV74zXivkJSPIfR9B8w34XeQmvU",
      alt: "Banner 2",
      link: "/promo2",
    },
  ];

  return (
    <main className="container mx-auto px-4 py-8">
      <ScrollableSection
        title="Featured Products"
        items={featuredProducts}
        className="mb-8"
        itemClassName="w-56 sm:w-64 md:w-72 flex-shrink-0"
        banner={{
          images: bannerImages,
          interval: 5000,
          height: 320,
          width: 240,
          className: "rounded-lg shadow-md",
          imageClassName: "rounded-lg",
        }}
      />
    </main>
  );
}
