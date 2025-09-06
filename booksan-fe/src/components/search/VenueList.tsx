import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { VenueCard } from './VenueCard'
import { SearchVenuesResponse, Venue } from '@/features/search/types'

interface VenueListProps {
  searchResponse?: SearchVenuesResponse | undefined
  venues: Venue[]
  isLoading: boolean
  error: Error | null
  onViewDetails?: (venue: Venue) => void
  onCall?: (venue: Venue) => void
  onVisitWebsite?: (venue: Venue) => void
}

export function VenueList({ 
  searchResponse, 
  venues, 
  isLoading, 
  error, 
  onViewDetails, 
  onCall, 
  onVisitWebsite 
}: VenueListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
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
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <p className="text-red-800">
            {error instanceof Error ? error.message : 'Failed to search venues'}
          </p>
        </CardContent>
      </Card>
    )
  }

  if (venues.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">
            No venues found. Try adjusting your search criteria.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {searchResponse?.total || venues.length} venue{(searchResponse?.total || venues.length) !== 1 ? "s" : ""} found
          {searchResponse?.meta?.hasMore && (
            <span className="ml-2 text-xs text-blue-600">
              (showing {venues.length} of {searchResponse.total})
            </span>
          )}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {venues.map((venue) => (
          <VenueCard
            key={venue.id}
            venue={venue}
            {...(onViewDetails && { onViewDetails })}
            {...(onCall && { onCall })}
            {...(onVisitWebsite && { onVisitWebsite })}
          />
        ))}
      </div>
    </>
  )
}
