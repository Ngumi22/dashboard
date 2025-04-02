"use client";

import dynamic from "next/dynamic";

// Lazy load all icons
const icons = {
  CreditCard: dynamic(
    () => import("lucide-react").then((mod) => mod.CreditCard),
    { ssr: false }
  ),
  Currency: dynamic(() => import("lucide-react").then((mod) => mod.Currency), {
    ssr: false,
  }),
  GiftIcon: dynamic(() => import("lucide-react").then((mod) => mod.Gift), {
    ssr: false,
  }),
  PhoneCall: dynamic(
    () => import("lucide-react").then((mod) => mod.PhoneCall),
    { ssr: false }
  ),
  ShapesIcon: dynamic(() => import("lucide-react").then((mod) => mod.Shapes), {
    ssr: false,
  }),
};

const services = [
  {
    id: 1,
    title: "Free Shipping",
    icon: "ShapesIcon",
    description: "From all orders over Ksh 80k",
  },
  {
    id: 2,
    title: "Daily Offers",
    icon: "GiftIcon",
    description: "Save up to 25% off",
  },
  {
    id: 3,
    title: "Support 24/7",
    icon: "PhoneCall",
    description: "Shop with an expert",
  },
  {
    id: 4,
    title: "Affordable Prices",
    icon: "Currency",
    description: "Get Factory direct price",
  },
  {
    id: 5,
    title: "Secure Payments",
    icon: "CreditCard",
    description: "100% Protected Payments",
  },
];

export default function Service() {
  return (
    <div className="md:container">
      <div className="flex overflow-x-auto gap-4 snap-x snap-mandatory scrollbar py-4 px-2 md:px-0">
        {services.map((service) => {
          const Icon = icons[service.icon as keyof typeof icons];
          return (
            <div
              key={service.id}
              className="flex-shrink-0 h-32 w-56 snap-start flex flex-col items-center justify-center gap-2 p-2 md:p-4 bg-white shadow-md rounded-lg text-center">
              {Icon && <Icon className="h-8 w-8 text-blue-600" />}
              <div>
                <h3 className="text-md font-semibold">{service.title}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {service.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
