import { Product, SearchParams } from "@/lib/actions/Product/searchTypes";
import ProductCard from "../Product/ProductCards/product-card";

interface ProductsGridProps {
  products: Product[];
  searchParams: SearchParams;
  gridCols: any;
}

export function ProductsGrid({ products, gridCols }: ProductsGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">No products found</h3>
        <p className="text-muted-foreground">
          Try adjusting your filters or search criteria.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className={`grid ${gridCols} gap-4 md:gap-6 mb-8`}>
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
            ratings={product.ratings} // Add other required properties here
            specifications={product.specifications?.map((spec) => ({
              specification_id: spec.specification_id || "",
              specification_name: spec.specification_name,
              specification_value: spec.specification_value,
              category_id: spec.category_id || "",
            }))}
          />
        ))}
      </div>
    </>
  );
}
