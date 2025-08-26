"use client";

import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface PeerFilters {
  searchQuery: string;
}

interface PeerSearchFiltersProps {
  filters: PeerFilters;
  onFiltersChange: (filters: PeerFilters) => void;
}

export const PeerSearchFilters: React.FC<PeerSearchFiltersProps> = ({
  filters,
  onFiltersChange,
}) => {
  const updateFilter = (
    key: keyof PeerFilters,
    value: string | boolean | null
  ) => {
    onFiltersChange({
      ...filters,
    });
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search peers by name, username, major, or university..."
          value={filters.searchQuery}
          onChange={(e) => updateFilter("searchQuery", e.target.value)}
          className="pl-10"
        />
      </div>
    </div>
  );
};
