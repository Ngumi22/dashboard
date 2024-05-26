import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (amount: number) => {
  return (amount / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
};

export const formatDateToLocal = (
  dateStr: string,
  locale: string = "en-US"
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
