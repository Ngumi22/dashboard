import { useState, useMemo, useEffect, useCallback } from "react";
import {
  useBrandsQuery,
  useBrandProductsQuery,
} from "@/lib/actions/Hooks/useBrand";
import ProductCard, {
  ProductCardSkeleton,
} from "@/components/Product/ProductCards/product-card";
import ScrollableTabbedSection from "@/components/Client-Side/Features/TabbedScrollableSection";

export default function ShopByBrand() {
  const { data: brands = [], isLoading: isBrandsLoading } = useBrandsQuery();
  const [activeTab, setActiveTab] = useState<string | null>(null);

  useEffect(() => {
    if (!activeTab && brands.length > 0) {
      setActiveTab("Apple");
    }
  }, [brands, activeTab]); // Add activeTab to the dependency array

  const { data: brandProducts, isLoading: isProductsLoading } =
    useBrandProductsQuery(activeTab ?? "");

  const tabs = useMemo(() => {
    if (!brands.length) return [];

    return brands.map((brand) => ({
      id: brand.brand_name,
      label: brand.brand_name,
      products:
        brandProducts?.products
          ?.filter(
            (product) =>
              product.brand_id.toString() === brand.brand_id.toString()
          )
          ?.sort((a, b) => b.discount - a.discount)
          ?.slice(0, 5) || [],
    }));
  }, [brands, brandProducts]);

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId);
  }, []);

  return (
    <section>
      {activeTab && (
        <ScrollableTabbedSection
          title="Shop By Brand"
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          ProductCard={ProductCard}
          ProductCardSkeleton={ProductCardSkeleton}
        />
      )}
    </section>
  );
}
