export interface Carousel {
  carousel_id?: number;
  title: string;
  short_description?: string;
  description?: string;
  link?: string;
  image?: string | null;
  status: "active" | "inactive";
  text_color: string;
  background_color: string;
}
