'use client';

import React, { useState } from 'react';
import {
  X,
  Clock,
  User,
  MapPin,
  CreditCard,
  Phone,
  Mail,
  Calendar,
  Edit,
  Trash2,
} from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { BOOKING_STATUSES } from '@/types/booking';
import { bookingApi } from '@/lib/api/bookings';

interface BookingDetailsDialogProps {
  bookingId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function BookingDetailsDialog({
  bookingId,
  isOpen,
  onClose,
}: BookingDetailsDialogProps) {
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCanceling, setIsCanceling] = useState(false);
  const [showCancelReason, setShowCancelReason] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Fetch booking details when dialog opens
  React.useEffect(() => {
    if (isOpen && bookingId) {
      const fetchBooking = async () => {
        try {
          setLoading(true);
          const result = await bookingApi.getBooking(bookingId);
          setBooking(result);
        } catch (error) {
          console.error('Failed to fetch booking:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchBooking();
    }
  }, [isOpen, bookingId]);

  if (!isOpen) {
    return null;
  }

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
            onClick={onClose}
          />
          <Card className="relative w-full max-w-2xl p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Loading booking details...</span>
            </div>
          </Card>
        </div>
      </Dialog>
    );
  }

  if (!booking) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
            onClick={onClose}
          />
          <Card className="relative w-full max-w-2xl p-8 text-center">
            <p className="text-muted-foreground">Booking not found</p>
            <Button onClick={onClose} className="mt-4">Close</Button>
          </Card>
        </div>
      </Dialog>
    );
  }

  const status = BOOKING_STATUSES.find(s => s.value === booking.status);

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      setShowCancelReason(true);
      return;
    }

    setIsCanceling(true);
    try {
      await bookingApi.cancelBooking(bookingId, cancelReason);
      onClose();
    } catch (error) {
      console.error('Failed to cancel booking:', error);
    } finally {
      setIsCanceling(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  };

  const formatDateTime = (date: string, time: string) => {
    const dateTime = new Date(`${date}T${time}`);
    return dateTime.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm"
          onClick={onClose}
        />

        <Card className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-xl font-semibold">Booking Details</h2>
              <p className="text-sm text-muted-foreground">
                #{booking.bookingCode}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              {status && (
                <Badge
                  variant="secondary"
                  className={`bg-${status.color}-100 text-${status.color}-700`}
                >
                  {status.label}
                </Badge>
              )}

              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="space-y-6">
              {/* Booking Information */}
              <div>
                <h3 className="font-medium mb-3 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Booking Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Date & Time
                    </label>
                    <p className="text-sm mt-1">
                      {formatDateTime(booking.date, booking.startTime)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Duration: {booking.duration} minutes
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Court
                    </label>
                    <p className="text-sm mt-1 flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {booking.courtName}
                    </p>
                  </div>
                </div>
              </div>

              {/* Player Information */}
              <div>
                <h3 className="font-medium mb-3 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Player Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Name
                    </label>
                    <p className="text-sm mt-1">{booking.player.fullname}</p>
                  </div>

                  {booking.player.email && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Email
                      </label>
                      <p className="text-sm mt-1 flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {booking.player.email}
                      </p>
                    </div>
                  )}

                  {booking.player.phone && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Phone
                      </label>
                      <p className="text-sm mt-1 flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {booking.player.phone}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Information */}
              <div>
                <h3 className="font-medium mb-3 flex items-center">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Payment Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Base Price
                    </label>
                    <p className="text-sm mt-1">
                      {formatCurrency(booking.basePrice)}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Total Amount
                    </label>
                    <p className="text-sm mt-1 font-medium">
                      {formatCurrency(booking.totalAmount)}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Payment Status
                    </label>
                    <div className="mt-1">
                      <Badge variant={booking.isPaid ? 'default' : 'secondary'}>
                        {booking.isPaid ? 'Paid' : 'Unpaid'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {booking.notes && (
                <div>
                  <h3 className="font-medium mb-3">Notes</h3>
                  <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded">
                    {booking.notes}
                  </p>
                </div>
              )}

              {/* Cancel Reason */}
              {booking.cancelReason && (
                <div>
                  <h3 className="font-medium mb-3 text-red-600">
                    Cancellation Reason
                  </h3>
                  <p className="text-sm text-red-600 bg-red-50 p-3 rounded">
                    {booking.cancelReason}
                  </p>
                </div>
              )}

              {/* Timestamps */}
              <div>
                <h3 className="font-medium mb-3">Timestamps</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="font-medium text-muted-foreground">
                      Created At
                    </label>
                    <p className="mt-1">
                      {new Date(booking.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <label className="font-medium text-muted-foreground">
                      Updated At
                    </label>
                    <p className="mt-1">
                      {new Date(booking.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Cancel Reason Input */}
              {showCancelReason && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Cancellation Reason
                  </label>
                  <textarea
                    value={cancelReason}
                    onChange={e => setCancelReason(e.target.value)}
                    placeholder="Please provide a reason for cancellation..."
                    className="w-full mt-2 p-3 border rounded-md"
                    rows={3}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          {booking.status !== 'CANCELED' && (
            <div className="flex items-center justify-between p-6 border-t bg-muted/30">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Booking
                </Button>

                {!booking.isPaid && (
                  <Button variant="outline" size="sm">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Mark as Paid
                  </Button>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {showCancelReason ? (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCancelReason(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleCancel}
                      disabled={isCanceling || !cancelReason.trim()}
                    >
                      {isCanceling ? 'Canceling...' : 'Confirm Cancel'}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowCancelReason(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Cancel Booking
                  </Button>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    </Dialog>
  );
}
