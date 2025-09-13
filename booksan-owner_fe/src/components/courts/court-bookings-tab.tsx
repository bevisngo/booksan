'use client';

import React, { useState, useMemo } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Eye,
  EyeOff,
  Plus,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useBookings } from '@/hooks/use-bookings';
import { Court } from '@/types/court';
import { BookingStatus, BOOKING_STATUSES } from '@/types/booking';
import { BookingScheduleView } from '../bookings/booking-schedule-view';
import { BookingLegend } from '../bookings/booking-legend';
import { BookingDetailsDialog } from '../bookings/booking-details-dialog';
import { CreateBookingDialog } from '../bookings/create-booking-dialog';

type ViewType = 'day' | 'week' | 'month';
type ScopeType = 'this-court' | 'all-courts';

interface CourtBookingsTabProps {
  court: Court;
  onCreateBooking: () => void;
}

export function CourtBookingsTab({
  court,
  onCreateBooking,
}: CourtBookingsTabProps) {
  const [viewType, setViewType] = useState<ViewType>('day');
  const [scopeType, setScopeType] = useState<ScopeType>('this-court');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>(
    'all'
  );
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null
  );
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createSlotData, setCreateSlotData] = useState<{
    date: string;
    startTime: string;
  } | null>(null);

  // Create stable filters object
  const filters = React.useMemo(
    () => ({
      courtId: scopeType === 'this-court' ? court.id : undefined,
      search: searchQuery || undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      startDate: getDateRangeForView().start,
      endDate: getDateRangeForView().end,
    }),
    [court.id, scopeType, searchQuery, statusFilter, selectedDate, viewType]
  );

  const { bookings, loading, error, fetchBookings } = useBookings(filters);

  // Calculate date range based on view type
  function getDateRangeForView() {
    const date = new Date(selectedDate);

    switch (viewType) {
      case 'day':
        return {
          start: date.toISOString().split('T')[0],
          end: date.toISOString().split('T')[0],
        };

      case 'week':
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        return {
          start: startOfWeek.toISOString().split('T')[0],
          end: endOfWeek.toISOString().split('T')[0],
        };

      case 'month':
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        return {
          start: startOfMonth.toISOString().split('T')[0],
          end: endOfMonth.toISOString().split('T')[0],
        };
    }
  }

  // Navigate dates
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);

    switch (viewType) {
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
    }

    setSelectedDate(newDate);
  };

  // Format date range for display
  const formatDateRange = () => {
    const { start, end } = getDateRangeForView();
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (viewType === 'day') {
      return startDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }

    if (viewType === 'week') {
      if (startDate.getMonth() === endDate.getMonth()) {
        return `${startDate.toLocaleDateString('en-US', { month: 'long' })} ${startDate.getDate()}-${endDate.getDate()}, ${startDate.getFullYear()}`;
      } else {
        return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${startDate.getFullYear()}`;
      }
    }

    return startDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
  };

  // Handle booking click
  const handleBookingClick = (bookingId: string) => {
    setSelectedBookingId(bookingId);
  };

  // Handle empty slot click
  const handleEmptySlotClick = (date: string, startTime: string) => {
    setCreateSlotData({ date, startTime });
    setShowCreateDialog(true);
  };

  // Filter bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      if (scopeType === 'this-court' && booking.courtId !== court.id) {
        return false;
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          booking.player.fullname.toLowerCase().includes(query) ||
          booking.player.email?.toLowerCase().includes(query) ||
          booking.player.phone?.toLowerCase().includes(query) ||
          booking.bookingCode.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [bookings, scopeType, court.id, searchQuery]);

  if (error) {
    return (
      <Card className="p-8 text-center">
        <p className="text-red-500 mb-4">Failed to load bookings</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Left side - View controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* View Type Selector */}
            <div className="flex rounded-md border">
              {(['day', 'week', 'month'] as ViewType[]).map(type => (
                <button
                  key={type}
                  onClick={() => setViewType(type)}
                  className={`px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                    viewType === type
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background hover:bg-muted'
                  } ${type === 'day' ? 'rounded-l-md' : type === 'month' ? 'rounded-r-md' : ''}`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Scope Selector */}
            <div className="flex rounded-md border">
              <button
                onClick={() => setScopeType('this-court')}
                className={`px-3 py-1.5 text-sm font-medium transition-colors rounded-l-md ${
                  scopeType === 'this-court'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background hover:bg-muted'
                }`}
              >
                <Eye className="h-3 w-3 mr-1 inline" />
                This Court
              </button>
              <button
                onClick={() => setScopeType('all-courts')}
                className={`px-3 py-1.5 text-sm font-medium transition-colors rounded-r-md border-l ${
                  scopeType === 'all-courts'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background hover:bg-muted'
                }`}
              >
                <EyeOff className="h-3 w-3 mr-1 inline" />
                All Courts
              </button>
            </div>
          </div>

          {/* Right side - Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search player, code..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 w-48"
              />
            </div>

            {/* Status Filter */}
            <Select
              value={statusFilter}
              onValueChange={value =>
                setStatusFilter(value as BookingStatus | 'all')
              }
            >
              <SelectTrigger className="w-40">
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

            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Date Navigation */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-lg font-semibold">{formatDateRange()}</h2>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedDate(new Date())}
            >
              Today
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <BookingLegend />
            <Button size="sm" onClick={onCreateBooking}>
              <Plus className="h-4 w-4 mr-2" />
              Add Booking
            </Button>
          </div>
        </div>
      </Card>

      {/* Schedule View */}
      <div className="min-h-[500px]">
        <BookingScheduleView
          viewType={viewType}
          selectedDate={selectedDate}
          bookings={filteredBookings}
          courts={scopeType === 'all-courts' ? undefined : [court]}
          loading={loading}
          onBookingClick={handleBookingClick}
          onEmptySlotClick={handleEmptySlotClick}
          court={scopeType === 'this-court' ? court : undefined}
        />
      </div>

      {/* Booking Details Dialog */}
      {selectedBookingId && (
        <BookingDetailsDialog
          bookingId={selectedBookingId}
          isOpen={true}
          onClose={() => setSelectedBookingId(null)}
        />
      )}

      {/* Create Booking Dialog */}
      <CreateBookingDialog
        isOpen={showCreateDialog}
        onClose={() => {
          setShowCreateDialog(false);
          setCreateSlotData(null);
        }}
        courtId={court.id}
        preselectedCourt={court}
        initialDate={createSlotData?.date}
        initialTime={createSlotData?.startTime}
      />
    </div>
  );
}
