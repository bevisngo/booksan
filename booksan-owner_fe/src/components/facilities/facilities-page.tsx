'use client';

import * as React from 'react';
import { Plus, Search, Filter, Building2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FacilityCard } from '@/components/facilities/facility-card';
import { CreateFacilityDialog } from '@/components/facilities/create-facility-dialog';
import { useFacilities } from '@/hooks/use-facilities';
import { FacilityFilters } from '@/types/facility';
import { debounce } from '@/lib/utils';

export function FacilitiesPage() {
  const [filters, setFilters] = React.useState<FacilityFilters>({
    search: '',
    status: 'all',
    page: 1,
    limit: 12,
  });
  
  const [showCreateDialog, setShowCreateDialog] = React.useState(false);
  const { facilities, loading, error, refetch } = useFacilities(filters);

  // Debounced search
  const debouncedSetSearch = React.useMemo(
    () => debounce((search: string) => {
      setFilters(prev => ({ ...prev, search, page: 1 }));
    }, 300),
    []
  );

  const handleSearchChange = (value: string) => {
    debouncedSetSearch(value);
  };

  const handleFilterChange = (key: keyof FacilityFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleFacilityCreated = () => {
    setShowCreateDialog(false);
    refetch();
  };

  const handleFacilityUpdated = () => {
    refetch();
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Facilities</h1>
            <p className="text-muted-foreground">
              Manage your sports facilities and courts
            </p>
          </div>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-destructive mb-4">Failed to load facilities: {error.message}</p>
              <Button onClick={refetch}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Facilities</h1>
          <p className="text-muted-foreground">
            Manage your sports facilities and courts
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Facility
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search & Filter</CardTitle>
          <CardDescription>
            Find facilities by name, address, or description
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search facilities..."
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="unpublished">Unpublished</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Venues Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : facilities?.data?.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No facilities found</h3>
              <p className="mt-2 text-muted-foreground">
                {filters.search || filters.status !== 'all'
                  ? 'No facilities match your current filters. Try adjusting your search criteria.'
                  : 'Get started by creating your first facility.'}
              </p>
              {(!filters.search && filters.status === 'all') && (
                <Button
                  onClick={() => setShowCreateDialog(true)}
                  className="mt-4"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Venue
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities?.data?.map((facility) => (
            <FacilityCard
              key={facility.id}
              facility={facility}
              onUpdate={refetch}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {facilities && facilities.totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, prev.page! - 1) }))}
            disabled={filters.page === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            Page {facilities.page} of {facilities.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setFilters(prev => ({ ...prev, page: prev.page! + 1 }))}
            disabled={filters.page === facilities.totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Create Venue Dialog */}
      <CreateFacilityDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={handleFacilityCreated}
      />
    </div>
  );
}
