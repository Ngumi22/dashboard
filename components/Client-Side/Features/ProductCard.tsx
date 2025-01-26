import React from "react";
import Image from "next/image";

export interface ProductCardProps {
  id: string | number;
  title: string;
  price: string;
  imageUrl: string;
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
  title,
  price,
  imageUrl,
}) => {
  return (
    <div className="border rounded-lg p-4 flex flex-col bg-card text-card-foreground shadow-sm w-full h-full">
      <div className="relative w-full h-[200px] mb-4 rounded overflow-hidden">
        <Image
          src={imageUrl || "/placeholder.svg"}
          alt={title}
          layout="fill"
          objectFit="cover"
        />
      </div>
      <h3 className="font-semibold text-lg line-clamp-2">{title}</h3>
      <p className="text-muted-foreground mt-auto text-lg font-bold">{price}</p>
    </div>
  );
};

export default ProductCards;
