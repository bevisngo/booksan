'use client';

import * as React from 'react';
import Link from 'next/link';
import { 
  MapPin, 
  Clock, 
  Eye, 
  EyeOff, 
  MoreHorizontal,
  Edit,
  Trash2,
  Globe,
  Phone,
  Mail,
  Settings
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
import { venueApi } from '@/lib/api/venues';
import { formatDateTime } from '@/lib/utils';
import type { Court } from '@/types/venue';

interface VenueCardProps {
  venue: Court;
  onUpdate: () => void;
}

export function VenueCard({ venue, onUpdate }: VenueCardProps) {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = React.useState(false);

  const handleTogglePublish = async () => {
    try {
      setIsUpdating(true);
      await venueApi.toggleCourtPublish(venue.id, !venue.isPublished);
      toast({
        title: venue.isPublished ? 'Venue unpublished' : 'Venue published',
        description: venue.isPublished 
          ? 'Your venue is no longer visible to customers'
          : 'Your venue is now visible to customers',
      });
      onUpdate();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to update venue',
        description: error.message || 'Please try again',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this venue? This action cannot be undone.')) {
      return;
    }

    try {
      setIsUpdating(true);
      await venueApi.deleteCourt(venue.id);
      toast({
        title: 'Venue deleted',
        description: 'The venue has been permanently removed',
      });
      onUpdate();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to delete venue',
        description: error.message || 'Please try again',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const mainImage = venue.gallery.find(img => img.isMain) || venue.gallery[0];
  const address = `${venue.address.street}, ${venue.address.ward}, ${venue.address.district}`;

  const canPublish = venue.latitude && venue.longitude && venue.address.street;

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <Link 
                href={`/venues/${venue.id}`}
                className="font-semibold text-lg hover:text-primary transition-colors line-clamp-1"
              >
                {venue.name}
              </Link>
              <div className="flex gap-1">
                {venue.isPublished ? (
                  <Badge variant="default" className="text-xs">
                    <Eye className="w-3 h-3 mr-1" />
                    Published
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    <EyeOff className="w-3 h-3 mr-1" />
                    Draft
                  </Badge>
                )}
                {!venue.isActive && (
                  <Badge variant="destructive" className="text-xs">
                    Inactive
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="line-clamp-1">{address}</span>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {venue.slotLength}min slots
              </div>
              <Badge variant="outline" className="text-xs">
                {venue.sportType}
              </Badge>
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
                <Link href={`/venues/${venue.id}`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link href={`/venues/${venue.id}/courts`}>
                  <Settings className="mr-2 h-4 w-4" />
                  Manage Courts
                </Link>
              </DropdownMenuItem>
              
              {canPublish && (
                <DropdownMenuItem onClick={handleTogglePublish}>
                  {venue.isPublished ? (
                    <>
                      <EyeOff className="mr-2 h-4 w-4" />
                      Unpublish
                    </>
                  ) : (
                    <>
                      <Eye className="mr-2 h-4 w-4" />
                      Publish
                    </>
                  )}
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={handleDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Image */}
        {mainImage && (
          <div className="aspect-video rounded-md overflow-hidden bg-muted">
            <img
              src={mainImage.url}
              alt={mainImage.altText || venue.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Description */}
        {venue.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {venue.description}
          </p>
        )}

        {/* Contact Info */}
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {venue.contactInfo.phone && (
            <div className="flex items-center">
              <Phone className="w-3 h-3 mr-1" />
              {venue.contactInfo.phone}
            </div>
          )}
          {venue.contactInfo.email && (
            <div className="flex items-center">
              <Mail className="w-3 h-3 mr-1" />
              {venue.contactInfo.email}
            </div>
          )}
          {venue.contactInfo.website && (
            <div className="flex items-center">
              <Globe className="w-3 h-3 mr-1" />
              Website
            </div>
          )}
        </div>

        {/* Publish Requirements */}
        {!canPublish && (
          <div className="bg-muted/50 rounded-md p-3">
            <p className="text-xs text-muted-foreground">
              <strong>To publish:</strong> Add complete address and location coordinates
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Updated {formatDateTime(venue.updatedAt)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
