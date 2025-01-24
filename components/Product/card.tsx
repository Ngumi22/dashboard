import type React from "react";
import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface Action {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

interface ProductCardProps {
  imageSrc: string;
  imageAlt: string;
  title: string;
  description?: string;
  price: string;
  discountedPrice?: string;
  badge?: string;
  rating?: number;
  ratingCount?: number;
  actionLabel?: string;
  onActionClick?: () => void;
  actions?: Action[];
  orientation?: "vertical" | "horizontal";
  className?: string;
  imageClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  priceClassName?: string;
  badgeClassName?: string;
  ratingClassName?: string;
  actionClassName?: string;
  actionsClassName?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  imageSrc,
  imageAlt,
  title,
  description,
  price,
  discountedPrice,
  badge,
  rating,
  ratingCount,
  actionLabel = "Add to Cart",
  onActionClick,
  actions = [],
  orientation = "vertical",
  className,
  imageClassName,
  titleClassName,
  descriptionClassName,
  priceClassName,
  badgeClassName,
  ratingClassName,
  actionClassName,
  actionsClassName,
}) => {
  const [showActions, setShowActions] = useState(false);

  const isHorizontal = orientation === "horizontal";

  return (
    <div
      className={cn(
        "bg-white rounded-lg shadow-md overflow-hidden relative",
        isHorizontal ? "flex" : "block",
        className
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}>
      <div className={cn("relative", isHorizontal ? "w-1/3" : "w-full")}>
        <Image
          src={imageSrc || "/placeholder.svg"}
          alt={imageAlt}
          width={300}
          height={300}
          className={cn(
            "w-full object-cover",
            isHorizontal ? "h-full" : "h-48",
            imageClassName
          )}
        />
        {badge && (
          <span
            className={cn(
              "absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs font-bold rounded",
              badgeClassName
            )}>
            {badge}
          </span>
        )}
        {actions.length > 0 && (
          <div
            className={cn(
              "absolute top-2 right-2 flex gap-2 transition-opacity duration-300",
              isHorizontal ? "flex-row" : "flex-col",
              showActions ? "opacity-100" : "opacity-0",
              actionsClassName
            )}>
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className="bg-white text-gray-800 rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
                title={action.label}>
                {action.icon}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className={cn("p-4", isHorizontal ? "w-2/3" : "w-full")}>
        <h3 className={cn("text-lg font-semibold mb-2", titleClassName)}>
          {title}
        </h3>
        {description && (
          <p className={cn("text-gray-600 text-sm mb-2", descriptionClassName)}>
            {description}
          </p>
        )}
        <div
          className={cn(
            "flex items-center justify-between mb-2",
            priceClassName
          )}>
          <span className="font-bold text-lg">{price}</span>
          {discountedPrice && (
            <span className="text-gray-500 line-through">
              {discountedPrice}
            </span>
          )}
        </div>
        {rating !== undefined && (
          <div className={cn("flex items-center mb-2", ratingClassName)}>
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${
                  i < rating ? "text-yellow-400" : "text-gray-300"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            {ratingCount !== undefined && (
              <span className="text-gray-600 text-sm ml-1">
                ({ratingCount})
              </span>
            )}
          </div>
        )}
        <button
          onClick={onActionClick}
          className={cn(
            "w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors",
            actionClassName
          )}>
          {actionLabel}
        </button>
      </div>
    </div>
  );
};
