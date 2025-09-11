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
import { CourtCard } from '@/components/courts/court-card';
import { CreateCourtDialog } from '@/components/courts/create-court-dialog';
import { useCourts, useCourtMutations } from '@/hooks/use-courts';
import { CourtFilters, Sport, Surface } from '@/types/court';
import { SPORT_DISPLAY_NAMES, SURFACE_DISPLAY_NAMES } from '@/types/court';
import { debounce } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

interface CourtsPageProps {
  facilityId?: string;
}

export function CourtsPage({ facilityId }: CourtsPageProps) {
  const [filters, setFilters] = React.useState<CourtFilters>({
    facilityId,
    isActive: true,
  });
  
  const [showCreateDialog, setShowCreateDialog] = React.useState(false);
  const [editingCourt, setEditingCourt] = React.useState<any>(null);
  
  const { courts, loading, error, refetch } = useCourts(filters);
  const { 
    createCourt, 
    updateCourt, 
    deleteCourt, 
    activateCourt, 
    deactivateCourt,
    loading: mutationLoading 
  } = useCourtMutations();

  // Debounced search
  const debouncedSetSearch = React.useMemo(
    () => debounce((search: string) => {
      setFilters(prev => ({ ...prev, search }));
    }, 300),
    []
  );

  const handleSearchChange = (value: string) => {
    debouncedSetSearch(value);
  };

  const handleFilterChange = (key: keyof CourtFilters, value: string) => {
    if (value === 'all') {
      setFilters(prev => {
        const newFilters = { ...prev };
        delete newFilters[key as keyof CourtFilters];
        return newFilters;
      });
    } else {
      setFilters(prev => ({ ...prev, [key]: value }));
    }
  };

  const handleCourtCreated = async (data: any) => {
    try {
      await createCourt(data);
      setShowCreateDialog(false);
      refetch();
      toast({
        title: 'Success',
        description: 'Court created successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create court',
        variant: 'destructive',
      });
    }
  };

  const handleCourtUpdated = async (data: any) => {
    if (!editingCourt) return;
    
    try {
      await updateCourt(editingCourt.id, data);
      setEditingCourt(null);
      refetch();
      toast({
        title: 'Success',
        description: 'Court updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update court',
        variant: 'destructive',
      });
    }
  };

  const handleCourtDeleted = async (id: string) => {
    try {
      await deleteCourt(id);
      refetch();
      toast({
        title: 'Success',
        description: 'Court deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete court',
        variant: 'destructive',
      });
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      if (isActive) {
        await activateCourt(id);
      } else {
        await deactivateCourt(id);
      }
      refetch();
      toast({
        title: 'Success',
        description: `Court ${isActive ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${isActive ? 'activate' : 'deactivate'} court`,
        variant: 'destructive',
      });
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Courts</h1>
            <p className="text-muted-foreground">
              Manage your sports courts
            </p>
          </div>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-destructive mb-4">Failed to load courts: {error.message}</p>
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
          <h1 className="text-3xl font-bold tracking-tight">Courts</h1>
          <p className="text-muted-foreground">
            Manage your sports courts
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Court
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search & Filter</CardTitle>
          <CardDescription>
            Find courts by name, sport, or surface type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search courts..."
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select
              value={filters.sport || 'all'}
              onValueChange={(value) => handleFilterChange('sport', value)}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Sport" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sports</SelectItem>
                {Object.entries(SPORT_DISPLAY_NAMES).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select
              value={filters.surface || 'all'}
              onValueChange={(value) => handleFilterChange('surface', value)}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Surface" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Surfaces</SelectItem>
                {Object.entries(SURFACE_DISPLAY_NAMES).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.indoor === undefined ? 'all' : filters.indoor.toString()}
              onValueChange={(value) => handleFilterChange('indoor', value)}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="true">Indoor</SelectItem>
                <SelectItem value="false">Outdoor</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.isActive === undefined ? 'all' : filters.isActive.toString()}
              onValueChange={(value) => handleFilterChange('isActive', value)}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Courts Grid */}
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
      ) : courts.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No courts found</h3>
              <p className="mt-2 text-muted-foreground">
                {Object.keys(filters).length > 1
                  ? 'No courts match your current filters. Try adjusting your search criteria.'
                  : 'Get started by creating your first court.'}
              </p>
              {Object.keys(filters).length <= 1 && (
                <Button
                  onClick={() => setShowCreateDialog(true)}
                  className="mt-4"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Court
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courts.map((court) => (
            <CourtCard
              key={court.id}
              court={court}
              onUpdate={() => setEditingCourt(court)}
              onDelete={handleCourtDeleted}
              onToggleActive={handleToggleActive}
            />
          ))}
        </div>
      )}

      {/* Create Court Dialog */}
      <CreateCourtDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={handleCourtCreated}
        facilityId={facilityId}
      />

      {/* Edit Court Dialog */}
      <CreateCourtDialog
        open={!!editingCourt}
        onOpenChange={(open) => !open && setEditingCourt(null)}
        onSuccess={handleCourtUpdated}
        court={editingCourt}
      />
    </div>
  );
}
