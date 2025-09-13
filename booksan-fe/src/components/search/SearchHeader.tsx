import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter } from "lucide-react";

interface SearchHeaderProps {
  query: string;
  onQueryChange: (query: string) => void;
  onToggleFilters: () => void;
}

export function SearchHeader({
  query,
  onQueryChange,
  onToggleFilters,
}: SearchHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex gap-2">
        <Input
          placeholder="Search facilities, sports, or locations..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="flex-1"
        />
        <Button variant="outline" onClick={onToggleFilters} className="px-3">
          <Filter className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
