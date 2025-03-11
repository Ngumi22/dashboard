"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function SearchComponent() {
  return (
    <div className="flex w-full max-w-xl mx-auto relative h-[2.5rem] min-w-[200px] md:min-w-[300px]">
      {/* Input Field */}
      <Input
        type="search"
        placeholder="Search products..."
        className="w-full h-[2.5rem] pl-4 pr-12"
      />

      {/* Search Button */}
      <Search className="absolute right-1 top-1/2 transform -translate-y-1/2 h-[2rem] w-[6rem] p-2 bg-gray-950 text-white rounded-md" />
    </div>
  );
}
