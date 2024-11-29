export type ProductData = {
  id: number;
  name: string;
  description?: string; // Optional, based on your schema
  shortDescription?: string; // Optional, based on your schema
  price: number;
  discount: number;
  quantity: number;
  status: "draft" | "pending" | "approved";
  categoryId: number; // Foreign key to categories
  brandId?: number; // Foreign key to brands, can be null
  supplierId?: number; // Foreign key to suppliers, can be null
  createdAt: string;
  updatedAt: string;
  images: {
    main: string; // Base64 string of the main image
    thumbnails: string[]; // Array of Base64 strings of thumbnails
  };
  tags?: number[]; // Array of tag IDs, based on your schema
  variants?: {
    id: number;
    typeId: number; // Foreign key to variant_types
    value: string;
    price?: number;
    quantity?: number;
    status?: "active" | "inactive";
  }[];
  specifications?: {
    id: number;
    name: string; // Name of the specification
    value: string; // Value of the specification
  }[];
};

export type ProductFormData = {
  name: string;
  sku: string;
  description: string;
  price: number;
  discount?: number;
  quantity: number;
  status?: "draft" | "pending" | "approved";
  categoryName: string;
  brandName: string;
  productImages: FormData;
  tags: [];
  suppliers: { name: string; contactInfo: string }[];
  variants: {
    variantTypeName: string;
    value: string;
    price: number;
    quantity: number;
    status: "active" | "inactive";
    variantImages: FormData;
  }[];
  createdBy: number;
  updatedBy: number;
};

// Categories
export type Category = {
  category_id: number;
  name: string;
  category_image: File; // Image file
  description: string;
  created_at: string; // ISO string format
  updated_at: string; // ISO string format
  deleted_at: string | null;
  created_by: number | null;
  updated_by: number | null;
};

// Brands
export type Brand = {
  brand_id: number;
  name: string;
  brand_logo: File;
  created_at: string; // Use ISO string for date/time
  updated_at: string; // Use ISO string for date/time
  deleted_at: string | null;
  created_by: number | null;
  updated_by: number | null;
};

export type ProductSupplier = {
  product_id: number;
  supplier_id: number;
  created_at: string; // Use ISO string for date/time
  updated_at: string; // Use ISO string for date/time
};

// Product Images
export type ProductImage = {
  product_image_id: number;
  product_id: number;
  image: Buffer; // non-nullable
  main_image: boolean;
  thumbnail_image: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: number | null;
  updated_by: number | null;
};

// Specifications
export type Specification = {
  specificationId?: number;
  name: string;
  value: string;
};

// Product Specifications
export type ProductSpecification = {
  product_spec_id: number;
  product_id: number;
  specification_id: number;
  value: string;
  created_at: string;
  updated_at: string;
  created_by: number | null;
  updated_by: number | null;
};

// Tags
export type Tag = {
  tag_id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: number | null;
  updated_by: number | null;
};

// Product Tags
export type ProductTag = {
  product_tag_id: number;
  product_id: number;
  tag_id: number;
};

// Type for Variant Type
type VariantType = {
  variant_type_id?: number;
  name: string;
  description?: string;
  created_by: number;
  updated_by: number;
};

// Type for Variant
type Variant = {
  variant_id?: number;
  product_id: number;
  variant_type_id: number;
  value: string;
  price?: number;
  quantity?: number;
  status?: "active" | "inactive";
  created_by: number;
  updated_by: number;
};

// Type for Product Variant Image
type ProductVariantImage = {
  variant_id: number;
  main_image: File | null;
  thumbnail_images: (File | null)[];
  created_by: number;
  updated_by: number;
};

// Customers
export type Customer = {
  customer_id: number;
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  active: boolean;
  registered_at: string;
  updated_at: string;
  deleted_at: string | null;
};

// Customer Addresses
export type CustomerAddress = {
  customer_address_id: number;
  customer_id: number;
  address_line1: string;
  address_line2: string | null;
  phone_number: string;
  dial_code: string;
  country: string;
  postal_code: string;
  city: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

// Coupons
export type Coupon = {
  coupon_id: number;
  code: string;
  discount_value: number | null;
  discount_type: string;
  times_used: number;
  max_usage: number | null;
  order_amount_limit: number | null;
  coupon_start_date: string | null;
  coupon_end_date: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: number | null;
  updated_by: number | null;
};

// Product Coupons
export type ProductCoupon = {
  product_coupon_id: number;
  product_id: number;
  coupon_id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: number | null;
  updated_by: number | null;
};

export interface UploadFormProps {
  initialData?: any;
  onSubmit: (data: FormData) => Promise<void>;
  isEdit: boolean;
}

export type Supplier = {
  supplier_id: number;
  name: string;
  contact_info: {
    phone?: string;
    address?: string;
    email: string;
  };
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
  created_by?: number | null;
  updated_by?: number | null;
};

export type NewSupplier = {
  name: string;
  contact_info: {
    phone?: string;
    address?: string;
    email: string;
  };
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
  created_by: number | null; // Ensure this is either number or null
  updated_by: number | null; // Ensure this is either number or null
};

// Update the form supplier type
export type SupplierFormData = {
  supplier: Supplier | null; // Existing supplier or null
  newSupplier: NewSupplier | null; // New supplier or null
};

export interface AddProductImagesFormProps {
  onImagesValidated: (images: {
    mainImage: File | null;
    thumbnails: File[];
  }) => void;
}

//to be used across the app

export type FormValues = {
  name: string;
  sku: string;
  description: string;
  price: string;
  quantity: string;
  discount: string;
  status: string;
  tags: string[];
  supplier: Supplier | { supplier: null }; // Handles both existing and new supplier cases
  newSupplier?: {
    name: string;
    contact_info: {
      phone: string;
      address: string;
      email: string;
    };
  };
};

export interface Carousel {
  carousel_id?: number;
  title: string;
  short_description?: string;
  button_text?: string;
  button_link?: string;
  image?: File;
  position: number;
  status: "active" | "inactive";
}

export interface Banner {
  banner_id?: number;
  title: string;
  description?: string;
  link?: string;
  image?: File;
  text_color: string;
  background_color: string;
  status: "active" | "inactive";
}

export interface ProductResponse {
  id: string | number;
  name: string;
  sku: string;
  price: number;
  discount: number;
  quantity: number;
  category: string;
  status: "approved" | "draft" | "pending";
  description: string;
  brand: string;
  createdAt: string;
  updatedAt: string;
  images: {
    mainImage: string | null;
    thumbnails: (string | null)[];
  };
  tags: string[];
}
