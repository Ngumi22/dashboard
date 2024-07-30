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

export interface UploadFormProps {
  initialData?: any;
  onSubmit: (data: FormData) => Promise<void>;
  isEdit: boolean;
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
}

export interface CategoryData {
  id: string;
  name: string;
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
}

export interface ProductsRow {
  product_id: number;
  name: string;
  sku: string;
  price: number;
  discount: number;
  quantity: number;
  category: string;
  status: string;
  description: string;
  brand: string;
  createdAt: Date;
  updatedAt: Date;
  main_image: string | null; // Store as Base64 string
  thumbnail1: string | null; // Store as Base64 string
  thumbnail2: string | null; // Store as Base64 string
  thumbnail3: string | null; // Store as Base64 string
  thumbnail4: string | null; // Store as Base64 string
  thumbnail5: string | null; // Store as Base64 string
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
}

export interface ProductFilter {
  minPrice?: number;
  maxPrice?: number;
  minDiscount?: number;
  maxDiscount?: number;
  name?: string;
  brand?: string;
  category?: string;
  status?: string;
  brands?: string;
}

export type SessionPayload = {
  userId: string | number;
  expiresAt: Date;
};

export type UserRow = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  password: string;
};
export type User = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  password: string;
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
        server?: string[];
      };
      success?: boolean;
      message?: string;
      userId?: number;
      sessionToken?: string;
    }
  | undefined;
