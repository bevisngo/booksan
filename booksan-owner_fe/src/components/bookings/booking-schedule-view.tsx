'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Plus } from 'lucide-react';
import { Booking, BOOKING_STATUSES } from '@/types/booking';
import { Court } from '@/types/court';

type ViewType = 'day' | 'week' | 'month';

interface BookingScheduleViewProps {
  viewType: ViewType;
  selectedDate: Date;
  bookings: Booking[];
  courts?: Court[];
  loading?: boolean;
  onBookingClick: (bookingId: string) => void;
  onEmptySlotClick: (date: string, startTime: string) => void;
  court?: Court;
}

export function BookingScheduleView({
  viewType,
  selectedDate,
  bookings,
  courts,
  loading,
  onBookingClick,
  onEmptySlotClick,
  court
}: BookingScheduleViewProps) {
  if (loading) {
    return (
      <Card className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/4"></div>
          <div className="space-y-2">
            <div className="h-16 bg-muted rounded"></div>
            <div className="h-16 bg-muted rounded"></div>
            <div className="h-16 bg-muted rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (viewType === 'day') {
    return <DayView 
      selectedDate={selectedDate}
      bookings={bookings}
      court={court}
      onBookingClick={onBookingClick}
      onEmptySlotClick={onEmptySlotClick}
    />;
  }

  if (viewType === 'week') {
    return <WeekView 
      selectedDate={selectedDate}
      bookings={bookings}
      courts={courts}
      court={court}
      onBookingClick={onBookingClick}
      onEmptySlotClick={onEmptySlotClick}
    />;
  }

  return <MonthView 
    selectedDate={selectedDate}
    bookings={bookings}
    courts={courts}
    onBookingClick={onBookingClick}
  />;
}

// Day View Component
function DayView({ 
  selectedDate, 
  bookings, 
  court,
  onBookingClick, 
  onEmptySlotClick 
}: {
  selectedDate: Date;
  bookings: Booking[];
  court?: Court;
  onBookingClick: (bookingId: string) => void;
  onEmptySlotClick: (date: string, startTime: string) => void;
}) {
  const dateStr = selectedDate.toISOString().split('T')[0];
  const dayBookings = bookings.filter(b => b.date === dateStr);
  
  // Operating hours (6 AM to 11 PM)
  const startHour = 6;
  const endHour = 23;
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);

  const getBookingForSlot = (hour: number) => {
    const timeStr = `${hour.toString().padStart(2, '0')}:00`;
    return dayBookings.find(booking => {
      const [startHour] = booking.startTime.split(':').map(Number);
      const [endHour] = booking.endTime.split(':').map(Number);
      return hour >= startHour && hour < endHour;
    });
  };

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          {selectedDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          })}
          {court && <span className="ml-2 text-muted-foreground">- {court.name}</span>}
        </h3>
      </div>

      <div className="space-y-1">
        {hours.map(hour => {
          const booking = getBookingForSlot(hour);
          const timeStr = `${hour.toString().padStart(2, '0')}:00`;
          
          return (
            <div key={hour} className="flex items-center border rounded-lg">
              <div className="w-20 p-3 text-sm font-medium border-r bg-muted/30">
                {timeStr}
              </div>
              
              <div className="flex-1 min-h-[60px]">
                {booking ? (
                  <BookingSlot 
                    booking={booking} 
                    onClick={() => onBookingClick(booking.id)}
                  />
                ) : (
                  <EmptySlot 
                    onClick={() => onEmptySlotClick(dateStr, timeStr)}
                    timeStr={timeStr}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {dayBookings.length === 0 && (
        <EmptyState 
          date={dateStr}
          onCreateBooking={onEmptySlotClick}
        />
      )}
    </Card>
  );
}

// Week View Component
function WeekView({ 
  selectedDate, 
  bookings, 
  courts,
  court,
  onBookingClick, 
  onEmptySlotClick 
}: {
  selectedDate: Date;
  bookings: Booking[];
  courts?: Court[];
  court?: Court;
  onBookingClick: (bookingId: string) => void;
  onEmptySlotClick: (date: string, startTime: string) => void;
}) {
  const startOfWeek = new Date(selectedDate);
  startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
  
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    return day;
  });

  const hours = Array.from({ length: 18 }, (_, i) => 6 + i); // 6 AM to 11 PM

  return (
    <Card className="p-6">
      <div className="grid grid-cols-8 gap-1">
        {/* Time column header */}
        <div className="p-2 text-sm font-medium">Time</div>
        
        {/* Day headers */}
        {weekDays.map(day => (
          <div key={day.toISOString()} className="p-2 text-sm font-medium text-center">
            <div>{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
            <div className="text-xs text-muted-foreground">
              {day.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}
            </div>
          </div>
        ))}

        {/* Time slots */}
        {hours.map(hour => (
          <React.Fragment key={hour}>
            {/* Time label */}
            <div className="p-2 text-xs font-medium bg-muted/30 border rounded">
              {hour.toString().padStart(2, '0')}:00
            </div>
            
            {/* Day slots */}
            {weekDays.map(day => {
              const dateStr = day.toISOString().split('T')[0];
              const timeStr = `${hour.toString().padStart(2, '0')}:00`;
              const dayBookings = bookings.filter(b => 
                b.date === dateStr && 
                (!court || b.courtId === court.id)
              );
              
              const slotBooking = dayBookings.find(booking => {
                const [startHour] = booking.startTime.split(':').map(Number);
                const [endHour] = booking.endTime.split(':').map(Number);
                return hour >= startHour && hour < endHour;
              });

              return (
                <div key={`${day.toISOString()}-${hour}`} className="min-h-[50px] border rounded">
                  {slotBooking ? (
                    <BookingSlot 
                      booking={slotBooking} 
                      onClick={() => onBookingClick(slotBooking.id)}
                      compact
                    />
                  ) : (
                    <EmptySlot 
                      onClick={() => onEmptySlotClick(dateStr, timeStr)}
                      compact
                    />
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </Card>
  );
}

// Month View Component
function MonthView({ 
  selectedDate, 
  bookings, 
  courts,
  onBookingClick 
}: {
  selectedDate: Date;
  bookings: Booking[];
  courts?: Court[];
  onBookingClick: (bookingId: string) => void;
}) {
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());
  
  const weeks = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= lastDay || weeks.length < 6) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      week.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    weeks.push(week);
    if (currentDate.getMonth() > month) break;
  }

  return (
    <Card className="p-6">
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-sm font-medium text-center border-b">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {weeks.map((week, weekIndex) =>
          week.map((day, dayIndex) => {
            const dateStr = day.toISOString().split('T')[0];
            const dayBookings = bookings.filter(b => b.date === dateStr);
            const isCurrentMonth = day.getMonth() === month;
            const isToday = day.toDateString() === new Date().toDateString();

            return (
              <div 
                key={`${weekIndex}-${dayIndex}`} 
                className={`min-h-[100px] p-1 border rounded ${
                  isCurrentMonth ? 'bg-background' : 'bg-muted/30'
                } ${isToday ? 'ring-2 ring-primary' : ''}`}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {day.getDate()}
                </div>
                
                <div className="space-y-1">
                  {dayBookings.slice(0, 3).map(booking => (
                    <button
                      key={booking.id}
                      onClick={() => onBookingClick(booking.id)}
                      className="w-full text-left"
                    >
                      <div className="text-xs p-1 rounded bg-primary/10 text-primary truncate">
                        {booking.startTime} - {booking.player.fullname}
                      </div>
                    </button>
                  ))}
                  
                  {dayBookings.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{dayBookings.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}

// Booking Slot Component
function BookingSlot({ 
  booking, 
  onClick, 
  compact = false 
}: { 
  booking: Booking; 
  onClick: () => void;
  compact?: boolean;
}) {
  const status = BOOKING_STATUSES.find(s => s.value === booking.status);
  
  return (
    <button
      onClick={onClick}
      className={`w-full h-full p-2 text-left hover:bg-muted/50 transition-colors ${
        compact ? 'text-xs' : 'text-sm'
      }`}
    >
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-medium truncate">{booking.player.fullname}</span>
          {status && (
            <Badge 
              variant="secondary" 
              className={`text-xs bg-${status.color}-100 text-${status.color}-700`}
            >
              {status.label}
            </Badge>
          )}
        </div>
        
        {!compact && (
          <>
            <div className="flex items-center text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              {booking.startTime} - {booking.endTime}
            </div>
            
            <div className="flex items-center text-muted-foreground">
              <User className="h-3 w-3 mr-1" />
              {booking.bookingCode}
            </div>
          </>
        )}
      </div>
    </button>
  );
}

// Empty Slot Component
function EmptySlot({ 
  onClick, 
  timeStr,
  compact = false 
}: { 
  onClick: () => void;
  timeStr?: string;
  compact?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full h-full p-2 text-left hover:bg-muted/30 transition-colors border-dashed border-2 border-transparent hover:border-muted-foreground/30 ${
        compact ? 'text-xs' : 'text-sm'
      }`}
    >
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <Plus className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} mr-1`} />
        {!compact && <span>Add booking</span>}
      </div>
    </button>
  );
}

// Empty State Component
function EmptyState({ 
  date, 
  onCreateBooking 
}: { 
  date: string; 
  onCreateBooking: (date: string, startTime: string) => void;
}) {
  return (
    <div className="text-center py-12">
      <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">No bookings for this day</h3>
      <p className="text-muted-foreground mb-4">
        Get started by creating your first booking
      </p>
      <Button onClick={() => onCreateBooking(date, '09:00')}>
        <Plus className="h-4 w-4 mr-2" />
        Add First Booking
      </Button>
    </div>
  );
}
