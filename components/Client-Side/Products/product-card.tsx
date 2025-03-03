import { Product } from "@/lib/actions/Product/search-params";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

export function ProductCard({
  product,
  gridView,
}: {
  product: Product;
  gridView: string;
}) {
  // Determine if we're in list view
  const isListView = gridView === "1";

  return (
    <Link
      href={`/products/${product.id}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-lg border bg-background transition-all hover:shadow-md h-full",
        isListView && "flex-row items-center gap-4"
      )}>
      <div
        className={cn(
          "relative aspect-square w-full overflow-hidden bg-muted",
          isListView && "aspect-square w-40 flex-shrink-0"
        )}>
        <Image
          src={product.main_image || "/placeholder.svg?height=400&width=400"}
          alt={product.name}
          width={400}
          height={400}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
          priority={false}
        />

        {product.discount > 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            {product.discount}% OFF
          </div>
        )}
      </div>

      <div
        className={cn(
          "flex flex-1 flex-col space-y-2 p-4",
          isListView && "h-full justify-between"
        )}>
        <div className="space-y-1">
          <h3 className="font-medium line-clamp-2">{product.name}</h3>

          <div className="flex items-center gap-2">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className="text-yellow-400">
                  {i < Math.floor(product.ratings) ? "★" : "☆"}
                </span>
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              ({product.ratings.toFixed(1)})
            </span>
          </div>

          {isListView && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {product.description}
            </p>
          )}

          {product.brand && (
            <p className="text-sm text-muted-foreground">
              {product.brand.brand_name}
            </p>
          )}
        </div>

        <div className="flex items-end justify-between mt-auto pt-2">
          <div className="flex flex-col">
            {product.discount > 0 ? (
              <>
                <span className="text-lg font-bold">
                  $
                  {(
                    product.price -
                    (product.price * product.discount) / 100
                  ).toFixed(2)}
                </span>
                <span className="text-sm text-muted-foreground line-through">
                  ${product.price.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
