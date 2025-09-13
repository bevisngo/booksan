'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  SLOT_DURATIONS,
  Sport,
  SPORT_DISPLAY_NAMES,
  Surface,
  SURFACE_DISPLAY_NAMES
} from '@/types/court';

const courtSchema = z.object({
  name: z.string().min(1, 'Court name is required'),
  sport: z.nativeEnum(Sport, { required_error: 'Sport is required' }),
  surface: z.nativeEnum(Surface).optional().or(z.undefined()),
  indoor: z.boolean().default(false),
  notes: z.string().optional(),
  slotMinutes: z.number().min(15).max(480),
  isActive: z.boolean().default(true),
});

type CourtFormData = z.infer<typeof courtSchema>;

interface CreateCourtFormProps {
  onSuccess: (court: CourtFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function CreateCourtForm({
  onSuccess,
  onCancel,
  loading = false,
}: CreateCourtFormProps) {
  const form = useForm<CourtFormData>({
    resolver: zodResolver(courtSchema),
    defaultValues: {
      name: '',
      sport: Sport.TENNIS,
      surface: undefined,
      indoor: false,
      notes: '',
      slotMinutes: 60,
      isActive: true,
    },
  });

  const onSubmit = (data: CourtFormData) => {
    onSuccess(data);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Court Information</CardTitle>
          <CardDescription>
            Fill in the details below to create a new court for your facility.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Court Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Court 1, Main Court, Center Court"
                {...form.register('name')}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="sport">Sport *</Label>
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
                  value={form.watch('surface') || undefined}
                  onValueChange={value => form.setValue('surface', value as Surface)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select surface" />
                  </SelectTrigger>
                  <SelectContent>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="slotMinutes">Slot Duration (minutes) *</Label>
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
                <p className="text-sm text-muted-foreground">
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
                rows={3}
                {...form.register('notes')}
              />
              {form.formState.errors.notes && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.notes.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={form.watch('isActive')}
                  onCheckedChange={checked => form.setValue('isActive', !!checked)}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Court will be available for bookings
              </p>
            </div>

            <div className="flex items-center justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Courts
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Court'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
