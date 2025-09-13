"use client";

import React, { useState, useTransition, useRef, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectOption, Input, Button, Switch } from "@/components/ui";
import { Label } from "@/components/ui/label";
import { Sport } from "@/features/search/types";
import { ParsedSearchParams } from "@/lib/search/params";
import { X, Filter } from "lucide-react";

const SPORT_OPTIONS: SelectOption[] = [
  { value: "", label: "All Sports" },
  { value: Sport.TENNIS, label: "Tennis" },
  { value: Sport.BASKETBALL, label: "Basketball" },
  { value: Sport.FOOTBALL, label: "Football" },
  { value: Sport.BADMINTON, label: "Badminton" },
  { value: Sport.VOLLEYBALL, label: "Volleyball" },
  { value: Sport.SWIMMING, label: "Swimming" },
  { value: Sport.TABLE_TENNIS, label: "Table Tennis" },
  { value: Sport.SQUASH, label: "Squash" },
  { value: Sport.GOLF, label: "Golf" },
  { value: Sport.CRICKET, label: "Cricket" },
  { value: Sport.HOCKEY, label: "Hockey" },
  { value: Sport.RUGBY, label: "Rugby" },
  { value: Sport.BASEBALL, label: "Baseball" },
  { value: Sport.SOFTBALL, label: "Softball" },
  { value: Sport.TRACK_AND_FIELD, label: "Track & Field" },
  { value: Sport.GYM, label: "Gym" },
  { value: Sport.YOGA, label: "Yoga" },
  { value: Sport.PILATES, label: "Pilates" },
  { value: Sport.MARTIAL_ARTS, label: "Martial Arts" },
  { value: Sport.DANCE, label: "Dance" },
  { value: Sport.OTHER, label: "Other" },
];

const RADIUS_OPTIONS: SelectOption[] = [
  { value: "1", label: "1 km" },
  { value: "5", label: "5 km" },
  { value: "10", label: "10 km" },
  { value: "25", label: "25 km" },
  { value: "50", label: "50 km" },
];

const SORT_OPTIONS: SelectOption[] = [
  { value: "default", label: "Relevance" },
  { value: "distance", label: "Distance" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating_desc", label: "Rating: High to Low" },
];

interface SearchFiltersProps {
  currentParams: ParsedSearchParams;
  isOpen: boolean;
  onToggle: () => void;
}

export function SearchFilters({
  currentParams,
  isOpen,
  onToggle,
}: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Local state for form values
  const [formData, setFormData] = useState({
    q: currentParams.q || "",
    sport: currentParams.sport || "",
    radius_km: currentParams.radius_km.toString(),
    open_now: currentParams.open_now,
    price_min: currentParams.price_min.toString(),
    price_max: currentParams.price_max.toString(),
    sort: currentParams.sort,
  });

  const updateURLParams = useCallback((newParams: Partial<typeof formData>) => {
    const updatedParams = { ...formData, ...newParams };

    // Build new URL with updated params
    const params = new URLSearchParams(searchParams.toString());

    // Update or remove parameters
    Object.entries(updatedParams).forEach(([key, value]) => {
      if (value && value !== "" && value !== "0" && value !== "false") {
        params.set(key, value.toString());
      } else {
        params.delete(key);
      }
    });

    // Remove pagination params when filters change
    params.delete("page");
    params.delete("cursor");

    // Always use /facilities/search as the base path
    const newPath = "/facilities/search";
    const queryString = params.toString();
    const newUrl = `${newPath}${queryString ? `?${queryString}` : ""}`;

    // Navigate to new URL (triggers SSR re-render)
    startTransition(() => {
      router.push(newUrl);
    });
  }, [formData, searchParams, router]);

  const handleInputChange = useCallback((
    key: keyof typeof formData,
    value: string | boolean
  ) => {
    const newFormData = { ...formData, [key]: value };
    setFormData(newFormData);

    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Debounce text inputs, immediate update for others
    if (key === "q") {
      // Debounce text search with 500ms delay
      debounceTimeoutRef.current = setTimeout(() => {
        updateURLParams({ [key]: value as string });
      }, 500);
    } else {
      // Immediate update for dropdowns and switches
      updateURLParams({ [key]: value as string });
    }
  }, [formData, updateURLParams]);

  const handleSearchSubmit = useCallback(() => {
    // Clear any pending debounced search
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    // Immediately trigger search
    updateURLParams({ q: formData.q });
  }, [formData.q, updateURLParams]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchSubmit();
    }
  }, [handleSearchSubmit]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const handleReset = () => {
    const resetFormData = {
      q: "",
      sport: undefined as any,
      radius_km: "10",
      open_now: false,
      price_min: "0",
      price_max: "1000",
      sort: "default" as const,
    };

    setFormData(resetFormData);
    updateURLParams(resetFormData);
  };

  const hasActiveFilters =
    formData.q ||
    formData.sport ||
    formData.radius_km !== "10" ||
    formData.open_now ||
    formData.price_min !== "0" ||
    formData.price_max !== "1000" ||
    formData.sort !== "default";

  return (
    <>
      {/* Search Input and Filter Toggle */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Input
              placeholder="Search facilities, sports, or locations..."
              value={formData.q}
              onChange={(e) => handleInputChange("q", e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full"
              disabled={isPending}
            />
          </div>
          <Button
            onClick={handleSearchSubmit}
            disabled={isPending}
            className="px-4"
          >
            Search
          </Button>
          <Button
            variant="outline"
            onClick={onToggle}
            className="px-3"
            disabled={isPending}
          >
            <Filter className="h-4 w-4" />
            {hasActiveFilters && (
              <span className="ml-2 bg-primary text-primary-foreground rounded-full w-2 h-2" />
            )}
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {isOpen && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Filters</CardTitle>
              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    disabled={isPending}
                  >
                    Reset
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={onToggle}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Sport Filter */}
              <div className="space-y-2">
                <Label>Sport</Label>
                <Select
                  options={SPORT_OPTIONS}
                  value={formData.sport}
                  onValueChange={(value) => handleInputChange("sport", value)}
                  placeholder="All Sports"
                  disabled={isPending}
                />
              </div>

              {/* Radius Filter */}
              <div className="space-y-2">
                <Label>Search Radius</Label>
                <Select
                  options={RADIUS_OPTIONS}
                  value={formData.radius_km}
                  onValueChange={(value) =>
                    handleInputChange("radius_km", value)
                  }
                  disabled={isPending}
                />
              </div>

              {/* Sort Filter */}
              <div className="space-y-2">
                <Label>Sort By</Label>
                <Select
                  options={SORT_OPTIONS}
                  value={formData.sort}
                  onValueChange={(value) => handleInputChange("sort", value)}
                  disabled={isPending}
                />
              </div>

              {/* Price Range */}
              <div className="space-y-2">
                <Label>Min Price ($)</Label>
                <Input
                  type="number"
                  min="0"
                  max="999"
                  value={formData.price_min}
                  onChange={(e) =>
                    handleInputChange("price_min", e.target.value)
                  }
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label>Max Price ($)</Label>
                <Input
                  type="number"
                  min="1"
                  max="1000"
                  value={formData.price_max}
                  onChange={(e) =>
                    handleInputChange("price_max", e.target.value)
                  }
                  disabled={isPending}
                />
              </div>

              {/* Open Now Toggle */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="open-now"
                    checked={formData.open_now}
                    onCheckedChange={(checked) =>
                      handleInputChange("open_now", checked)
                    }
                    disabled={isPending}
                  />
                  <Label htmlFor="open-now">Open Now</Label>
                </div>
              </div>
            </div>

            {/* Loading state */}
            {isPending && (
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Updating results...
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}
