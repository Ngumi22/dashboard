import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";

interface TableHeaderProps {
  onSearch: (query: string) => void;
}

export default function TableHeader({ onSearch }: TableHeaderProps) {
  return (
    <div className="relative w-64">
      <Search className="absolute left-2 top-0 bottom-0 my-auto h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search..."
        className="pl-8"
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  );
}
