export type Specification = {
  specification_id: number;
  specification_name: string;
};

export type Category = {
  category_id: number;
  category_name: string;
  category_image: string | null;
  category_description: string;
  category_status: "active" | "inactive";
  parent_category_id?: number | null;
  path?: string;
  level?: number;
  specifications?: Specification[]; // Add specifications
};
