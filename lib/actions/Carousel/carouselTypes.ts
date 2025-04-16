export interface Carousel {
  carousel_id?: number;
  title: string;
  short_description?: string;
  description?: string;
  link?: string;
  image?: string;
  status?: "active" | "inactive";
  text_color?: string;
  background_color?: string;
}

export interface CarouselItemm {
  carousel_id?: number;
  title: string;
  short_description?: string;
  description?: string;
  link?: string;
  image?: string;
  status: "active" | "inactive";
  text_color: string;
  background_color: string;
}

export interface HeroCarouselsProps {
  isAdmin?: boolean;
}

export interface MiniCarousel {
  carousel_id?: number;
  title: string;
  short_description?: string;
  description?: string;
  link?: string;
  image?: string;
  status?: "active" | "inactive";
  text_color?: string;
  background_color?: string;
}
