import ProductsPageClient, {
  ProductsPageProps,
} from "@/components/ProductsPage/products-page";

export default function Page({ searchParams }: ProductsPageProps) {
  return (
    <section className="mt-[9.7rem] lg:mt-[10rem] bg-muted/80">
      <ProductsPageClient searchParams={searchParams} />
    </section>
  );
}
