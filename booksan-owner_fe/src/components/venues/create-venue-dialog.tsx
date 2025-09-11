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
import { useToast } from '@/components/ui/use-toast';
import { venueApi } from '@/lib/api/venues';
import { SPORT_TYPES, SLOT_LENGTHS } from '@/types/venue';

const venueSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  sportType: z.string().min(1, 'Sport type is required'),
  description: z.string().optional(),
  slotLength: z.number().refine(val => SLOT_LENGTHS.includes(val as any), {
    message: 'Invalid slot length',
  }),
  address: z.object({
    street: z.string().min(1, 'Street address is required'),
    ward: z.string().min(1, 'Ward is required'),
    district: z.string().min(1, 'District is required'),
    city: z.string().min(1, 'City is required'),
    province: z.string().min(1, 'Province is required'),
    country: z.string().min(1, 'Country is required'),
  }),
  contactInfo: z.object({
    phone: z.string().optional(),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  }),
});

type VenueFormData = z.infer<typeof venueSchema>;

interface CreateVenueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateVenueDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateVenueDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<VenueFormData>({
    resolver: zodResolver(venueSchema),
    defaultValues: {
      slotLength: 30,
      address: {
        country: 'Vietnam',
      },
      contactInfo: {},
    },
  });

  const sportType = watch('sportType');
  const slotLength = watch('slotLength');

  const onSubmit = async (data: VenueFormData) => {
    try {
      setIsSubmitting(true);
      // TODO: Implement venue creation API endpoint in backend
      // await venueApi.createVenue(data);
      toast({
        title: 'Venue creation not implemented',
        description: 'Venue creation functionality is not yet available.',
        variant: 'destructive',
      });
      // reset();
      // onSuccess();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to create venue',
        description: error.message || 'Please try again',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isSubmitting) {
      reset();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Venue</DialogTitle>
          <DialogDescription>
            Add a new sports venue to your portfolio. Fill in the basic information below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="font-medium">Basic Information</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Venue Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Central Tennis Club"
                  {...register('name')}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Sport Type</Label>
                <Select
                  value={sportType}
                  onValueChange={(value) => setValue('sportType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sport type" />
                  </SelectTrigger>
                  <SelectContent>
                    {SPORT_TYPES.map((sport) => (
                      <SelectItem key={sport} value={sport}>
                        {sport.charAt(0).toUpperCase() + sport.slice(1).replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.sportType && (
                  <p className="text-sm text-destructive">{errors.sportType.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Slot Length</Label>
              <Select
                value={slotLength?.toString()}
                onValueChange={(value) => setValue('slotLength', parseInt(value))}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {SLOT_LENGTHS.map((length) => (
                    <SelectItem key={length} value={length.toString()}>
                      {length} minutes
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.slotLength && (
                <p className="text-sm text-destructive">{errors.slotLength.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Brief description of your venue..."
                rows={3}
                {...register('description')}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <h4 className="font-medium">Address</h4>
            
            <div className="space-y-2">
              <Label htmlFor="street">Street Address</Label>
              <Input
                id="street"
                placeholder="123 Main Street"
                {...register('address.street')}
              />
              {errors.address?.street && (
                <p className="text-sm text-destructive">{errors.address.street.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ward">Ward</Label>
                <Input
                  id="ward"
                  placeholder="Ward 1"
                  {...register('address.ward')}
                />
                {errors.address?.ward && (
                  <p className="text-sm text-destructive">{errors.address.ward.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="district">District</Label>
                <Input
                  id="district"
                  placeholder="District 1"
                  {...register('address.district')}
                />
                {errors.address?.district && (
                  <p className="text-sm text-destructive">{errors.address.district.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="Ho Chi Minh City"
                  {...register('address.city')}
                />
                {errors.address?.city && (
                  <p className="text-sm text-destructive">{errors.address.city.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="province">Province</Label>
                <Input
                  id="province"
                  placeholder="Ho Chi Minh"
                  {...register('address.province')}
                />
                {errors.address?.province && (
                  <p className="text-sm text-destructive">{errors.address.province.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                {...register('address.country')}
              />
              {errors.address?.country && (
                <p className="text-sm text-destructive">{errors.address.country.message}</p>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="font-medium">Contact Information (Optional)</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+84 123 456 789"
                  {...register('contactInfo.phone')}
                />
                {errors.contactInfo?.phone && (
                  <p className="text-sm text-destructive">{errors.contactInfo.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contact@venue.com"
                  {...register('contactInfo.email')}
                />
                {errors.contactInfo?.email && (
                  <p className="text-sm text-destructive">{errors.contactInfo.email.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://venue.com"
                {...register('contactInfo.website')}
              />
              {errors.contactInfo?.website && (
                <p className="text-sm text-destructive">{errors.contactInfo.website.message}</p>
              )}
            </div>
          </div>

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
              {isSubmitting ? 'Creating...' : 'Create Venue'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
