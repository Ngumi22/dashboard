"use client";

import type React from "react";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Search, Loader2 } from "lucide-react";
import { getSuggestions } from "@/lib/actions/search-actions";
import Image from "next/image";

type SearchSuggestion = {
  id: string;
  name: string;
  type: "product" | "category" | "brand" | "specification";
  image?: string;
  displayName?: string;
};

export default function SearchInput() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Optimized debounced input change handler
  const fetchSuggestions = useDebouncedCallback(async (value: string) => {
    if (!value.trim()) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const results = await getSuggestions(value);
      setSuggestions(results || []);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, 300);

  // Handle input change
  const handleInputChange = (value: string) => {
    setInput(value);
    fetchSuggestions(value);
  };

  // Handle selection from suggestions
  const handleSelect = useCallback(
    (value: string) => {
      const suggestion = suggestions.find((s) => s.name === value);
      if (!suggestion) return;

      setInput("");
      setSuggestions([]);
      setIsFocused(false);

      const queryParam = encodeURIComponent(suggestion.name);

      // Handle specification URLs with the `spec_` prefix
      if (suggestion.type === "specification") {
        // Split the specification name into key and value
        const [key, val] = suggestion.name.split(":").map((s) => s.trim());
        if (key && val) {
          // Construct the URL with the `spec_` prefix
          router.push(
            `/products?spec_${key.toLowerCase()}=${encodeURIComponent(val)}`
          );
          return;
        }
      }

      // Handle other types (product, category, brand)
      const routes: Record<SearchSuggestion["type"], string> = {
        product: `/products?name=${queryParam}`,
        category: `/products?category=${queryParam}`,
        brand: `/products?brand=${queryParam}`,
        specification: `/products?spec_${queryParam}=${queryParam}`, // Fallback for invalid specifications
      };

      router.push(routes[suggestion.type]);
    },
    [router, suggestions]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim()) return;

      router.push(`/products?search=${encodeURIComponent(input)}`);
      setInput("");
      setSuggestions([]);
      setIsFocused(false);
    },
    [router, input]
  );

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };

    if (isFocused) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isFocused]);

  // Memoized grouped suggestions
  const groupedSuggestions = useMemo(() => {
    return suggestions.reduce<Record<string, SearchSuggestion[]>>(
      (acc, item) => {
        acc[item.type] = acc[item.type] || [];
        acc[item.type].push(item);
        return acc;
      },
      {}
    );
  }, [suggestions]);

  return (
    <div ref={searchContainerRef} className="relative w-full max-w-lg mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative h-10 w-full rounded-md border bg-background shadow-sm flex items-center">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder="Search products..."
            className="flex-1 h-full bg-transparent px-3 md:px-6 py-2 text-sm outline-none placeholder:text-muted-foreground pr-2"
          />
          <Search className="mr-3 h-4 w-4 shrink-0 opacity-50" />
          {loading && (
            <Loader2 className="mr-3 h-4 w-4 animate-spin opacity-70" />
          )}
        </div>

        {isFocused && (input.trim().length > 0 || suggestions.length > 0) && (
          <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-50 rounded-md border bg-background shadow-md overflow-hidden">
            <div className="max-h-[300px] overflow-y-auto">
              {loading && (
                <div className="py-6 text-center text-sm">
                  <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                  Loading suggestions...
                </div>
              )}

              {!loading && suggestions.length === 0 && input && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  No results found. Press Enter to search.
                </div>
              )}

              {Object.entries(groupedSuggestions).map(([type, items]) => (
                <div key={type}>
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground capitalize">
                    {type}
                  </div>
                  {items.map((item) => (
                    <button
                      key={`${type}-${item.id}`}
                      type="button"
                      onClick={() => handleSelect(item.name)} // Use `name` for URL construction
                      className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground">
                      {item.image && (
                        <div className="h-8 w-8 overflow-hidden rounded-md bg-muted flex-shrink-0">
                          <Image
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            className="h-full w-full object-cover"
                            height={100}
                            width={100}
                          />
                        </div>
                      )}
                      <span>{item.displayName}</span>
                      {/* Use `displayName` for display */}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
