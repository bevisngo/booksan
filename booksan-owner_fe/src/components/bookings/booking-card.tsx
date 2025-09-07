'use client';

import * as React from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone,
  Mail,
  MapPin,
  DollarSign,
  MoreHorizontal,
  Edit,
  X,
  Check,
  Eye
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { formatCurrency, formatDate } from '@/lib/utils';
import { bookingApi } from '@/lib/api/bookings';
import type { Booking } from '@/types/booking';
import { BOOKING_STATUSES } from '@/types/booking';

interface BookingCardProps {
  booking: Booking;
  onUpdate: () => void;
}

export function BookingCard({ booking, onUpdate }: BookingCardProps) {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = React.useState(false);

  const statusInfo = BOOKING_STATUSES.find(s => s.value === booking.status);

  const handleCancel = async () => {
    const reason = prompt('Please provide a reason for cancellation:');
    if (!reason) return;

    try {
      setIsUpdating(true);
      await bookingApi.cancelBooking(booking.id, reason);
      toast({
        title: 'Booking canceled',
        description: 'The booking has been successfully canceled',
      });
      onUpdate();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to cancel booking',
        description: error.message || 'Please try again',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMarkPaid = async () => {
    try {
      setIsUpdating(true);
      await bookingApi.markAsPaid(booking.id, !booking.isPaid);
      toast({
        title: booking.isPaid ? 'Marked as unpaid' : 'Marked as paid',
        description: booking.isPaid 
          ? 'Payment status updated to unpaid'
          : 'Payment has been confirmed',
      });
      onUpdate();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to update payment status',
        description: error.message || 'Please try again',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'default';
      case 'PENDING':
        return 'secondary';
      case 'CANCELED':
        return 'destructive';
      case 'COMPLETED':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <Link 
                href={`/bookings/${booking.id}`}
                className="font-semibold text-lg hover:text-primary transition-colors"
              >
                {booking.bookingCode}
              </Link>
              <Badge variant={getStatusBadgeVariant(booking.status)}>
                {statusInfo?.label}
              </Badge>
              {booking.isPaid && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Paid
                </Badge>
              )}
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="line-clamp-1">{booking.courtName}</span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" disabled={isUpdating}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/bookings/${booking.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </DropdownMenuItem>
              
              {booking.status !== 'CANCELED' && booking.status !== 'COMPLETED' && (
                <DropdownMenuItem asChild>
                  <Link href={`/bookings/${booking.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>
              )}
              
              {booking.status === 'CONFIRMED' && (
                <DropdownMenuItem onClick={handleMarkPaid}>
                  <Check className="mr-2 h-4 w-4" />
                  {booking.isPaid ? 'Mark as Unpaid' : 'Mark as Paid'}
                </DropdownMenuItem>
              )}
              
              {booking.status !== 'CANCELED' && booking.status !== 'COMPLETED' && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleCancel}
                    className="text-destructive focus:text-destructive"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Player Information */}
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <User className="w-4 h-4 mr-2 text-muted-foreground" />
            <span className="font-medium">{booking.player.fullname}</span>
          </div>
          
          <div className="flex flex-col gap-1 text-xs text-muted-foreground ml-6">
            {booking.player.phone && (
              <div className="flex items-center">
                <Phone className="w-3 h-3 mr-1" />
                {booking.player.phone}
              </div>
            )}
            {booking.player.email && (
              <div className="flex items-center">
                <Mail className="w-3 h-3 mr-1" />
                {booking.player.email}
              </div>
            )}
          </div>
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
            <span>{formatDate(booking.date)}</span>
          </div>
          
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
            <span>{booking.startTime} - {booking.endTime}</span>
          </div>
        </div>

        {/* Duration and Price */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Duration: </span>
            <span className="font-medium">{booking.duration} mins</span>
          </div>
          
          <div className="flex items-center">
            <DollarSign className="w-4 h-4 mr-1 text-muted-foreground" />
            <span className="font-medium">{formatCurrency(booking.totalAmount)}</span>
          </div>
        </div>

        {/* Notes */}
        {booking.notes && (
          <div className="p-3 bg-muted/50 rounded-md">
            <p className="text-sm text-muted-foreground">
              <strong>Notes:</strong> {booking.notes}
            </p>
          </div>
        )}

        {/* Cancel Reason */}
        {booking.cancelReason && (
          <div className="p-3 bg-destructive/10 rounded-md">
            <p className="text-sm text-destructive">
              <strong>Canceled:</strong> {booking.cancelReason}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Created {formatDate(booking.createdAt)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
