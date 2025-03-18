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
  name: string;
  type: "product" | "category" | "brand" | "specification";
  image?: string;
};

/**
 * Fetch products from the database
 */
export async function getProducts(): Promise<Product[]> {
  const { products } = await fetchProductsAndFilters({});
  return products.map((product) => ({
    id: product.id.toString(),
    name: product.name,
    description: product.description,
    price: product.price,
    category: product.category_name,
    brand: product.brand_name,
    specifications: product.specifications.reduce((acc, spec) => {
      acc[spec.specification_name] = spec.specification_value;
      return acc;
    }, {} as { [key: string]: string | number | boolean }),
    image: product.main_image,
  }));
}

/**
 * Get unique categories and brands from products
 */
async function getCategoriesAndBrands(products: Product[]) {
  const categories = [...new Set(products.map((p) => p.category))].map(
    (name) => ({
      id: name.toLowerCase().replace(/\s+/g, "-"),
      name,
      type: "category" as const,
    })
  );

  const brands = [...new Set(products.map((p) => p.brand))].map((name) => ({
    id: name.toLowerCase().replace(/\s+/g, "-"),
    name,
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
  products.forEach((product) => {
    if (product.specifications) {
      Object.entries(product.specifications).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          const specValue = String(value);
          if (
            !specifications.some(
              (s) => s.name.toLowerCase() === specValue.toLowerCase()
            )
          ) {
            specifications.push({
              id: `spec-${specValue.toLowerCase().replace(/\s+/g, "-")}`,
              name: specValue,
              type: "specification",
            });
          }
        }
      });
    }
  });
  return specifications;
}

/**
 * Get search suggestions based on input query
 */
export async function getSuggestions(
  query: string
): Promise<SearchSuggestion[]> {
  // Simulate server delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  if (!query) return [];

  const normalizedQuery = query.toLowerCase().trim();

  if (!normalizedQuery) return [];

  // Fetch real products from the database
  const products = await getProducts();

  // Get categories, brands, and specifications
  const { categories, brands } = await getCategoriesAndBrands(products);
  const specifications = await getSpecifications(products);

  // Search products
  const matchingProducts = products
    .filter(
      (product) =>
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.description.toLowerCase().includes(normalizedQuery)
    )
    .map((product) => ({
      id: product.id,
      name: product.name,
      type: "product" as const,
      image: product.image,
    }));

  // Search categories
  const matchingCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(normalizedQuery)
  );

  // Search brands
  const matchingBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(normalizedQuery)
  );

  // Search specifications
  const matchingSpecs = specifications.filter((spec) =>
    spec.name.toLowerCase().includes(normalizedQuery)
  );

  // Combine results, prioritizing exact matches
  const exactMatches = [
    ...matchingProducts.filter((p) => p.name.toLowerCase() === normalizedQuery),
    ...matchingSpecs.filter((s) => s.name.toLowerCase() === normalizedQuery),
    ...matchingCategories.filter(
      (c) => c.name.toLowerCase() === normalizedQuery
    ),
    ...matchingBrands.filter((b) => b.name.toLowerCase() === normalizedQuery),
  ];

  const partialMatches = [
    ...matchingProducts.filter((p) => p.name.toLowerCase() !== normalizedQuery),
    ...matchingSpecs.filter((s) => s.name.toLowerCase() !== normalizedQuery),
    ...matchingCategories.filter(
      (c) => c.name.toLowerCase() !== normalizedQuery
    ),
    ...matchingBrands.filter((b) => b.name.toLowerCase() !== normalizedQuery),
  ];

  return [...exactMatches, ...partialMatches].slice(0, 10);
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
}

/**
 * Get product by ID
 */
export async function getProductById(id: string) {
  if (!id) return null;

  // Simulate server delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Fetch real products from the database
  const products = await getProducts();

  return products.find((product) => product.id === id) || null;
}
