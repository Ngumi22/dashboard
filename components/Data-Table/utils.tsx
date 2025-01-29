import { Filter } from "./types";

export function searchData<T>(
  data: T[],
  searchTerm: string,
  searchKey: keyof T
): T[] {
  if (!searchTerm) return data;
  const lowercasedSearchTerm = searchTerm.toLowerCase();
  return data.filter((item) =>
    String(item[searchKey]).toLowerCase().includes(lowercasedSearchTerm)
  );
}

export function filterData<T>(
  data: T[],
  filters: Filter<T>[],
  activeFilters: Record<string, string[]>
): T[] {
  return data.filter((item) =>
    filters.every((filter) => {
      const activeFilterValues = activeFilters[filter.key as string] || [];
      if (activeFilterValues.length === 0) return true;

      if (filter.type === "select") {
        return activeFilterValues.includes(String(item[filter.key]));
      } else if (filter.type === "custom") {
        return filter.filterFn(item, activeFilterValues);
      } else if (filter.type === "range") {
        if (activeFilterValues.includes("lowest")) {
          return true; // We'll handle sorting separately
        } else if (activeFilterValues.includes("highest")) {
          return true; // We'll handle sorting separately
        }
      }

      return true;
    })
  );
}

export function sortData<T>(
  data: T[],
  sortKey: keyof T,
  sortDirection: "asc" | "desc"
): T[] {
  return [...data].sort((a, b) => {
    if (a[sortKey] < b[sortKey]) return sortDirection === "asc" ? -1 : 1;
    if (a[sortKey] > b[sortKey]) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });
}
