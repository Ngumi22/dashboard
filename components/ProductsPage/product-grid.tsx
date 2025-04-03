import { Product } from "@/lib/actions/Product/search-params";
import ProductCard from "../Product/ProductCards/product-card";

interface ProductGridProps {
  products: Product[];
  gridLayout: number;
  isLoading?: boolean;
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

export function ProductGrid({ products, gridLayout }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center space-y-3 py-12">
        <p className="text-center text-lg font-medium">No products found</p>
        <p className="text-center text-muted-foreground">
          Try adjusting your search or filter to find what you are looking for.
        </p>
      </div>
    );
  }

  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

  return (
    <div
      className={`px-4 md:p-0 grid gap-2 ${
        gridCols[gridLayout as keyof typeof gridCols]
      }`}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          name={product.name}
          description={product.description}
          price={product.price}
          discount={product.discount}
          quantity={product.quantity}
          main_image={product.main_image}
          ratings={product.ratings}
          specifications={product.specifications}
        />
      ))}
    </div>
  );
}
