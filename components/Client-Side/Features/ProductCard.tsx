import React from "react";
import Image from "next/image";

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
  created_at?: string;
  updatedAt?: string;
}

export interface CategoryData {
  name: string;
  bannerImages: BannerImage[];
  products: ProductCardProps[];
}

export interface BannerImage {
  src: string;
  alt: string;
  link?: string;
}

export interface TabbedScrollableSectionProps {
  categories: CategoryData[];
  className?: string;
  itemClassName?: string;
}

const ProductCards: React.FC<ProductCardProps> = ({
  name,
  price,
  main_image,
}) => {
  return (
    <div className="border rounded-lg p-4 flex flex-col bg-card text-card-foreground shadow-sm w-full h-full">
      <div className="relative w-full h-[200px] mb-4 rounded overflow-hidden">
        <Image
          src={main_image || "/placeholder.svg"}
          alt={name}
          layout="fill"
          objectFit="cover"
        />
      </div>
      <h3 className="font-semibold text-lg line-clamp-2">{name}</h3>
      <p className="text-muted-foreground mt-auto text-lg font-bold">{price}</p>
    </div>
  );
};

export default ProductCards;
