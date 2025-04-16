"use server";

import { unstable_cache as cache } from "next/cache";
import { fetchProductByName } from "./actions/byName";
import { fetchProductById } from "./actions/fetchById";
import { fetchProducts } from "./actions/fetch";
import { SearchParams } from "./actions/search-params";
import { getFilteredProducts } from "./actions/getproduct";

const MINUTE = 1000 * 60;
const DAY = 24 * 60 * MINUTE;

export const getProducts = cache(
  async (filter: SearchParams = {}) => {
    const products = await getFilteredProducts(filter);
    return products;
  },
  ["products", "list"],
  { revalidate: 30 * MINUTE }
);

export const getProductById = cache(
  async (id: number) => {
    return await fetchProductById(id);
  },
  ["products", "detail"],
  { revalidate: 30 * MINUTE }
);

export const getProductByName = cache(
  async (name: string) => {
    return await fetchProductByName(name);
  },
  ["products", "name"],
  { revalidate: 30 * MINUTE }
);

export const getProductFilters = cache(
  async () => {
    const [_, meta] = await fetchProducts({});
    return meta.filters;
  },
  ["products", "filters"],
  { revalidate: DAY }
);
