import ProductsPageClient from "./products-page";

export default async function ProductsPageServer({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return <ProductsPageClient searchParams={searchParams} />;
}
