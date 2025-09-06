import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectOption } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { SearchFilters as SearchFiltersType, Sport, SortBy, SortOrder } from '@/features/search/types'
import { X } from 'lucide-react'

const SPORT_OPTIONS: SelectOption[] = [
  { value: '', label: 'All Sports' },
  { value: Sport.TENNIS, label: 'Tennis' },
  { value: Sport.BASKETBALL, label: 'Basketball' },
  { value: Sport.FOOTBALL, label: 'Football' },
  { value: Sport.BADMINTON, label: 'Badminton' },
  { value: Sport.VOLLEYBALL, label: 'Volleyball' },
  { value: Sport.SWIMMING, label: 'Swimming' },
  { value: Sport.TABLE_TENNIS, label: 'Table Tennis' },
  { value: Sport.SQUASH, label: 'Squash' },
  { value: Sport.GOLF, label: 'Golf' },
  { value: Sport.CRICKET, label: 'Cricket' },
  { value: Sport.HOCKEY, label: 'Hockey' },
  { value: Sport.RUGBY, label: 'Rugby' },
  { value: Sport.BASEBALL, label: 'Baseball' },
  { value: Sport.SOFTBALL, label: 'Softball' },
  { value: Sport.TRACK_AND_FIELD, label: 'Track & Field' },
  { value: Sport.GYM, label: 'Gym' },
  { value: Sport.YOGA, label: 'Yoga' },
  { value: Sport.PILATES, label: 'Pilates' },
  { value: Sport.MARTIAL_ARTS, label: 'Martial Arts' },
  { value: Sport.DANCE, label: 'Dance' },
  { value: Sport.OTHER, label: 'Other' },
]

const DISTANCE_OPTIONS: SelectOption[] = [
  { value: '5km', label: '5 km' },
  { value: '10km', label: '10 km' },
  { value: '25km', label: '25 km' },
  { value: '50km', label: '50 km' },
  { value: '100km', label: '100 km' },
]

const SORT_OPTIONS: SelectOption[] = [
  { value: SortBy.RELEVANCE, label: 'Relevance' },
  { value: SortBy.DISTANCE, label: 'Distance' },
  { value: SortBy.PRICE, label: 'Price' },
  { value: SortBy.RATING, label: 'Rating' },
  { value: SortBy.NAME, label: 'Name' },
]

const SORT_ORDER_OPTIONS: SelectOption[] = [
  { value: SortOrder.ASC, label: 'Ascending' },
  { value: SortOrder.DESC, label: 'Descending' },
]

interface SearchFiltersProps {
  filters: SearchFiltersType
  onFilterChange: (key: keyof SearchFiltersType, value: string | Sport | SortBy | SortOrder | undefined) => void
  isOpen: boolean
  onClose: () => void
}

export function SearchFilters({ 
  filters, 
  onFilterChange, 
  isOpen, 
  onClose 
}: SearchFiltersProps) {
  if (!isOpen) return null

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filters</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Sport</label>
            <Select
              options={SPORT_OPTIONS}
              value={filters.sport || ''}
              onValueChange={(value) => onFilterChange('sport', value || undefined)}
              placeholder="All Sports"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Distance</label>
            <Select
              options={DISTANCE_OPTIONS}
              value={filters.maxDistance}
              onValueChange={(value) => onFilterChange('maxDistance', value)}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Sort By</label>
            <Select
              options={SORT_OPTIONS}
              value={filters.sortBy}
              onValueChange={(value) => onFilterChange('sortBy', value as SortBy)}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Order</label>
            <Select
              options={SORT_ORDER_OPTIONS}
              value={filters.sortOrder}
              onValueChange={(value) => onFilterChange('sortOrder', value as SortOrder)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
