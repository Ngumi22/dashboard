import { Suspense } from "react";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { searchProducts } from "@/lib/actions/search-actions";
import SearchInput from "@/components/Client-Side/navigation/search-input";

// Loading component for Suspense
function SearchResultsLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-sm text-muted-foreground">
        Loading search results...
      </p>
    </div>
  );
}

// Search results component
async function SearchResults({ query }: { query: string }) {
  const { products, pagination } = await searchProducts({ search: query });

  if (products.length === 0) {
    return (
      <div className="text-center py-4 mt-[9.7rem] lg:mt-[11rem] bg-muted/80">
        <h2 className="text-xl font-semibold mb-2">No results found</h2>
        <p className="text-muted-foreground">
          We couldnt find any products matching {query}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-[9.7rem] lg:mt-[11rem] bg-muted/80">
      {products.map((product) => (
        <Card key={product.id} className="overflow-hidden">
          <div className="aspect-square relative">
            <Image
              src={product.image || "/placeholder.svg?height=300&width=300"}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
          <CardContent className="p-4">
            <h3 className="font-semibold text-lg">{product.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {product.description}
            </p>
            <div className="mt-2 flex items-center justify-between">
              <span className="font-medium">${product.price.toFixed(2)}</span>
              <div className="flex gap-2">
                <span className="text-xs px-2 py-1 bg-muted rounded-full">
                  {product.category}
                </span>
                <span className="text-xs px-2 py-1 bg-muted rounded-full">
                  {product.brand}
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <Button asChild className="w-full">
              <Link href={`/product/${product.id}`}>View Product</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q || "";

  return (
    <div className="container py-10 mt-[9.7rem] lg:mt-[11rem] bg-muted/80">
      <div className="mb-8 flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Search Results</h1>
          {query && (
            <p className="text-muted-foreground mt-1">
              Showing results for {query}
            </p>
          )}
        </div>
        <div className="md:ml-auto w-full md:w-auto">
          <SearchInput />
        </div>
      </div>

      <Suspense fallback={<SearchResultsLoading />}>
        <SearchResults query={query} />
      </Suspense>
    </div>
  );
}
