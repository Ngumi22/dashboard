export interface Banner {
  banner_id: number;
  title: string;
  description: string;
  link: string;
  image: string | null; // Adjusted to match function output
  text_color: string;
  background_color: string;
  status: string;
  usage_context: string;
}
