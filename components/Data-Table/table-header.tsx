import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";

interface TableHeaderProps {
  onSearch: (query: string) => void;
  onAddNew: () => void;
}

export default function TableHeader({ onSearch, onAddNew }: TableHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div className="relative w-64">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search..."
          className="pl-8"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      <Button onClick={onAddNew}>
        <Plus className="mr-2 h-4 w-4" /> Add New
      </Button>
    </div>
  );
}
