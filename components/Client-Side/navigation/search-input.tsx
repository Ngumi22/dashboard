"use client";

import type React from "react";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { getSuggestions } from "@/lib/actions/search-actions";
import Image from "next/image";

type SearchSuggestion = {
  id: string;
  name: string;
  type: "product" | "category" | "brand" | "specification";
  image?: string;
};

export default function SearchInput() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle debounced input changes
  const handleInputChange = useCallback(async (value: string) => {
    setInput(value);

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!value.trim()) {
      setSuggestions([]);
      return;
    }

    // Set new timer for debounce (300ms)
    debounceTimerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        // Call the server action to get suggestions
        const results = await getSuggestions(value);
        setSuggestions(results || []); // Ensure we always have an array
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]); // Reset suggestions on error
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  // Handle selection from suggestions
  // Handle selection from suggestions
  const handleSelect = useCallback(
    (value: string) => {
      // Find the suggestion that matches the selected value
      const suggestion = suggestions.find((s) => s.name === value);

      if (!suggestion) return;

      setInput("");
      setSuggestions([]);
      setIsFocused(false);

      if (suggestion.type === "product") {
        router.push(`/products?name=${encodeURIComponent(suggestion.name)}`);
      } else if (suggestion.type === "category") {
        router.push(
          `/products?category=${encodeURIComponent(suggestion.name)}`
        );
      } else if (suggestion.type === "brand") {
        router.push(`/products?brand=${encodeURIComponent(suggestion.name)}`);
      } else if (suggestion.type === "specification") {
        // Extract the key part before the first colon
        const colonIndex = suggestion.name.indexOf(":");
        const specKey =
          colonIndex !== -1
            ? suggestion.name.slice(0, colonIndex)
            : suggestion.name;
        router.push(
          `/products?spec_${suggestion.name}=${
            suggestion.name
          }:${encodeURIComponent(specKey)}`
        );
      }
    },
    [router, suggestions]
  );

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Default behavior is to go to products page with search query
    router.push(`/products?search=${encodeURIComponent(input)}`);
    setInput("");
    setSuggestions([]);
    setIsFocused(false);
  };

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

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Safe filter function that handles undefined arrays
  const safeFilter = (
    items: SearchSuggestion[] = [],
    predicate: (item: SearchSuggestion) => boolean
  ) => {
    return items.filter(predicate);
  };

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsFocused(false);
    }
  };

  return (
    <div
      ref={searchContainerRef}
      className="relative w-full max-w-lg mx-auto"
      onKeyDown={handleKeyDown}>
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

        {/* Absolutely positioned dropdown */}
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

              {suggestions.length > 0 && (
                <div className="py-2">
                  {safeFilter(suggestions, (item) => item.type === "product")
                    .length > 0 && (
                    <div>
                      <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                        Products
                      </div>
                      {safeFilter(
                        suggestions,
                        (item) => item.type === "product"
                      ).map((item) => (
                        <button
                          key={`product-${item.id}`}
                          type="button"
                          onClick={() => handleSelect(item.name)}
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
                          <span>{item.name}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {safeFilter(
                    suggestions,
                    (item) => item.type === "specification"
                  ).length > 0 && (
                    <div>
                      <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                        Specifications
                      </div>
                      {safeFilter(
                        suggestions,
                        (item) => item.type === "specification"
                      ).map((item) => (
                        <button
                          key={`spec-${item.id}`}
                          type="button"
                          onClick={() => handleSelect(item.name)}
                          className="flex w-full items-center px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground">
                          {item.name}
                        </button>
                      ))}
                    </div>
                  )}

                  {safeFilter(suggestions, (item) => item.type === "category")
                    .length > 0 && (
                    <div>
                      <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                        Categories
                      </div>
                      {safeFilter(
                        suggestions,
                        (item) => item.type === "category"
                      ).map((item) => (
                        <button
                          key={`category-${item.id}`}
                          type="button"
                          onClick={() => handleSelect(item.name)}
                          className="flex w-full items-center px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground">
                          {item.name}
                        </button>
                      ))}
                    </div>
                  )}

                  {safeFilter(suggestions, (item) => item.type === "brand")
                    .length > 0 && (
                    <div>
                      <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                        Brands
                      </div>
                      {safeFilter(
                        suggestions,
                        (item) => item.type === "brand"
                      ).map((item) => (
                        <button
                          key={`brand-${item.id}`}
                          type="button"
                          onClick={() => handleSelect(item.name)}
                          className="flex w-full items-center px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground">
                          {item.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
