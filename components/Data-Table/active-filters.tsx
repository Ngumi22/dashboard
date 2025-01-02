import React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ActiveFiltersProps {
  activeFilters: Record<string, string[]>;
  onClearFilter: (key: string, value: string) => void;
}

export default function ActiveFilters({
  activeFilters,
  onClearFilter,
}: ActiveFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {Object.entries(activeFilters).map(([key, values]) =>
        values.map((value) => (
          <Button
            key={`${key}-${value}`}
            variant="secondary"
            size="sm"
            onClick={() => onClearFilter(key, value)}>
            {key}: {value}
            <X className="ml-2 h-4 w-4" />
          </Button>
        ))
      )}
    </div>
  );
}
