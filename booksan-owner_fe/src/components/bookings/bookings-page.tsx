'use client';

import * as React from 'react';
import { Plus, Search, Filter, Download, Calendar } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BookingCard } from '@/components/bookings/booking-card';
import { CreateBookingDialog } from '@/components/bookings/create-booking-dialog';
import { useBookings } from '@/hooks/use-bookings';
import { BookingFilters, BOOKING_STATUSES } from '@/types/booking';
import { debounce } from '@/lib/utils';
import { bookingApi } from '@/lib/api/bookings';
import { useToast } from '@/components/ui/use-toast';

export function BookingsPage() {
  const { toast } = useToast();
  const [filters, setFilters] = React.useState<BookingFilters>({
    search: '',
    status: 'all',
    courtId: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: '',
    page: 1,
    limit: 12,
  });

  const [showCreateDialog, setShowCreateDialog] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);

  const { bookings, loading, error, refetch } = useBookings(filters);

  // Debounced search
  const debouncedSetSearch = React.useMemo(
    () =>
      debounce((search: string) => {
        setFilters(prev => ({ ...prev, search, page: 1 }));
      }, 300),
    []
  );

  const handleSearchChange = (value: string) => {
    debouncedSetSearch(value);
  };

  const handleFilterChange = (key: keyof BookingFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? undefined : value,
      page: 1,
    }));
  };

  const handleBookingCreated = () => {
    setShowCreateDialog(false);
    refetch();
  };

  const handleBookingUpdated = () => {
    refetch();
  };

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      const blob = await bookingApi.exportBookingsCSV(filters);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bookings-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Export successful',
        description: 'Bookings have been exported to CSV',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Export failed',
        description: error.message || 'Please try again',
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
            <p className="text-muted-foreground">
              Manage your venue bookings and reservations
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-destructive mb-4">
                Failed to load bookings: {error.message}
              </p>
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
          <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
          <p className="text-muted-foreground">
            Manage your venue bookings and reservations
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExportCSV}
            disabled={isExporting}
          >
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Booking
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search & Filter</CardTitle>
          <CardDescription>
            Find bookings by player, court, date, or status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search bookings..."
                onChange={e => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Court Filter */}
            <Select
              value={filters.courtId || 'all'}
              onValueChange={value => handleFilterChange('courtId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Courts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courts</SelectItem>
                {/* {facilities?.data
                  .flatMap(facility => facility.courts || [])
                  .map(court => (
                    <SelectItem key={court.id} value={court.id}>
                      {court.name}
                    </SelectItem>
                  ))} */}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select
              value={filters.status?.toString() || 'all'}
              onValueChange={value => handleFilterChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {BOOKING_STATUSES.map(status => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Date From */}
            <Input
              type="date"
              value={filters.startDate || ''}
              onChange={e =>
                setFilters(prev => ({
                  ...prev,
                  startDate: e.target.value,
                  page: 1,
                }))
              }
            />

            {/* Date To */}
            <Input
              type="date"
              value={filters.endDate || ''}
              onChange={e =>
                setFilters(prev => ({
                  ...prev,
                  endDate: e.target.value,
                  page: 1,
                }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Bookings Grid */}
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
      ) : bookings.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No bookings found</h3>
              <p className="mt-2 text-muted-foreground">
                {filters.search ||
                filters.status !== 'all' ||
                filters.courtId ||
                filters.startDate ||
                filters.endDate
                  ? 'No bookings match your current filters. Try adjusting your search criteria.'
                  : 'No bookings have been created yet.'}
              </p>
              {!filters.search &&
                filters.status === 'all' &&
                !filters.courtId &&
                !filters.startDate &&
                !filters.endDate && (
                  <Button
                    onClick={() => setShowCreateDialog(true)}
                    className="mt-4"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Booking
                  </Button>
                )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map(booking => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onUpdate={handleBookingUpdated}
            />
          ))}
        </div>
      )}

      {/* Pagination - TODO: Add pagination support to hook 
      {bookings && bookings.length > 0 && false && (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, prev.page! - 1) }))}
            disabled={filters.page === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            Page {bookings.page} of {bookings.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setFilters(prev => ({ ...prev, page: prev.page! + 1 }))}
            disabled={filters.page === bookings.totalPages}
          >
            Next
          </Button>
        </div>
      )} */}

      {/* Create Booking Dialog */}
      <CreateBookingDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={handleBookingCreated}
      />
    </div>
  );
}
