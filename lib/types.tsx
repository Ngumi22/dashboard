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

// Categories
export type Category = {
  category_id: number;
  name: string;
  image: Buffer | null;
  description: string | null;
  created_at: string; // Use ISO string for date/time
  updated_at: string; // Use ISO string for date/time
  deleted_at: string | null;
  created_by: number | null;
  updated_by: number | null;
};

// Brands
export type Brand = {
  brand_id: number;
  name: string;
  brand_logo: Buffer | null;
  description: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: number | null;
  updated_by: number | null;
};

// Suppliers
export type Supplier = {
  supplier_id: number;
  name: string;
  contact_info: Record<string, any> | null; // JSON field
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: number | null;
  updated_by: number | null;
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
  specification_id: number;
  name: string;
  created_at: string;
  updated_at: string;
};

// Product Specifications
export type ProductSpecification = {
  product_spec_id: number;
  product_id: number;
  specification_id: number;
  value: string;
  created_at: string;
  updated_at: string;
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

// Variant Types
export type VariantType = {
  variant_type_id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: number | null;
  updated_by: number | null;
};

// Variants
export type Variant = {
  variant_id: number;
  product_id: number;
  variant_type_id: number;
  value: string;
  price: number | null;
  quantity: number;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: number | null;
  updated_by: number | null;
};

// Product Variant Images
export type ProductVariantImage = {
  product_variant_image_id: number;
  variant_id: number;
  image: Buffer; // non-nullable
  is_main: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: number | null;
  updated_by: number | null;
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
