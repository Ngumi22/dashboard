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
  main_image: Buffer;
  thumbnail1: Buffer | null;
  thumbnail2: Buffer | null;
  thumbnail3: Buffer | null;
  thumbnail4: Buffer | null;
  thumbnail5: Buffer | null;
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
}
