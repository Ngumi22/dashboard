"use server";

import { fetchProductsAndFilters } from "./Product/fetchByFilters";

// Types for our data
type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  specifications: {
    [key: string]: string | number | boolean;
  };
  image?: string;
};

type SearchSuggestion = {
  id: string;
  name: string; // Key-value pair for URL construction
  displayName: string; // Only the value for display
  type: "product" | "category" | "brand" | "specification";
  image?: string;
};

/**
 * Fetch products from the database and transform specifications
 */
export async function getProducts(): Promise<Product[]> {
  try {
    const { products } = await fetchProductsAndFilters({});
    return products.map((product) => ({
      id: product.id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category_name,
      brand: product.brand_name,
      specifications: product.specifications.reduce((acc, spec) => {
        // Prefix specification keys with "spec_"
        acc[`spec_${spec.specification_name.toLowerCase()}`] =
          spec.specification_value;
        return acc;
      }, {} as { [key: string]: string | number | boolean }),
      image: product.main_image,
    }));
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Failed to fetch products");
  }
}

/**
 * Get unique categories and brands from products
 */
async function getCategoriesAndBrands(products: Product[]) {
  const categories = [...new Set(products.map((p) => p.category))].map(
    (name) => ({
      id: name.toLowerCase().replace(/\s+/g, "-"),
      name,
      displayName: name, // Add displayName for categories
      type: "category" as const,
    })
  );

  const brands = [...new Set(products.map((p) => p.brand))].map((name) => ({
    id: name.toLowerCase().replace(/\s+/g, "-"),
    name,
    displayName: name, // Add displayName for brands
    type: "brand" as const,
  }));

  return { categories, brands };
}

/**
 * Extract all specifications as searchable items
 */
async function getSpecifications(
  products: Product[]
): Promise<SearchSuggestion[]> {
  const specifications: SearchSuggestion[] = [];
  const seenSpecs = new Set<string>(); // Track seen specifications to avoid duplicates

  products.forEach((product) => {
    Object.entries(product.specifications).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        const specKey = key.replace("spec_", ""); // Remove the "spec_" prefix
        const specValue = String(value);
        const specName = `${specKey}:${specValue}`; // Combine key and value
        const normalizedSpec = specName.toLowerCase();

        if (!seenSpecs.has(normalizedSpec)) {
          seenSpecs.add(normalizedSpec);
          specifications.push({
            id: `spec-${normalizedSpec.replace(/\s+/g, "-")}`,
            name: specName, // Store key and value for URL construction
            displayName: specValue, // Store only the value for display
            type: "specification",
          });
        }
      }
    });
  });

  return specifications;
}

/**
 * Get search suggestions based on input query
 */
export async function getSuggestions(
  query: string
): Promise<SearchSuggestion[]> {
  try {
    // Simulate server delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    if (!query) return [];

    const normalizedQuery = query.toLowerCase().trim();

    // Fetch real products from the database
    const products = await getProducts();

    // Get categories, brands, and specifications
    const { categories, brands } = await getCategoriesAndBrands(products);
    const specifications = await getSpecifications(products);

    // Search products, categories, brands, and specifications
    const searchInArray = <T extends { name: string }>(
      items: T[],
      query: string
    ) => items.filter((item) => item.name.toLowerCase().includes(query));

    const matchingProducts = searchInArray(
      products.map((product) => ({
        id: product.id,
        name: product.name,
        displayName: product.name, // Add displayName for products
        type: "product" as const,
        image: product.image,
      })),
      normalizedQuery
    );

    const matchingCategories = searchInArray(categories, normalizedQuery);
    const matchingBrands = searchInArray(brands, normalizedQuery);
    const matchingSpecs = searchInArray(specifications, normalizedQuery);

    // Combine results, prioritizing exact matches
    const exactMatches = [
      ...matchingProducts.filter(
        (p) => p.name.toLowerCase() === normalizedQuery
      ),
      ...matchingSpecs.filter((s) => s.name.toLowerCase() === normalizedQuery),
      ...matchingCategories.filter(
        (c) => c.name.toLowerCase() === normalizedQuery
      ),
      ...matchingBrands.filter((b) => b.name.toLowerCase() === normalizedQuery),
    ];

    const partialMatches = [
      ...matchingProducts.filter(
        (p) => p.name.toLowerCase() !== normalizedQuery
      ),
      ...matchingSpecs.filter((s) => s.name.toLowerCase() !== normalizedQuery),
      ...matchingCategories.filter(
        (c) => c.name.toLowerCase() !== normalizedQuery
      ),
      ...matchingBrands.filter((b) => b.name.toLowerCase() !== normalizedQuery),
    ];

    return [...exactMatches, ...partialMatches].slice(0, 10);
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    throw new Error("Failed to fetch suggestions");
  }
}
/**
 * Search products by query, category, brand, or specification
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
      search,
      name,
      category,
      brand,
      spec,
      page = 1,
      limit = 10,
    } = params || {};

    // Simulate server delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Fetch real products from the database
    const products = await getProducts();

    let filteredProducts = [...products];

    // Apply filters
    if (search) {
      const normalizedSearch = search.toLowerCase().trim();
      filteredProducts = filteredProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(normalizedSearch) ||
          product.description.toLowerCase().includes(normalizedSearch) ||
          product.brand.toLowerCase().includes(normalizedSearch) ||
          product.category.toLowerCase().includes(normalizedSearch) ||
          Object.values(product.specifications || {}).some(
            (value) =>
              value !== undefined &&
              value !== null &&
              String(value).toLowerCase().includes(normalizedSearch)
          )
      );
    }

    if (name) {
      filteredProducts = filteredProducts.filter((product) =>
        product.name.toLowerCase().includes(name.toLowerCase())
      );
    }

    if (category) {
      filteredProducts = filteredProducts.filter(
        (product) => product.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (brand) {
      filteredProducts = filteredProducts.filter(
        (product) => product.brand.toLowerCase() === brand.toLowerCase()
      );
    }

    if (spec) {
      const normalizedSpec = spec.toLowerCase().trim();
      filteredProducts = filteredProducts.filter((product) =>
        Object.values(product.specifications || {}).some(
          (value) =>
            value !== undefined &&
            value !== null &&
            String(value).toLowerCase() === normalizedSpec
        )
      );
    }

    // Calculate pagination
    const totalItems = filteredProducts.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    return {
      products: paginatedProducts,
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
 * Get product by ID
 */
export async function getProductById(id: string) {
  try {
    if (!id) return null;

    // Simulate server delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Fetch real products from the database
    const products = await getProducts();

    return products.find((product) => product.id === id) || null;
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    throw new Error("Failed to fetch product by ID");
  }
}
