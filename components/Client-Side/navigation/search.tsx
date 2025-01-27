"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function SearchComponent() {
  return (
    <div className="flex w-full max-w-xl mx-auto relative h-10 min-w-[300px]">
      {/* Input Field */}
      <Input
        type="search"
        placeholder="Search products..."
        className="w-full h-10 pl-4 pr-12"
      />

      {/* Search Button */}
      <Button
        size="sm"
        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-2"
        aria-label="Search">
        <Search className="h-4 w-4" />
      </Button>
    </div>
  );
}
