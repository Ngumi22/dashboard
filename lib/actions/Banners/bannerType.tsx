export interface Banner {
  banner_id?: number;
  title: string;
  description?: string;
  link?: string;
  image?: string | File;
  text_color: string;
  background_color: string;
  usage_context_id: string;
  usage_context_name: string;
  context_type: "new" | "existing";
  status: "active" | "inactive";
  new_context_name: string;
}
