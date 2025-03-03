// Mock data and utility functions for the product filter page
// In a real app, these would be API calls to your backend

import { Product, SearchParams } from "./search-params";

// Mock function to get products based on search params
export async function getProducts(params: SearchParams) {
  // Simulate API delay (reduced for better UX)
  await new Promise((resolve) => setTimeout(resolve, 200));

  // Start with all products
  let filteredProducts = [...mockProducts];

  // Apply filters - optimize by using early returns for empty arrays
  if (params.minPrice !== undefined || params.maxPrice !== undefined) {
    const min = params.minPrice ?? 0;
    const max = params.maxPrice ?? Number.POSITIVE_INFINITY;

    filteredProducts = filteredProducts.filter(
      (product) => product.price >= min && product.price <= max
    );

    // Early return if no products match
    if (filteredProducts.length === 0) {
      return {
        products: [],
        totalProducts: 0,
        totalPages: 0,
      };
    }
  }

  if (params.brand) {
    const brands = params.brand.split(",");
    if (brands.length > 0) {
      filteredProducts = filteredProducts.filter((product) =>
        brands.includes(product.brand.brand_id)
      );

      // Early return if no products match
      if (filteredProducts.length === 0) {
        return {
          products: [],
          totalProducts: 0,
          totalPages: 0,
        };
      }
    }
  }

  if (params.category) {
    const categories = params.category.split(",");
    if (categories.length > 0) {
      filteredProducts = filteredProducts.filter((product) =>
        categories.includes(product.category_id)
      );

      // Early return if no products match
      if (filteredProducts.length === 0) {
        return {
          products: [],
          totalProducts: 0,
          totalPages: 0,
        };
      }
    }
  }

  if (params.tags) {
    const tags = params.tags.split(",");
    if (tags.length > 0) {
      filteredProducts = filteredProducts.filter((product) =>
        product.tags?.some((tag: any) => tags.includes(tag))
      );

      // Early return if no products match
      if (filteredProducts.length === 0) {
        return {
          products: [],
          totalProducts: 0,
          totalPages: 0,
        };
      }
    }
  }

  if (params.minRating !== undefined) {
    filteredProducts = filteredProducts.filter(
      (product) => product.ratings >= params.minRating!
    );

    // Early return if no products match
    if (filteredProducts.length === 0) {
      return {
        products: [],
        totalProducts: 0,
        totalPages: 0,
      };
    }
  }

  // Apply specification filters
  const specFilters = Object.keys(params).filter((key) =>
    key.startsWith("spec_")
  );

  if (specFilters.length > 0) {
    for (const key of specFilters) {
      const specId = key.replace("spec_", "");
      const values = params[key]?.toString().split(",") || [];

      if (values.length > 0) {
        filteredProducts = filteredProducts.filter((product) =>
          product.specifications.some(
            (spec: any) =>
              spec.specification_id === specId &&
              values.includes(spec.specification_value)
          )
        );

        // Early return if no products match
        if (filteredProducts.length === 0) {
          return {
            products: [],
            totalProducts: 0,
            totalPages: 0,
          };
        }
      }
    }
  }

  // Apply sorting
  const sort = params.sort || "featured";

  switch (sort) {
    case "price-asc":
      filteredProducts.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      filteredProducts.sort((a, b) => b.price - a.price);
      break;
    case "name-asc":
      filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "name-desc":
      filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case "newest":
      filteredProducts.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      break;
    case "rating":
      filteredProducts.sort((a, b) => b.ratings - a.ratings);
      break;
    // For 'featured', we don't need to sort as the mock data is already in featured order
  }

  // Get total count
  const totalProducts = filteredProducts.length;

  // Apply pagination
  const perPage = Number(params.perPage || 12);
  const page = Number(params.page || 1);
  const start = (page - 1) * perPage;
  const end = start + perPage;

  const paginatedProducts = filteredProducts.slice(start, end);

  return {
    products: paginatedProducts,
    totalProducts,
    totalPages: Math.ceil(totalProducts / perPage),
  };
}

// Mock function to get categories
export function getCategories() {
  return [
    { id: "electronics", name: "Electronics" },
    { id: "clothing", name: "Clothing" },
    { id: "home", name: "Home & Kitchen" },
    { id: "books", name: "Books" },
    { id: "sports", name: "Sports & Outdoors" },
  ];
}

// Mock function to get brands
export function getBrands() {
  return [
    { id: "apple", name: "Apple" },
    { id: "samsung", name: "Samsung" },
    { id: "nike", name: "Nike" },
    { id: "adidas", name: "Adidas" },
    { id: "sony", name: "Sony" },
  ];
}

// Mock function to get specifications
export function getSpecifications() {
  return [
    {
      id: "color",
      name: "Color",
      values: ["Black", "White", "Red", "Blue", "Green"],
    },
    {
      id: "size",
      name: "Size",
      values: ["S", "M", "L", "XL", "XXL"],
    },
    {
      id: "material",
      name: "Material",
      values: ["Cotton", "Polyester", "Leather", "Metal", "Plastic"],
    },
  ];
}

// Mock function to get tags
export function getTags() {
  return ["New", "Sale", "Bestseller", "Eco-friendly", "Limited Edition"];
}

// Mock function to get min and max price
export function getMinMaxPrice() {
  return {
    minPrice: 0,
    maxPrice: 2000,
  };
}

// Mock products data
const mockProducts: Product[] = Array.from({ length: 50 }).map((_, index) => {
  const id = index + 1;
  const categories = ["electronics", "clothing", "home", "books", "sports"];
  const categoryId = categories[Math.floor(Math.random() * categories.length)];

  const brands = [
    {
      brand_id: "apple",
      brand_name: "Apple",
      brand_image: "/brands/apple.png",
    },
    {
      brand_id: "samsung",
      brand_name: "Samsung",
      brand_image: "/brands/samsung.png",
    },
    { brand_id: "nike", brand_name: "Nike", brand_image: "/brands/nike.png" },
    {
      brand_id: "adidas",
      brand_name: "Adidas",
      brand_image: "/brands/adidas.png",
    },
    { brand_id: "sony", brand_name: "Sony", brand_image: "/brands/sony.png" },
  ];
  const brand = brands[Math.floor(Math.random() * brands.length)];

  const price = Math.floor(Math.random() * 2000) + 10;
  const discount =
    Math.random() > 0.7 ? Math.floor(Math.random() * 50) + 10 : 0;

  const allTags = [
    "New",
    "Sale",
    "Bestseller",
    "Eco-friendly",
    "Limited Edition",
  ];
  const tags = allTags.filter(() => Math.random() > 0.7);

  const ratings = Math.floor(Math.random() * 5) + Math.random();

  // Generate a date within the last year
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * 365));

  // Generate random specifications
  const specifications = [
    {
      specification_id: "color",
      specification_name: "Color",
      specification_value: ["Black", "White", "Red", "Blue", "Green"][
        Math.floor(Math.random() * 5)
      ],
      category_id: categoryId,
    },
    {
      specification_id: "size",
      specification_name: "Size",
      specification_value: ["S", "M", "L", "XL", "XXL"][
        Math.floor(Math.random() * 5)
      ],
      category_id: categoryId,
    },
    {
      specification_id: "material",
      specification_name: "Material",
      specification_value: [
        "Cotton",
        "Polyester",
        "Leather",
        "Metal",
        "Plastic",
      ][Math.floor(Math.random() * 5)],
      category_id: categoryId,
    },
  ];

  return {
    id,
    name: `Product ${id} - ${brand.brand_name} ${
      categoryId.charAt(0).toUpperCase() + categoryId.slice(1)
    }`,
    sku: `SKU-${id.toString().padStart(5, "0")}`,
    description: `This is a detailed description for product ${id}. It includes all the features and benefits of the product.`,
    price,
    quantity: Math.floor(Math.random() * 100) + 1,
    discount,
    status: Math.random() > 0.2 ? "active" : "inactive",
    tags,
    main_image: `/placeholder.svg?height=400&width=400&text=Product+${id}`,
    thumbnails: [
      {
        thumbnail1: `/placeholder.svg?height=100&width=100&text=Thumbnail+1`,
        thumbnail2: `/placeholder.svg?height=100&width=100&text=Thumbnail+2`,
        thumbnail3: `/placeholder.svg?height=100&width=100&text=Thumbnail+3`,
        thumbnail4: `/placeholder.svg?height=100&width=100&text=Thumbnail+4`,
        thumbnail5: `/placeholder.svg?height=100&width=100&text=Thumbnail+5`,
      },
    ],
    category_id: categoryId,
    brand,
    specifications,
    suppliers: [
      {
        supplier_id: 1,
        supplier_name: "Supplier A",
        supplier_email: "supplierA@example.com",
        supplier_phone_number: "123-456-7890",
        supplier_location: "New York, USA",
      },
    ],
    ratings,
    created_at: date.toISOString(),
    updatedAt: new Date().toISOString(),
  };
});
