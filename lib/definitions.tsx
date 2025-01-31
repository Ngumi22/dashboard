import { z } from "zod";

export interface FileData {
  main_image: File;
  thumbnail1: File;
  thumbnail2: File;
  thumbnail3: File;
  thumbnail4: File;
  thumbnail5: File;
  fields: {
    sku: string;
    name: string;
    description: string;
    category: string;
    status: "Archived" | "Active" | "Draft";
    price: number;
    discount: number;
    quantity: number;
    brand: string;
  };
}

export interface ProductData {
  id: number;
  sku: string;
  price: number;
  discount: number;
  brand: string;
  quantity: number;
  status: string;
  category: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  images: {
    main: string; // Base64 string of main image
    thumbnails: string[]; // Array of Base64 strings of thumbnails
  };
  tags?: string[];
}

export interface UploadFormProps {
  initialData?: any;
  onSubmit: (data: FormData) => Promise<void>;
  isEdit: boolean;
}

export interface BrandWithProducts {
  brand: string;
  products: ProductRow[];
}

export interface ProductRow {
  product_id: string;
  name: string;
  sku: string;
  price: number;
  discount: number;
  quantity: number;
  category: string;
  status: string;
  description: string;
  brand: string;
  createdAt: string;
  updatedAt: string;
  main_image: Buffer | null;
  thumbnail1: Buffer | null;
  thumbnail2: Buffer | null;
  thumbnail3: Buffer | null;
  thumbnail4: Buffer | null;
  thumbnail5: Buffer | null;
  tagId: string | null;
  tagName: string | null;
  tags: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  discount: number;
  quantity: number;
  category: string;
  status: string;
  description: string;
  brand: string;
  createdAt: string;
  updatedAt: string;
  images: {
    main: string;
    thumbnails: string[];
  };
  tags: string[];
}

export interface SearchParams {
  id?: number;
  minPrice?: number;
  maxPrice?: number;
  minDiscount?: number;
  maxDiscount?: number;
  name?: string;
  brand?: string;
  category?: string;
  status?: string;
  brands?: string;
  tags?: string;
}

export type UserRow = {
  id: number;
  name: string;
  email: string;
  role: string;
};
export type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export type SignUpResponseSuccess = {
  success: true;
  message: string;
  userId: number;
  sessionToken: string;
};

export type SignUpResponseError = {
  success: false;
  errors: {
    first_name?: string[];
    last_name?: string[];
    role?: string[];
    email?: string[];
    password?: string[];
    password1?: string[];
  };
};
export type SignUpResponse = SignUpResponseSuccess | SignUpResponseError;

export const LoginFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(1, { message: "Password field must not be empty." }),
});

export type FormState =
  | {
      errors?: {
        first_name?: string[];
        last_name?: string[];
        role?: string[];
        email?: string[];
        password?: string[];
        password1?: string[];
        server?: string[];
      };
      success?: boolean;
      message?: string;
      userId?: number;
      sessionToken?: string;
    }
  | undefined;

export type SessionPayload = {
  userId: string | number;
  expiresAt: Date;
};

import type { ReactNode } from "react";

export interface ScrollableItemProps {
  id: string | number;
  content: ReactNode;
}

export interface ScrollableSectionProps {
  title: string;
  items: ScrollableItemProps[];
  className?: string;
  itemClassName?: string;
  banner?: BannerProps;
}

export interface BannerProps {
  images: BannerImage[];
  interval?: number;
  height?: number | string;
  width?: number | string;
  className?: string;
  imageClassName?: string;
}

export interface BannerImage {
  src: string;
  alt: string;
  link?: string;
}

export interface ProductCardProps {
  id: string | number;
  title: string;
  price: string;
  imageUrl: string;
}

export interface CategoryData {
  name: string;
  products: ProductCardProps[];
}

export interface BannerImage {
  src: string;
  alt: string;
  link?: string;
}

export interface ProductCardProps {
  id: string | number;
  title: string;
  price: string;
  imageUrl: string;
}

export interface TabbedScrollableSectionProps {
  categories: CategoryData[];
  className?: string;
  itemClassName?: string;
}

export interface SubMenuItem {
  title: string;
  href: string;
  imageUrl?: string;
}

export interface NavigationItem {
  title: string;
  href: string;
  items?: SubMenuItem[];
}
