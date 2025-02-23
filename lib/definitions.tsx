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
  created_at: string;
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
  created_at: string;
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
  created_at: string;
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

export interface ScrollableItemProps {
  id: string | number;
  content: any;
}

export interface ScrollableSectionProps {
  title: string;
  items: ScrollableItemProps[];
  className?: string;
  itemClassName?: string;
  banner?: BannerProps;
}

export type ProductStatus = "draft" | "pending" | "approved";
export interface ProductCardProps {
  id: number;
  name: string;
  sku: string;
  description: string;
  price: number;
  quantity: number;
  discount: number;
  status: ProductStatus;
  tags?: string[];
  main_image: string;
  thumbnails: {
    thumbnail1: string;
    thumbnail2: string;
    thumbnail3: string;
    thumbnail4: string;
    thumbnail5: string;
  }[];
  category_id: string;
  brand: {
    brand_id: string;
    brand_name: string;
    brand_image: string;
  };
  specifications: {
    specification_id: string;
    specification_name: string;
    specification_value: string;
    category_id: string;
  }[];
  suppliers: {
    supplier_id?: number;
    supplier_name?: string;
    supplier_email?: string;
    supplier_phone_number?: string;
    supplier_location?: string;
    isNew?: boolean;
  }[];
  ratings: number;
  created_at: string;
  updatedAt?: string;
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

export interface CategoryData {
  name: string;
  products: MinimalProduct[];
}

export interface BannerImage {
  src: string;
  alt: string;
  link?: string;
}

export type MinimalProduct = {
  id: number;
  name: string;
  description: string;
  price: number;
  main_image: string;
  ratings: number;
  discount: number;
  quantity: number;
  created_at: string;
  category_id: string;
};

export interface TabbedScrollableSectionProps {
  categories: CategoryData[];
  className?: string;
  itemClassName?: string;
  onCategorySelect: any;
}

export interface SubCategory {
  title: string;
  href: string;
  imageUrl?: string;
}

export interface Category {
  title: string;
  href: string;
  items?: SubCategory[];
}
