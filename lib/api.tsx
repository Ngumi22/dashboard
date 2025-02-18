import { faker } from "@faker-js/faker";

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  rating: number;
  category: string;
  brand: string;
  ram?: string;
  storage?: string;
  processor?: string;
  date: string;
}

export async function getProducts(
  filters: Record<string, string | string[] | undefined>
): Promise<Product[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const products: Product[] = Array.from({ length: 100 }, () => ({
    id: faker.string.uuid(),
    name: faker.commerce.productName(),
    price: Number.parseFloat(faker.commerce.price()),
    image: faker.image.urlLoremFlickr({ category: "technology" }),
    rating: faker.number.float({ min: 1, max: 5, fractionDigits: 1 }),
    category: faker.helpers.arrayElement([
      "Smartphones",
      "Laptops",
      "Tablets",
      "Accessories",
    ]),
    brand: faker.helpers.arrayElement([
      "Apple",
      "Samsung",
      "Dell",
      "Lenovo",
      "HP",
    ]),
    ram: faker.helpers.arrayElement(["4GB", "8GB", "16GB", "32GB"]),
    storage: faker.helpers.arrayElement([
      "64GB",
      "128GB",
      "256GB",
      "512GB",
      "1TB",
    ]),
    processor: faker.helpers.arrayElement([
      "Intel i3",
      "Intel i5",
      "Intel i7",
      "AMD Ryzen 5",
      "AMD Ryzen 7",
    ]),
    date: faker.date.past().toISOString(),
  }));

  // Apply filters
  return products.filter((product) => {
    for (const [key, value] of Object.entries(filters)) {
      if (Array.isArray(value)) {
        if (
          value.length > 0 &&
          !value.includes(String(product[key as keyof Product] ?? ""))
        ) {
          return false;
        }
      } else if (typeof value === "string") {
        if (key === "minPrice" && product.price < Number.parseFloat(value)) {
          return false;
        }
        if (key === "maxPrice" && product.price > Number.parseFloat(value)) {
          return false;
        }
      }
    }
    return true;
  });
}
