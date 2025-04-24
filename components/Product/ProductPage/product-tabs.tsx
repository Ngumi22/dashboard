import { Dot, Star } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Product } from "@/lib/actions/Product/actions/search-params";

interface ProductTabsProps {
  product: Product;
}

export default function ProductTabs({ product }: ProductTabsProps) {
  return (
    <Tabs defaultValue="description" className="mt-12">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="description">Description</TabsTrigger>
        <TabsTrigger value="specifications">Specifications</TabsTrigger>
        <TabsTrigger value="reviews">Reviews</TabsTrigger>
      </TabsList>
      <TabsContent value="description" className="mt-6">
        <div className="prose max-w-none">
          <div
            dangerouslySetInnerHTML={{
              __html: product.long_description || "",
            }}
          />
        </div>
      </TabsContent>
      <TabsContent value="specifications" className="mt-6">
        <div className="">
          {product.specifications?.map((spec) => (
            <p key={spec.specification_id} className="flex items-center">
              <p className="font-normal">
                {spec.specification_name}: {spec.specification_value}
              </p>
            </p>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="reviews" className="mt-6">
        <div className="text-center text-muted-foreground">
          <Star className="mx-auto h-8 w-8" />
          <p className="mt-2 text-2xl font-semibold">{product.ratings}</p>
          <p className="mt-1">Average rating</p>
        </div>
      </TabsContent>
    </Tabs>
  );
}
