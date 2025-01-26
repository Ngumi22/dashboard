"use client";
import {
  CreditCard,
  Currency,
  GiftIcon,
  PhoneCall,
  ShapesIcon,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

const services = [
  {
    id: 1,
    title: "Free Shipping",
    icon: ShapesIcon,
    description: "From all orders over $100",
  },
  {
    id: 2,
    title: "Daily Surprise Offers",
    icon: GiftIcon,
    description: "Save up to 25% off",
  },
  {
    id: 3,
    title: "Support 24/7",
    icon: PhoneCall,
    description: "Shop with an expert",
  },
  {
    id: 4,
    title: "Affordable Prices",
    icon: Currency,
    description: "Get Factory direct price",
  },
  {
    id: 5,
    title: "Secure Payments",
    icon: CreditCard,
    description: "100% Protected Payments",
  },
];

export default function Service() {
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
    <div className="container relative max-w-full my-10">
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
        className="scrollbar mx-auto max-w-full overflow-x-auto flex gap-8 pb-4 my-8">
        {services.map((item) => (
          <div
            key={item.id}
            className="flex-none w-64 md:w-auto md:flex-1 flex items-center gap-4 text-left">
            <item.icon className="h-12 w-12 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="text-sm text-gray-400">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
