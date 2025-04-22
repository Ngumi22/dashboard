"use server";

import { fetchProductsAndFilters } from "./Product/fetchByFilters";

// Types
export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  specifications: Record<string, string | number | boolean>;
  image?: string;
};

export type SearchSuggestion = {
  id: string;
  name: string;
  displayName: string;
  type: "product" | "category" | "brand" | "specification";
  image?: string;
};

/**
 * Fetch products and normalize data
 */
export async function getProducts(): Promise<Product[]> {
  try {
    const { products } = await fetchProductsAndFilters({});

    return products.map((product) => ({
      id: String(product.id),
      name: product.name || "Unknown Product",
      description: product.description || "No description",
      price: product.price ?? 0,
      category: product.category_name || "Unknown Category",
      brand: product.brand_name || "Unknown Brand",
      specifications: (product.specifications ?? []).reduce(
        (acc, spec) => {
          const key = spec?.specification_name?.toLowerCase?.();
          if (
            key &&
            spec.specification_value !== null &&
            spec.specification_value !== undefined
          ) {
            acc[`spec_${key}`] = spec.specification_value;
          }
          return acc;
        },
        {} as Record<string, string | number | boolean>
      ),
      image: product.main_image || undefined,
    }));
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Failed to fetch products");
  }
}

/**
 * Get unique categories and brands
 */
async function getCategoriesAndBrands(products: Product[]) {
  const safeLower = (val: string | undefined | null) =>
    val?.toLowerCase?.().replace(/\s+/g, "-") || "unknown";

  const categories = [
    ...new Set(products.map((p) => p.category || "Unknown Category")),
  ].map((name) => ({
    id: safeLower(name),
    name,
    displayName: name,
    type: "category" as const,
  }));

  const brands = [
    ...new Set(products.map((p) => p.brand || "Unknown Brand")),
  ].map((name) => ({
    id: safeLower(name),
    name,
    displayName: name,
    type: "brand" as const,
  }));

  return { categories, brands };
}

/**
 * Extract unique specifications from all products
 */
async function getSpecifications(
  products: Product[]
): Promise<SearchSuggestion[]> {
  const specs: SearchSuggestion[] = [];
  const seen = new Set<string>();

  for (const product of products) {
    for (const [key, value] of Object.entries(product.specifications || {})) {
      if (!key || value === null || value === undefined) continue;

      const cleanKey = key.replace(/^spec_/, "");
      const valStr = String(value).trim();
      const combined = `${cleanKey}:${valStr}`;
      const lowerCombined = combined.toLowerCase();

      if (!seen.has(lowerCombined)) {
        seen.add(lowerCombined);
        specs.push({
          id: `spec-${lowerCombined.replace(/\s+/g, "-")}`,
          name: combined,
          displayName: valStr,
          type: "specification",
        });
      }
    }
  }

  return specs;
}

/**
 * Get search suggestions
 */
export async function getSuggestions(
  query: string
): Promise<SearchSuggestion[]> {
  try {
    await new Promise((r) => setTimeout(r, 100));
    if (!query) return [];

    const normalizedQuery = query.toLowerCase().trim();
    const products = await getProducts();
    const { categories, brands } = await getCategoriesAndBrands(products);
    const specifications = await getSpecifications(products);

    const searchInArray = <T extends { name: string }>(items: T[], q: string) =>
      items.filter((item) => item?.name?.toLowerCase?.().includes(q));

    const formatProduct = (product: Product): SearchSuggestion => ({
      id: product.id,
      name: product.name,
      displayName: product.name,
      type: "product",
      image: product.image,
    });

    const matchingProducts = searchInArray(
      products.map(formatProduct),
      normalizedQuery
    );
    const matchingCategories = searchInArray(categories, normalizedQuery);
    const matchingBrands = searchInArray(brands, normalizedQuery);
    const matchingSpecs = searchInArray(specifications, normalizedQuery);

    const exactMatches = [
      ...matchingProducts,
      ...matchingSpecs,
      ...matchingCategories,
      ...matchingBrands,
    ].filter((item) => item.name.toLowerCase() === normalizedQuery);

    const partialMatches = [
      ...matchingProducts,
      ...matchingSpecs,
      ...matchingCategories,
      ...matchingBrands,
    ].filter((item) => item.name.toLowerCase() !== normalizedQuery);

    return [...exactMatches, ...partialMatches].slice(0, 10);
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    throw new Error("Failed to fetch suggestions");
  }
}

/**
 * Search products by query, category, brand, specification
 */
export async function searchProducts(params: {
  search?: string;
  name?: string;
  category?: string;
  brand?: string;
  spec?: string;
  page?: number;
  limit?: number;
}) {
  try {
    const {
      search = "",
      name = "",
      category = "",
      brand = "",
      spec = "",
      page = 1,
      limit = 10,
    } = params || {};

    await new Promise((r) => setTimeout(r, 200));

    const products = await getProducts();
    const normalizedSearch = search.toLowerCase().trim();
    const normalizedSpec = spec.toLowerCase().trim();

    let filtered = products.filter((product) => {
      const matchesSearch =
        !search ||
        [
          product.name,
          product.description,
          product.brand,
          product.category,
          ...Object.keys(product.specifications),
          ...Object.values(product.specifications).map(String),
        ].some((val) => val?.toLowerCase?.().includes(normalizedSearch));

      const matchesName =
        !name || product.name.toLowerCase().includes(name.toLowerCase());
      const matchesCategory =
        !category || product.category.toLowerCase() === category.toLowerCase();
      const matchesBrand =
        !brand || product.brand.toLowerCase() === brand.toLowerCase();

      const matchesSpec =
        !spec ||
        Object.entries(product.specifications).some(([key, value]) => {
          const combined =
            `${key.replace(/^spec_/, "")}:${String(value)}`.toLowerCase();
          return combined === normalizedSpec;
        });

      return (
        matchesSearch &&
        matchesName &&
        matchesCategory &&
        matchesBrand &&
        matchesSpec
      );
    });

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / limit);
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    return {
      products: paginated,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    };
  } catch (error) {
    console.error("Error searching products:", error);
    throw new Error("Failed to search products");
  }
}

/**
 * Get single product by ID
 */
export async function getProductById(id: string) {
  try {
    if (!id) return null;
    await new Promise((r) => setTimeout(r, 100));
    const products = await getProducts();
    return products.find((product) => product.id === id) || null;
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    throw new Error("Failed to fetch product by ID");
  }
}
