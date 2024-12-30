export interface Supplier {
  supplier_id?: number;
  supplier_name?: string;
  supplier_email?: string;
  supplier_phone_number?: string;
  supplier_location?: string;
  isNew?: boolean;
}

export interface Brand {
  brand_id: number;
  brand_name: string;
}

export interface Product {
  product_id: number;
  product_name: string;
  product_sku: string;
  product_description: string;
  product_price: number;
  product_quantity: number;
  product_discount: number;
  product_status: "draft" | "pending" | "approved";
  tags: string[];
  main_image: File | null;
  thumbnails: File[];
  brand_id: string;
  brand_name: string;
  brand_image: File | null;
  category_id: string;
  suppliers: Supplier[];
  specifications: {
    specification_name: string;
    specification_value: string;
    category_id: string;
  }[];
}

export interface Category {
  category_id: string;
  category_name: string;
}

export interface ProductFormProps {
  initialData?: Partial<Product>;
}
