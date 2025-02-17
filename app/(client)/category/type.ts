export interface Category {
  category_id: number;
  category_name: string;
  category_slug: string; // Add this field
  category_image: string | null;
  category_description: string;
  category_status: "active" | "inactive";
  parent_category_id?: number | null;
}
