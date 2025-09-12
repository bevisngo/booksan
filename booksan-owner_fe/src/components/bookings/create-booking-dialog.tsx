'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarIcon, Clock, DollarSign, User } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { formatCurrency } from '@/lib/utils';
import { bookingApi } from '@/lib/api/bookings';
import { useFacilities } from '@/hooks/use-facilities';
import type { CreateBookingData, PriceSimulation } from '@/types/booking';

const bookingSchema = z.object({
  courtId: z.string().min(1, 'Court is required'),
  playerName: z.string().min(1, 'Player name is required'),
  playerEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  playerPhone: z.string().min(10, 'Phone number must be at least 10 characters').optional().or(z.literal('')),
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  duration: z.number().min(15, 'Duration must be at least 15 minutes'),
  notes: z.string().optional(),
}).refine((data) => data.playerEmail || data.playerPhone, {
  message: 'Either email or phone is required',
  path: ['playerEmail'],
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface CreateBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateBookingDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateBookingDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [priceSimulation, setPriceSimulation] = React.useState<PriceSimulation | null>(null);
  const [isSimulating, setIsSimulating] = React.useState(false);

  const { facilities } = useFacilities({ limit: 100 });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      duration: 60,
      date: format(new Date(), 'yyyy-MM-dd'),
    },
  });

  const courtId = watch('courtId');
  const date = watch('date');
  const startTime = watch('startTime');
  const duration = watch('duration');

  // Get selected court info
  const selectedCourt = facilities?.data
    .flatMap(facility => facility.courts || [])
    .find(court => court.id === courtId);

  // Duration options based on selected court's slot length
  const getDurationOptions = () => {
    if (!selectedCourt) return [30, 60, 90, 120];
    const slotLength = selectedCourt.slotMinutes;
    return Array.from({ length: 8 }, (_, i) => slotLength * (i + 1));
  };

  // Simulate price when booking details change
  React.useEffect(() => {
    if (courtId && date && startTime && duration) {
      simulatePrice();
    } else {
      setPriceSimulation(null);
    }
  }, [courtId, date, startTime, duration]);

  const simulatePrice = async () => {
    try {
      setIsSimulating(true);
      const simulation = await bookingApi.simulatePrice({
        courtId,
        date,
        startTime,
        duration,
      });
      setPriceSimulation(simulation);
    } catch (error: any) {
      console.error('Price simulation error:', error);
      setPriceSimulation(null);
    } finally {
      setIsSimulating(false);
    }
  };

  const onSubmit = async (data: BookingFormData) => {
    try {
      setIsSubmitting(true);
      
      const createData: CreateBookingData = {
        courtId: data.courtId,
        playerData: {
          fullname: data.playerName,
          email: data.playerEmail || undefined,
          phone: data.playerPhone || undefined,
        },
        date: data.date,
        startTime: data.startTime,
        duration: data.duration,
        notes: data.notes || undefined,
      };

      await bookingApi.createBooking(createData);
      
      toast({
        title: 'Booking created successfully',
        description: 'The new booking has been added to your schedule.',
      });
      
      reset();
      setPriceSimulation(null);
      onSuccess();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to create booking',
        description: error.message || 'Please try again',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isSubmitting) {
      reset();
      setPriceSimulation(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Booking</DialogTitle>
          <DialogDescription>
            Create a new booking for your facility. Fill in the details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Court Selection */}
          <div className="space-y-2">
            <Label>Court</Label>
            <Select
              value={courtId}
              onValueChange={(value) => setValue('courtId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a court" />
              </SelectTrigger>
              <SelectContent>
                {facilities?.data.flatMap(facility => 
                  (facility.courts || []).map(court => ({ 
                    ...court, 
                    facilityName: facility.name 
                  }))
                ).map((court) => (
                  <SelectItem key={court.id} value={court.id}>
                    {court.name} - {court.sport}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.courtId && (
              <p className="text-sm text-destructive">{errors.courtId.message}</p>
            )}
          </div>

          {/* Player Information */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center">
              <User className="h-4 w-4 mr-2" />
              Player Information
            </h4>
            
            <div className="space-y-2">
              <Label htmlFor="playerName">Full Name</Label>
              <Input
                id="playerName"
                placeholder="Enter player's full name"
                {...register('playerName')}
              />
              {errors.playerName && (
                <p className="text-sm text-destructive">{errors.playerName.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="playerEmail">Email</Label>
                <Input
                  id="playerEmail"
                  type="email"
                  placeholder="player@email.com"
                  {...register('playerEmail')}
                />
                {errors.playerEmail && (
                  <p className="text-sm text-destructive">{errors.playerEmail.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="playerPhone">Phone</Label>
                <Input
                  id="playerPhone"
                  type="tel"
                  placeholder="+84 123 456 789"
                  {...register('playerPhone')}
                />
                {errors.playerPhone && (
                  <p className="text-sm text-destructive">{errors.playerPhone.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Booking Details
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  min={format(new Date(), 'yyyy-MM-dd')}
                  {...register('date')}
                />
                {errors.date && (
                  <p className="text-sm text-destructive">{errors.date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  {...register('startTime')}
                />
                {errors.startTime && (
                  <p className="text-sm text-destructive">{errors.startTime.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Duration</Label>
              <Select
                value={duration?.toString()}
                onValueChange={(value) => setValue('duration', parseInt(value))}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {getDurationOptions().map((mins) => (
                    <SelectItem key={mins} value={mins.toString()}>
                      {mins} minutes
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedCourt && (
                <p className="text-xs text-muted-foreground">
                  Court slot length: {selectedCourt.slotMinutes} minutes
                </p>
              )}
              {errors.duration && (
                <p className="text-sm text-destructive">{errors.duration.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any special requests or notes..."
                rows={3}
                {...register('notes')}
              />
            </div>
          </div>

          {/* Price Preview */}
          {priceSimulation && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Price Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Duration:</span>
                  <span>{priceSimulation.breakdown.duration} minutes</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Rate per hour:</span>
                  <span>{formatCurrency(priceSimulation.breakdown.pricePerHour)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(priceSimulation.breakdown.subtotal)}</span>
                </div>
                <div className="flex justify-between font-medium text-lg pt-2 border-t">
                  <span>Total Amount:</span>
                  <span>{formatCurrency(priceSimulation.totalAmount)}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {isSimulating && (
            <div className="text-center text-sm text-muted-foreground">
              Calculating price...
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !priceSimulation}>
              {isSubmitting ? 'Creating...' : 'Create Booking'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
