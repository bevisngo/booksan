import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Venue } from '@/features/search/types'
import { formatDistance } from '@/lib/location'
import { MapPin, Star, Phone, Globe } from 'lucide-react'

interface VenueCardProps {
  venue: Venue
  onViewDetails?: (venue: Venue) => void
  onCall?: (venue: Venue) => void
  onVisitWebsite?: (venue: Venue) => void
}

export function VenueCard({ 
  venue, 
  onViewDetails, 
  onCall, 
  onVisitWebsite 
}: VenueCardProps) {
  // Get unique sports from courts
  const sports = [...new Set(venue.courts.map(court => court.sport))]
  const activeCourts = venue.courts.filter(court => court.isActive)
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{venue.name}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <MapPin className="h-4 w-4" />
              {venue.address}
            </CardDescription>
          </div>
          {venue.distance && (
            <Badge variant="outline">{formatDistance(venue.distance)}</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {venue.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {venue.description}
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
          {venue.rating && venue.reviewCount && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{venue.rating.toFixed(1)}</span>
              <span className="text-muted-foreground">({venue.reviewCount})</span>
            </div>
          )}
        </div>

        {venue.priceRange && (
          <div className="text-sm text-muted-foreground mb-3">
            ${venue.priceRange.min} - ${venue.priceRange.max}
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <Button 
            size="sm" 
            className="flex-1"
            onClick={() => onViewDetails?.(venue)}
          >
            View Details
          </Button>
          {venue.phone && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onCall?.(venue)}
            >
              <Phone className="h-4 w-4" />
            </Button>
          )}
          {venue.website && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onVisitWebsite?.(venue)}
            >
              <Globe className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
