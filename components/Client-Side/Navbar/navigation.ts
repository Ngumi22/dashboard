import { NavigationItem } from "@/lib/definitions";

export const navigation: NavigationItem[] = [
  {
    title: "Good deals",
    href: "/deals",
    items: [
      {
        title: "Featured Deals",
        href: "#",
        featured: [
          {
            title: "iPhone 13",
            href: "#",
            description: "Save up to 40% on certified refurbished models",
          },
          {
            title: "MacBook Air",
            href: "#",
            description: "Starting at $499 with 1-year warranty",
          },
          {
            title: "MacBook Air",
            href: "#",
            description: "Starting at $499 with 1-year warranty",
          },
          {
            title: "MacBook Air",
            href: "#",
            description: "Starting at $499 with 1-year warranty",
          },
        ],
        categories: [
          {
            title: "Popular Categories",
            items: [
              { title: "Smartphones", href: "#" },
              { title: "Laptops", href: "#" },
              { title: "Gaming", href: "#" },
              { title: "Tablets", href: "#" },
            ],
          },
          {
            title: "By Brand",
            items: [
              { title: "Apple", href: "#" },
              { title: "Samsung", href: "#" },
              { title: "Dell", href: "#" },
              { title: "Sony", href: "#" },
            ],
          },
        ],
      },
    ],
  },
  {
    title: "Smartphones",
    href: "/smartphones",
    items: [
      {
        title: "All Smartphones",
        href: "#",
        featured: [
          {
            title: "iPhone 14",
            href: "#",
            description: "Latest model with amazing camera",
          },
          {
            title: "Samsung S23",
            href: "#",
            description: "Premium Android experience",
          },
        ],
        categories: [
          {
            title: "Apple",
            items: [
              { title: "iPhone 14", href: "#" },
              { title: "iPhone 13", href: "#" },
              { title: "iPhone 12", href: "#" },
              { title: "iPhone SE", href: "#" },
            ],
          },
          {
            title: "Samsung",
            items: [
              { title: "Galaxy S23", href: "#" },
              { title: "Galaxy S22", href: "#" },
              { title: "Galaxy A53", href: "#" },
              { title: "Galaxy Fold", href: "#" },
            ],
          },
        ],
      },
    ],
  },
];
