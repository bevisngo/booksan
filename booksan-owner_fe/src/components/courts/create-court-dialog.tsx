'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

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
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import {
  Court,
  CreateCourtData,
  UpdateCourtData,
  Sport,
  Surface,
  SLOT_DURATIONS,
} from '@/types/court';
import { SPORT_DISPLAY_NAMES, SURFACE_DISPLAY_NAMES } from '@/types/court';

const courtSchema = z.object({
  facilityId: z.string().min(1, 'Facility is required'),
  name: z.string().min(1, 'Court name is required'),
  sport: z.nativeEnum(Sport, { required_error: 'Sport is required' }),
  surface: z.nativeEnum(Surface).optional(),
  indoor: z.boolean().default(false),
  notes: z.string().optional(),
  slotMinutes: z.number().min(15).max(480),
  isActive: z.boolean().default(true),
});

type CourtFormData = z.infer<typeof courtSchema>;

interface CreateCourtDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (court: Court) => void;
  facilityId?: string;
  court?: Court; // For editing
}

export function CreateCourtDialog({
  open,
  onOpenChange,
  onSuccess,
  facilityId,
  court,
}: CreateCourtDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<CourtFormData>({
    resolver: zodResolver(courtSchema),
    defaultValues: {
      facilityId: facilityId || court?.facilityId || '',
      name: court?.name || '',
      sport: court?.sport || Sport.TENNIS,
      surface: court?.surface,
      indoor: court?.indoor || false,
      notes: court?.notes || '',
      slotMinutes: court?.slotMinutes || 60,
      isActive: court?.isActive ?? true,
    },
  });

  React.useEffect(() => {
    if (court) {
      form.reset({
        facilityId: court.facilityId,
        name: court.name,
        sport: court.sport,
        surface: court.surface,
        indoor: court.indoor,
        notes: court.notes,
        slotMinutes: court.slotMinutes,
        isActive: court.isActive,
      });
    } else if (facilityId) {
      form.reset({
        facilityId,
        name: '',
        sport: Sport.TENNIS,
        surface: undefined,
        indoor: false,
        notes: '',
        slotMinutes: 60,
        isActive: true,
      });
    }
  }, [court, facilityId, form]);

  const onSubmit = async (data: CourtFormData) => {
    setIsSubmitting(true);
    try {
      // This will be handled by the parent component
      onSuccess(data as any);
      toast({
        title: 'Success',
        description: court ? 'Court updated successfully' : 'Court created successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save court. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!isSubmitting) {
      onOpenChange(open);
      if (!open) {
        form.reset();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{court ? 'Edit Court' : 'Create New Court'}</DialogTitle>
          <DialogDescription>
            {court
              ? 'Update the court information below.'
              : 'Add a new court to your facility. Fill in the details below.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Court Name</Label>
            <Input
              id="name"
              placeholder="e.g., Court 1, Main Court"
              {...form.register('name')}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-600">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sport">Sport</Label>
              <Select
                value={form.watch('sport')}
                onValueChange={value => form.setValue('sport', value as Sport)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sport" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SPORT_DISPLAY_NAMES).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.sport && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.sport.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="surface">Surface (Optional)</Label>
              <Select
                value={form.watch('surface') || ''}
                onValueChange={value => form.setValue('surface', value ? (value as Surface) : undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select surface" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No surface specified</SelectItem>
                  {Object.entries(SURFACE_DISPLAY_NAMES).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.surface && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.surface.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="slotMinutes">Slot Duration (minutes)</Label>
              <Select
                value={form.watch('slotMinutes').toString()}
                onValueChange={value => form.setValue('slotMinutes', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {SLOT_DURATIONS.map(duration => (
                    <SelectItem key={duration} value={duration.toString()}>
                      {duration} minutes
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.slotMinutes && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.slotMinutes.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="indoor"
                  checked={form.watch('indoor')}
                  onCheckedChange={checked => form.setValue('indoor', !!checked)}
                />
                <Label htmlFor="indoor">Indoor Court</Label>
              </div>
              <p className="text-sm text-gray-600">
                Check if this is an indoor court
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Additional information about this court..."
              className="resize-none"
              {...form.register('notes')}
            />
            {form.formState.errors.notes && (
              <p className="text-sm text-red-600">
                {form.formState.errors.notes.message}
              </p>
            )}
          </div>

          {!court && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={form.watch('isActive')}
                  onCheckedChange={checked => form.setValue('isActive', !!checked)}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
              <p className="text-sm text-gray-600">
                Court will be available for bookings
              </p>
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Saving...'
                : court
                  ? 'Update Court'
                  : 'Create Court'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
