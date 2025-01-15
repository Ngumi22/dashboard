export type SortDirection = "asc" | "desc";

export interface Column<T> {
  key: keyof T;
  header: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}

export interface FilterOption {
  value: string;
  label: string;
}

export interface BaseFilter<T> {
  key: keyof T;
  label: string;
  type: "select" | "custom" | "range";
}

export interface SelectFilter<T> extends BaseFilter<T> {
  type: "select";
  options: FilterOption[];
}

export interface CustomFilter<T> extends BaseFilter<T> {
  type: "custom";
  options: FilterOption[];
  filterFn: (item: T, selectedOptions: string[]) => boolean;
}

export interface RangeFilter<T> extends BaseFilter<T> {
  type: "range";
  options: [
    { value: "lowest"; label: "Lowest to Highest" },
    { value: "highest"; label: "Highest to Lowest" }
  ];
}

export type Filter<T> = SelectFilter<T> | CustomFilter<T> | RangeFilter<T>;

export interface RowAction<T> {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: (item: T) => void;
}

export interface DataTableProps<T> {
  data: T[];
  includedKeys: (keyof T)[];
  filters: Filter<T>[];
  rowActions: RowAction<T>[];
  onSearch: (query: string) => void;
  onFilter: (key: string, value: string) => void;
  onSort: (key: keyof T, direction: SortDirection) => void;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onRowSelect: (selectedRows: T[]) => void;
  onAddNew: () => void;
  totalItems: number;
  currentPage: number;
  rowsPerPage: number;
  onResetFilters: () => void;
  activeFilters: Record<string, string[]>;
  onClearFilter: (key: string, value: string) => void;
  columnRenderers?: Record<keyof T, (item: T) => React.ReactNode>;
  noDataMessage?: string;
}

export type ProductStatus = "draft" | "pending" | "approved";

export interface Product {
  product_id: string;
  name: string;
  sku: string;
  price: number;
  discount: number;
  quantity: number;
  ratings: number;
  category: string;
  status: ProductStatus;
  description: string;
  brand: string;
  supplier: string[];
  specifications: any;
  createdAt: string;
  updatedAt: string;
  images: {
    mainImage: string;
    thumbnail1: string | null;
    thumbnail2: string | null;
    thumbnail3: string | null;
    thumbnail4: string | null;
    thumbnail5: string | null;
  };
  tags?: string[];
}

export interface Category {
  category_id: number;
  category_name: string;
  category_image: string;
  category_description: string;
  category_status: "Active" | "Inactive";
}

// Define the User type
export interface User {
  user_id: number;
  name: string;
  phone_number: string;
  email: string;
  is_verified: boolean;
  role: "Super-Admin" | "Admin" | "User";
  is_blocked?: boolean; // Derived field
  password_hash?: string; // Optional if this data is required
}
