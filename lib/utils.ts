import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import * as z from "zod";

import {
  ProductData,
  Product,
  ProductRow,
  UserRow,
  User,
} from "@/lib/definitions";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getErrorMessage = (error: unknown, context?: string): string => {
  let message: string;
  let errorDetails: string | undefined = undefined;

  if (error instanceof Error) {
    // Standard JavaScript Error object
    message = error.message;
    errorDetails = error.stack; // Capture stack trace for server-side debugging
  } else if (error && typeof error === "object" && "message" in error) {
    // If it's an object with a message property (e.g., custom error object)
    message = String((error as { message: unknown }).message);
    errorDetails = JSON.stringify(error); // Capture the full error object for debugging
  } else if (typeof error === "string") {
    // If it's just a plain string error message
    message = error;
  } else {
    // Fallback error message for unknown types
    message = "Something went wrong";
  }

  // Add additional context if available
  if (context) {
    message = `[Context: ${context}] ${message}`;
  }

  // Log the error for debugging (in server logs)
  if (errorDetails) {
    console.error("Error Details:", errorDetails); // Logs detailed stack trace or object info
  }

  // Optionally, you could send the detailed error stack to an error logging service in a production environment
  // e.g., Sentry, LogRocket, etc.

  return message;
};

// Helper function to convert File to Buffer
export async function fileToBuffer(file: File): Promise<Buffer> {
  try {
    // Check if file is provided and is an instance of File
    if (!file || !(file instanceof File)) {
      throw new Error("Invalid file input.");
    }

    console.log(
      "Processing file:",
      file.name,
      "Size:",
      file.size,
      "Type:",
      file.type
    );

    // Convert the file to an ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Return a Buffer from the ArrayBuffer
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error("Error in fileToBuffer:", error);
    throw new Error("Failed to convert file to buffer.");
  }
}

export function parseNumberField(
  formData: FormData,
  key: string
): number | undefined {
  const value = formData.get(key);
  if (typeof value === "string") {
    const parsedValue = Number(value);
    if (isNaN(parsedValue)) {
      throw new Error(`Invalid ${key} data: not a number.`);
    }
    return parsedValue;
  }
  return undefined;
}

export const formatCurrency = (amount: number) => {
  return (amount / 100).toLocaleString("en-KE", {
    style: "currency",
    currency: "Ksh",
  });
};

export function sanitizeInput(input: string | number): string | number {
  if (typeof input === "string") {
    return input.replace(/'/g, "\\'");
  }
  return input;
}

function formatDateToLocal(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    console.error(`Invalid date value: ${dateString}`);
    return "";
  }
  return date.toLocaleDateString(); // Adjust as needed
}

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

export function validateImage(file: File | File[] | null | undefined): {
  valid: boolean;
  message?: string;
} {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/jpg"];
  const maxSize = 100 * 1024; // Images cannot be more 100KB in size

  if (!file) {
    return { valid: false, message: "No file provided" };
  }

  const files = Array.isArray(file) ? file : [file];

  for (const f of files) {
    if (!allowedTypes.includes(f.type)) {
      return { valid: false, message: `Invalid file type: ${f.type}` };
    }
    if (f.size > maxSize) {
      return {
        valid: false,
        message: `File size exceeds 100KB limit: ${f.name}`,
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
    tags: row.tags ? row.tags.split(",") : [], // Convert comma-separated tags to an array of strings
  };
}

export function mapUserRow(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
  };
}

const passwordSchema = z
  .string()
  .min(4, { message: "Password must be at least 4 characters long." })
  .regex(/[a-z]/, {
    message: "Password must contain at least one lowercase letter.",
  })
  .regex(/[A-Z]/, {
    message: "Password must contain at least one uppercase letter.",
  })
  .regex(/\d/, { message: "Password must contain at least one number." })
  .regex(/[@$!%*?&]/, {
    message: "Password must contain at least one special character.",
  });

export const signUpSchema = z
  .object({
    first_name: z.string().min(2, "Name must be at least 2 characters long"),
    last_name: z.string().min(2, "Name must be at least 2 characters long"),
    role: z.enum(["Admin", "User"]),
    email: z.string().email("Invalid email address"),
    password: passwordSchema,
    password1: passwordSchema,
  })
  .refine((data) => data.password === data.password1, {
    message: "Passwords must match",
    path: ["password1"],
  });

// Caching
type CacheOptions = {
  ttl?: number; // Time-to-live in seconds
};

export const getCachedData = <T>(key: string): T | null => {
  try {
    const data = localStorage.getItem(key);
    if (!data) return null;

    const parsed = JSON.parse(data);
    const now = Date.now();

    // If TTL is defined and expired, remove the cache and return null
    if (parsed.expiry && parsed.expiry < now) {
      localStorage.removeItem(key);
      return null;
    }

    return parsed.value as T;
  } catch (e) {
    console.error("Error reading from cache:", e);
    return null;
  }
};

export const setCachedData = (
  key: string,
  data: any,
  options?: CacheOptions
): void => {
  try {
    const cacheEntry = {
      value: data,
      expiry: options?.ttl ? Date.now() + options.ttl * 1000 : null, // Calculate expiry in ms
    };
    localStorage.setItem(key, JSON.stringify(cacheEntry));
  } catch (e) {
    console.error("Error writing to cache:", e);
  }
};
