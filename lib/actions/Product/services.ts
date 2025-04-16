export const productKeys = {
  all: ["products"] as const,
  lists: ["products", "list"] as const,
  details: ["products", "detail"] as const,
  names: ["products", "name"] as const,
  filters: ["products", "filters"] as const,
};

import { SearchParams } from "./actions/search-params";

export const getProductListKey = (filter?: SearchParams) =>
  filter ? [...productKeys.lists, filter] : productKeys.lists;

export const getProductDetailKey = (id: number) => [...productKeys.details, id];

export const getProductNameKey = (name: string) => [...productKeys.names, name];
