'use client'

import { useState } from 'react'
import { SearchFilters } from './SearchFilters'
import { ParsedSearchParams } from '@/lib/search/params'

interface SearchFiltersWrapperProps {
  currentParams: ParsedSearchParams
}

export function SearchFiltersWrapper({ 
  currentParams
}: SearchFiltersWrapperProps) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  return (
    <SearchFilters
      currentParams={currentParams}
      isOpen={isFiltersOpen}
      onToggle={() => setIsFiltersOpen(!isFiltersOpen)}
    />
  )
}
