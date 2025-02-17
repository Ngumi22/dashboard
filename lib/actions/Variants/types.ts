export interface Variant {
  variant_id: number;
  product_id: number;
  variant_price: number;
  variant_quantity: number;
  variant_status: "active" | "inactive";
  created_at: string;
  updated_at: string;
  specifications: Array<{
    specificationId: number;
    specificationName: string;
    variantValueId: number;
    variantValue: string;
  }>;
  images: Array<{
    imageId: number;
    imageType: string;
    imageData: string;
  }>;
}

export interface VariantImage {
  variant_image_id: number;
  variant_id: number;
  image_data: string; // Base64-encoded image
  image_type: "full" | "thumbnail";
  created_at: string;
  updated_at: string;
}
