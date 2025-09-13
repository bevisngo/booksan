"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { FacilityCard } from "@/components/search/FacilityCard";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Facility, FacilitySearchResult } from "@/features/search/types";
import { fetchNextFacilitiesPage } from "@/app/(search)/actions";
import { SearchParams } from "@/lib/search/params";
import { useRouter } from "next/navigation";

interface FacilityListClientProps {
  initialData: FacilitySearchResult;
  searchParams: SearchParams;
}

export function FacilityListClient({
  initialData,
  searchParams,
}: FacilityListClientProps) {
  const router = useRouter();
  const [facilities, setFacilities] = useState<Facility[]>(initialData.facilities);
  const [hasMore, setHasMore] = useState(initialData.hasMore);
  const [nextCursor, setNextCursor] = useState(initialData.nextCursor);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Reset state when searchParams change (new search)
  useEffect(() => {
    setFacilities(initialData.facilities);
    setHasMore(initialData.hasMore);
    setNextCursor(initialData.nextCursor);
    setError(null);
  }, [initialData]);

  const loadMoreFacilities = useCallback(() => {
    if (!nextCursor || isLoading || isPending) return;

    setIsLoading(true);
    setError(null);

    startTransition(async () => {
      try {
        const result = await fetchNextFacilitiesPage(searchParams, nextCursor);

        if (result.success && result.data) {
          setFacilities((prev) => [...prev, ...result.data!.facilities]);
          setHasMore(result.data.hasMore);
          setNextCursor(result.data.nextCursor);
        } else {
          setError(result.error || "Failed to load more facilities");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load more facilities"
        );
      } finally {
        setIsLoading(false);
      }
    });
  }, [nextCursor, isLoading, isPending, searchParams]);

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    if (!hasMore || isLoading || isPending) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry && entry.isIntersecting && nextCursor) {
          loadMoreFacilities();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "100px", // Load more when user is 100px from the bottom
      }
    );

    observerRef.current = observer;

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [hasMore, isLoading, isPending, nextCursor, loadMoreFacilities]);

  const handleViewDetails = (facility: Facility) => {
    // Navigate to facility details page
    router.push(`/facilities/${facility.slug}`);
  };

  const handleCall = (facility: Facility) => {
    if (facility.phone) {
      window.open(`tel:${facility.phone}`, "_self");
    }
  };

  const handleVisitWebsite = (facility: Facility) => {
    if (facility.website) {
      window.open(facility.website, "_blank");
    }
  };

  if (facilities.length === 0 && !isLoading && !isPending) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">
            No facilities found. Try adjusting your search criteria.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {initialData.total} facilit{initialData.total !== 1 ? "ies" : "y"} found
          {facilities.length < initialData.total && (
            <span className="ml-2 text-xs text-blue-600">
              (showing {facilities.length} of {initialData.total})
            </span>
          )}
        </p>
      </div>

      {/* Facility grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {facilities.map((facility) => (
          <FacilityCard
            key={facility.id}
            facility={facility}
            onViewDetails={handleViewDetails}
            onCall={handleCall}
            onVisitWebsite={handleVisitWebsite}
          />
        ))}
      </div>

      {/* Loading state for infinite scroll */}
      {(isLoading || isPending) && hasMore && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                  <div className="flex space-x-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-14" />
                  </div>
                  <div className="flex space-x-2">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-800 mb-4">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  loadMoreFacilities();
                }}
                className="text-red-600 hover:text-red-800 underline"
              >
                Try again
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Intersection observer target */}
      {hasMore && !error && (
        <div
          ref={loadMoreRef}
          className="h-10 flex items-center justify-center"
        >
          {!isLoading && !isPending && (
            <p className="text-sm text-muted-foreground">
              Scroll to load more facilities
            </p>
          )}
        </div>
      )}

      {/* End of results message */}
      {!hasMore && facilities.length > 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            You&apos;ve reached the end of the results
          </p>
        </div>
      )}
    </div>
  );
}
