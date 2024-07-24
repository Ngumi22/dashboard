"use client";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { ProductData, Product, ProductRow } from "@/lib/definitions";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

export const checkTokenExpiry = () => {
  const router = useRouter();

  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      router.push("/login");
      return;
    }

    const decodedToken: any = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    if (decodedToken.exp < currentTime) {
      router.push("/login");
    } else {
      const timeout = (decodedToken.exp - currentTime) * 1000;
      setTimeout(() => {
        router.push("/login");
      }, timeout);
    }
  }, [router]);
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (amount: number) => {
  return (amount / 100).toLocaleString("en-KE", {
    style: "currency",
    currency: "KSH",
  });
};

export function sanitizeInput(input: string | number): string | number {
  if (typeof input === "string") {
    return input.replace(/'/g, "\\'");
  }
  return input;
}

export const formatDateToLocal = (
  dateStr: string,
  locale: string = "en-KE"
) => {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  };
  const formatter = new Intl.DateTimeFormat(locale, options);
  return formatter.format(date);
};

export function validateFiles(files: File[]): {
  valid: boolean;
  message?: string;
} {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/jpg"];
  const maxSize = 100 * 1024; // Images cannot be more 100KB in size

  for (const file of files) {
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, message: "Invalid file type" };
    }
    if (file.size > maxSize) {
      return {
        valid: false,
        message: `File size exceeds 100KB limit: ${file.name}`,
      };
    }
  }
  return { valid: true };
}

// Utility function to convert binary data to base64
export const convertToBase64 = (buffer: Buffer | null) =>
  buffer ? buffer.toString("base64") : "";

export const generatePagination = (currentPage: number, totalPages: number) => {
  // If the total number of pages is 10 or less,
  // display all pages without any ellipsis.
  if (totalPages <= 10) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // If the current page is among the first 3 pages,
  // show the first 3, an ellipsis, and the last 2 pages.
  if (currentPage <= 3) {
    return [1, 2, 3, "...", totalPages - 1, totalPages];
  }

  // If the current page is among the last 3 pages,
  // show the first 2, an ellipsis, and the last 3 pages.
  if (currentPage >= totalPages - 2) {
    return [1, 2, "...", totalPages - 2, totalPages - 1, totalPages];
  }

  // If the current page is somewhere in the middle,
  // show the first page, an ellipsis, the current page and its neighbors,
  // another ellipsis, and the last page.
  return [
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
  ];
};

export const searchProducts = (
  products: ProductData[] | undefined,
  searchTerm: string
): ProductData[] => {
  if (!products) return [];

  return products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

// Filter function
export const filterProducts = (
  products: ProductData[],
  status: string
): ProductData[] => {
  if (status === "all") return products;
  return products?.filter((product) => product.status.toLowerCase() === status);
};

const validateParams = (params: Record<string, string | null>): boolean => {
  // Ensure all values are either null or strings
  for (const key in params) {
    if (params[key] !== null && typeof params[key] !== "string") {
      return false;
    }
  }

  const { minPrice, maxPrice, minDiscount, maxDiscount } = params;

  const isPositiveNumber = (value: string | null): boolean => {
    if (value === null) return true;
    const number = Number(value);
    return !isNaN(number) && number >= 0;
  };

  if (minPrice && !isPositiveNumber(minPrice)) return false;
  if (maxPrice && !isPositiveNumber(maxPrice)) return false;
  if (minPrice && maxPrice && Number(minPrice) > Number(maxPrice)) return false;

  if (minDiscount && !isPositiveNumber(minDiscount)) return false;
  if (maxDiscount && !isPositiveNumber(maxDiscount)) return false;
  if (minDiscount && maxDiscount && Number(minDiscount) > Number(maxDiscount))
    return false;

  return true;
};

export default validateParams;

export function mapProductRow(row: ProductRow): Product {
  return {
    id: row.product_id,
    sku: row.sku,
    status: row.status,
    category: row.category,
    name: row.name,
    description: row.description,
    brand: row.brand,
    price: row.price,
    discount: row.discount,
    quantity: row.quantity,
    createdAt: formatDateToLocal(row.createdAt),
    updatedAt: formatDateToLocal(row.updatedAt),
    images: {
      main: convertToBase64(row.main_image),
      thumbnails: [
        row.thumbnail1,
        row.thumbnail2,
        row.thumbnail3,
        row.thumbnail4,
        row.thumbnail5,
      ]
        .filter(Boolean)
        .map(convertToBase64),
    },
  };
}
