"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

const url = process.env.BASE_URL1 || "https://www.bernzzdigitalsolutions.co.ke";

const categories = [
  {
    category_id: 1,
    category_name: "Laptops",
    category_description: "Affordable Laptops For Sale",
    category_image:
      "https://fastly.picsum.photos/id/2/5000/3333.jpg?hmac=_KDkqQVttXw_nM-RyJfLImIbafFrqLsuGO5YuHqD-qQ",
  },
  {
    category_id: 2,
    category_name: "Phones",
    category_description: "Affordable Phones For Sale",
    category_image:
      "https://fastly.picsum.photos/id/2/5000/3333.jpg?hmac=_KDkqQVttXw_nM-RyJfLImIbafFrqLsuGO5YuHqD-qQ",
  },
  {
    category_id: 3,
    category_name: "Desktops",
    category_description: "Affordable Laptops For Sale",
    category_image:
      "https://fastly.picsum.photos/id/2/5000/3333.jpg?hmac=_KDkqQVttXw_nM-RyJfLImIbafFrqLsuGO5YuHqD-qQ",
  },
  {
    category_id: 4,
    category_name: "Accessories",
    category_description: "Affordable Laptops For Sale",
    category_image:
      "https://fastly.picsum.photos/id/2/5000/3333.jpg?hmac=_KDkqQVttXw_nM-RyJfLImIbafFrqLsuGO5YuHqD-qQ",
  },
  {
    category_id: 5,
    category_name: "Printers",
    category_description: "Affordable Laptops For Sale",
    category_image:
      "https://fastly.picsum.photos/id/2/5000/3333.jpg?hmac=_KDkqQVttXw_nM-RyJfLImIbafFrqLsuGO5YuHqD-qQ",
  },
  {
    category_id: 6,
    category_name: "Softwares",
    category_description: "Affordable Laptops For Sale",
    category_image:
      "https://fastly.picsum.photos/id/2/5000/3333.jpg?hmac=_KDkqQVttXw_nM-RyJfLImIbafFrqLsuGO5YuHqD-qQ",
  },
  {
    category_id: 7,
    category_name: "Security",
    category_description: "Affordable Laptops For Sale",
    category_image:
      "https://fastly.picsum.photos/id/2/5000/3333.jpg?hmac=_KDkqQVttXw_nM-RyJfLImIbafFrqLsuGO5YuHqD-qQ",
  },
];

export default function CategorySection() {
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkScroll = () => {
      if (scrollContainerRef.current) {
        setShowScrollButtons(
          scrollContainerRef.current.scrollWidth >
            scrollContainerRef.current.clientWidth
        );
      }
    };

    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -200 : 200;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };
  return (
    <div className="relative max-w-full bg-white rounded-md p-4">
      <h1 className="text-left font-bold text-lg">Shop By Categories</h1>
      {showScrollButtons && (
        <>
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-2 shadow-md z-10"
            aria-label="Scroll left">
            ←
          </button>
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-2 shadow-md z-10"
            aria-label="Scroll right">
            →
          </button>
        </>
      )}

      <div
        ref={scrollContainerRef}
        className="scrollbar mx-auto max-w-full overflow-x-auto flex space-x-2 p-3 overflow-hidden">
        {categories.map((item) => (
          <div
            key={item.category_id}
            className="flex-none md:w-auto h-32 md:flex-1 flex items-center gap-x-4 text-left border p-2 border-1 border-gray-400">
            <div className="grid grid-flow-row space-y-4">
              <Link className="text-md font-semibold" href={url}>
                {item.category_name}
              </Link>
              <Link
                className="text-sm text-muted-foreground font-semibold"
                href={url}>
                View All
              </Link>
            </div>
            <Image
              src={item.category_image}
              height={100}
              width={100}
              className="object-contain h-auto w-auto overflow-hidden"
              alt={item.category_name}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
