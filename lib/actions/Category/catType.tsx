export interface Specification {
  specification_id: number;
  specification_name: string;
}

export interface Category {
  category_id: number;
  category_name: string;
  category_image: string | null;
  category_description: string;
  category_status: "Active" | "Inactive";
  parent_category_id?: number | null;
  path?: string;
  level?: number;
  specifications?: Specification[]; // Add specifications
}
