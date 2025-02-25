"use client";
import { Mail, MapPin, Phone, Star } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Key,
  ReactElement,
  JSXElementConstructor,
  ReactNode,
  ReactPortal,
  AwaitedReactNode,
} from "react";
import { Product } from "@/lib/actions/Product/productTypes";

interface ProductTabsProps {
  product: Product;
}

export default function ProductTabs({ product }: ProductTabsProps) {
  return (
    <Tabs defaultValue="description" className="mt-12">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="description">Description</TabsTrigger>
        <TabsTrigger value="specifications">Specifications</TabsTrigger>

        <TabsTrigger value="reviews">Reviews</TabsTrigger>
      </TabsList>
      <TabsContent value="description" className="mt-6">
        <div className="prose max-w-none">{product.description}</div>
      </TabsContent>
      <TabsContent value="specifications" className="mt-6">
        <div className="grid gap-4">
          {product.specifications.map((spec: any) => (
            <div
              key={spec.specification_id}
              className="grid grid-cols-2 gap-4 border-b pb-4">
              <div className="font-medium">{spec.specification_name}</div>
              <div>{spec.specification_value}</div>
            </div>
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
