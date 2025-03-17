import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductGallery from "@/components/Product/ProductPage/product-gallery";
import ProductInfo from "@/components/Product/ProductPage/product-info";
import CustomersAlsoBought from "@/components/Product/ProductPage/customers-also-bought";
import ProductTabs from "@/components/Product/ProductPage/product-tabs";
import RecentlyViewed from "@/components/Product/ProductPage/recently-viewed";
import { fetchProductByName } from "@/lib/actions/Product/fetchByName";

export default async function ProductPage({
  params,
}: {
  params: { name: string };
}) {
  // Decode the name parameter
  const decodedName = decodeURIComponent(params.name);
  console.log("Decoded name:", decodedName); // Debugging

  const product = await fetchProductByName(decodedName);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container p-4 mx-auto">
        <div className="mb-4">
          <Button
            variant="ghost"
            asChild
            className="gap-2 pl-2 hover:bg-transparent">
            <Link href="/products" prefetch={true}>
              <ChevronLeft className="h-4 w-4" />
              Back to Products
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ProductGallery
            mainImage={product.main_image}
            thumbnails={product.thumbnails}
          />
          <ProductInfo
            id={product.id}
            name={product.name}
            price={product.price}
            description={product.description}
            discount={product.discount}
            quantity={product.quantity}
            main_image={product.main_image}
            ratings={product.ratings}
          />
        </div>
        <ProductTabs product={product} />

        <CustomersAlsoBought currentProductId={product.id.toString()} />

        <RecentlyViewed currentProductId={product.id.toString()} />
      </div>
    </div>
  );
}
