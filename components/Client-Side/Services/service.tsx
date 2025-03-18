"use client";
import {
  CreditCard,
  Currency,
  GiftIcon,
  PhoneCall,
  ShapesIcon,
} from "lucide-react";
import ScrollableSection from "@/components/Client-Side/Features/ScrollableSection";

const services = [
  {
    id: 1,
    title: "Free Shipping",
    icon: ShapesIcon,
    description: "From all orders over Ksh 80k",
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
  return (
    <ScrollableSection
      title=""
      items={services.map((service) => ({
        id: service.id,
        content: (
          <div
            key={service.id}
            className="flex-shrink-0 h-20 md:h-32 flex items-center justify-between gap-2 md:gap-5 px-2 md:px-4 py-2 bg-white shadow-md rounded-md md:mb-2">
            <service.icon className="h-10 w-10 flex-shrink-0" />
            <div>
              <h3 className="text-md font-semibold">{service.title}</h3>
              <p className="text-sm text-gray-400">{service.description}</p>
            </div>
          </div>
        ),
      }))}
      className=""
      itemClassName="flex flex-col overflow-x-auto space-x-2 snap-x"
    />
  );
}
