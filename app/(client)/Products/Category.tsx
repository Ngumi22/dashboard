import TabbedScrollableSection from "@/components/Client-Side/Features/TabbedScrollableSection";

export interface CategoryData {
  name: string;
  bannerImages: BannerImage[];
  products: ProductCardProps[];
}

export interface BannerImage {
  src: string;
  alt: string;
  link?: string;
}

export interface ProductCardProps {
  id: string | number;
  title: string;
  price: string;
  imageUrl: string;
}

export interface BannerImage {
  src: string;
  alt: string;
  link?: string;
}

export interface TabbedScrollableSectionProps {
  categories: CategoryData[];
  className?: string;
  itemClassName?: string;
}

const bannerImages = [
  {
    src: "https://fastly.picsum.photos/id/2/5000/3333.jpg?hmac=_KDkqQVttXw_nM-RyJfLImIbafFrqLsuGO5YuHqD-qQ",
    alt: "Banner 1",
    link: "/promo1",
  },
  {
    src: "https://fastly.picsum.photos/id/0/5000/3333.jpg?hmac=_j6ghY5fCfSD6tvtcV74zXivkJSPIfR9B8w34XeQmvU",
    alt: "Banner 2",
    link: "/promo2",
  },
];

const categories: CategoryData[] = [
  {
    name: "Laptops",
    bannerImages: [
      {
        src: "https://fastly.picsum.photos/id/2/5000/3333.jpg?hmac=_KDkqQVttXw_nM-RyJfLImIbafFrqLsuGO5YuHqD-qQ",
        alt: "Laptop Banner 1",
      },
      {
        src: "https://fastly.picsum.photos/id/0/5000/3333.jpg?hmac=_j6ghY5fCfSD6tvtcV74zXivkJSPIfR9B8w34XeQmvU",
        alt: "Laptop Banner 2",
      },
    ],
    products: Array.from({ length: 10 }, (_, i) => ({
      id: `laptop-${i + 1}`,
      title: `Laptop ${i + 1}`,
      price: `$${(Math.random() * 1000 + 500).toFixed(2)}`,
      imageUrl: `https://fastly.picsum.photos/id/2/5000/3333.jpg?hmac=_KDkqQVttXw_nM-RyJfLImIbafFrqLsuGO5YuHqD-qQ`,
    })),
  },
  {
    name: "Phones",
    bannerImages: [
      {
        src: "https://fastly.picsum.photos/id/2/5000/3333.jpg?hmac=_KDkqQVttXw_nM-RyJfLImIbafFrqLsuGO5YuHqD-qQ",
        alt: "Phone Banner 1",
      },
      {
        src: "https://fastly.picsum.photos/id/0/5000/3333.jpg?hmac=_j6ghY5fCfSD6tvtcV74zXivkJSPIfR9B8w34XeQmvU",
        alt: "Phone Banner 2",
      },
    ],
    products: Array.from({ length: 10 }, (_, i) => ({
      id: `phone-${i + 1}`,
      title: `Phone ${i + 1}`,
      price: `$${(Math.random() * 500 + 200).toFixed(2)}`,
      imageUrl: `https://fastly.picsum.photos/id/2/5000/3333.jpg?hmac=_KDkqQVttXw_nM-RyJfLImIbafFrqLsuGO5YuHqD-qQ`,
    })),
  },
  {
    name: "Tablets",
    bannerImages: [
      {
        src: "https://fastly.picsum.photos/id/2/5000/3333.jpg?hmac=_KDkqQVttXw_nM-RyJfLImIbafFrqLsuGO5YuHqD-qQ",
        alt: "Tablet Banner 1",
      },
      {
        src: "https://fastly.picsum.photos/id/2/5000/3333.jpg?hmac=_KDkqQVttXw_nM-RyJfLImIbafFrqLsuGO5YuHqD-qQ",
        alt: "Tablet Banner 2",
      },
    ],
    products: Array.from({ length: 10 }, (_, i) => ({
      id: `tablet-${i + 1}`,
      title: `Tablet ${i + 1}`,
      price: `$${(Math.random() * 800 + 300).toFixed(2)}`,
      imageUrl: `https://fastly.picsum.photos/id/2/5000/3333.jpg?hmac=_KDkqQVttXw_nM-RyJfLImIbafFrqLsuGO5YuHqD-qQ`,
    })),
  },
];

export default function CategoryHome() {
  return (
    <section className="md:container px-2">
      <h1 className="text-2xl font-semibold my-3">Our Products</h1>
      <TabbedScrollableSection
        categories={categories}
        className="mb-4"
        itemClassName="w-[250px]"
        banner={{
          images: bannerImages,
          interval: 5000,
          height: 320,
          width: 240,
          className: "rounded-md shadow-md",
          imageClassName: "rounded-md",
        }}
      />
    </section>
  );
}
