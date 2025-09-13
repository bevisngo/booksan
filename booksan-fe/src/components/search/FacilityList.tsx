import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { FacilityCard } from './FacilityCard'
import { SearchFacilitiesResponse, Facility } from '@/features/search/types'

interface FacilityListProps {
  searchResponse?: SearchFacilitiesResponse | undefined
  facilities: Facility[]
  isLoading: boolean
  error: Error | null
  onViewDetails?: (facility: Facility) => void
  onCall?: (facility: Facility) => void
  onVisitWebsite?: (facility: Facility) => void
}

export function FacilityList({ 
  searchResponse, 
  facilities, 
  isLoading, 
  error, 
  onViewDetails, 
  onCall, 
  onVisitWebsite 
}: FacilityListProps) {
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
            {error instanceof Error ? error.message : 'Failed to search facilities'}
          </p>
        </CardContent>
      </Card>
    )
  }

  if (facilities.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">
            No facilities found. Try adjusting your search criteria.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {searchResponse?.total || facilities.length} facilit{(searchResponse?.total || facilities.length) !== 1 ? "ies" : "y"} found
          {searchResponse?.meta?.hasMore && (
            <span className="ml-2 text-xs text-blue-600">
              (showing {facilities.length} of {searchResponse.total})
            </span>
          )}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {facilities.map((facility) => (
          <FacilityCard
            key={facility.id}
            facility={facility}
            {...(onViewDetails && { onViewDetails })}
            {...(onCall && { onCall })}
            {...(onVisitWebsite && { onVisitWebsite })}
          />
        ))}
      </div>
    </>
  )
}
