import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Facility } from '@/features/search/types'
import { formatDistance } from '@/lib/location'
import { MapPin, Star, Phone, Globe } from 'lucide-react'

interface FacilityCardProps {
  facility: Facility
  onViewDetails?: (facility: Facility) => void
  onCall?: (facility: Facility) => void
  onVisitWebsite?: (facility: Facility) => void
}

export function FacilityCard({ 
  facility, 
  onViewDetails, 
  onCall, 
  onVisitWebsite 
}: FacilityCardProps) {
  // Get unique sports from courts
  const sports = [...new Set(facility.courts.map(court => court.sport))]
  const activeCourts = facility.courts.filter(court => court.isActive)
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{facility.name}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <MapPin className="h-4 w-4" />
              {facility.address}
            </CardDescription>
          </div>
          {facility.distance && (
            <Badge variant="outline">{formatDistance(facility.distance)}</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {facility.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {facility.description}
          </p>
        )}

        <div className="flex flex-wrap gap-1 mb-3">
          {sports.slice(0, 3).map((sport) => (
            <Badge key={sport} variant="secondary" className="text-xs">
              {sport.replace("_", " ")}
            </Badge>
          ))}
          {sports.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{sports.length - 3} more
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between text-sm mb-3">
          <div className="text-muted-foreground">
            {activeCourts.length} court{activeCourts.length !== 1 ? 's' : ''} available
          </div>
          {facility.rating && facility.reviewCount && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{facility.rating.toFixed(1)}</span>
              <span className="text-muted-foreground">({facility.reviewCount})</span>
            </div>
          )}
        </div>

        {facility.priceRange && (
          <div className="text-sm text-muted-foreground mb-3">
            ${facility.priceRange.min} - ${facility.priceRange.max}
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <Button 
            size="sm" 
            className="flex-1"
            onClick={() => onViewDetails?.(facility)}
          >
            View Details
          </Button>
          {facility.phone && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onCall?.(facility)}
            >
              <Phone className="h-4 w-4" />
            </Button>
          )}
          {facility.website && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onVisitWebsite?.(facility)}
            >
              <Globe className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
