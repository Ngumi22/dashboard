export interface Banner {
  banner_id?: number;
  title: string;
  description?: string;
  link?: string;
  image?: string;
  text_color: string;
  background_color: string;
  usage_context_id: string | number;
  usage_context_name: string;
  context_type: "new" | "existing";
  status: "active" | "inactive";
  new_context_name: string;
}

export interface UsageContext {
  context_id: number | string;
  name: string;
}
