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
import { facilityApi } from '@/lib/api/facilities';
import { formatDateTime } from '@/lib/utils';
import type { Facility } from '@/types/facility';

interface FacilityCardProps {
  facility: Facility;
  onUpdate: () => void;
}

export function FacilityCard({ facility, onUpdate }: FacilityCardProps) {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = React.useState(false);

  const handleTogglePublish = async () => {
    try {
      setIsUpdating(true);
      await facilityApi.toggleFacilityPublish(facility.id, !facility.isPublished);
      toast({
        title: facility.isPublished ? 'Facility unpublished' : 'Facility published',
        description: facility.isPublished 
          ? 'Your facility is no longer visible to customers'
          : 'Your facility is now visible to customers',
      });
      onUpdate();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to update facility',
        description: error.message || 'Please try again',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this facility? This action cannot be undone.')) {
      return;
    }

    try {
      setIsUpdating(true);
      await facilityApi.deleteFacility(facility.id);
      toast({
        title: 'Facility deleted',
        description: 'The facility has been permanently removed',
      });
      onUpdate();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to delete facility',
        description: error.message || 'Please try again',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const canPublish = facility.latitude && facility.longitude && facility.address;

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <Link 
                href={`/facilities/${facility.id}`}
                className="font-semibold text-lg hover:text-primary transition-colors line-clamp-1"
              >
                {facility.name}
              </Link>
              <div className="flex gap-1">
                {facility.isPublished ? (
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
              </div>
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="line-clamp-1">
                {facility.address}
                {facility.ward && `, ${facility.ward}`}
                {facility.city && `, ${facility.city}`}
              </span>
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {facility.createdAt ? new Date(facility.createdAt).toLocaleDateString() : 'Recent'}
              </div>
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
                <Link href={`/facilities/${facility.id}`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link href={`/facilities/${facility.id}/courts`}>
                  <Settings className="mr-2 h-4 w-4" />
                  Manage Courts
                </Link>
              </DropdownMenuItem>
              
              {canPublish && (
                <DropdownMenuItem onClick={handleTogglePublish}>
                  {facility.isPublished ? (
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

        {/* Description */}
        {facility.desc && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {facility.desc}
          </p>
        )}

        {/* Address */}
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-2">
            {facility.address}
            {facility.ward && `, ${facility.ward}`}
            {facility.city && `, ${facility.city}`}
          </span>
        </div>

        {/* Contact Info */}
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {facility.phone && (
            <div className="flex items-center">
              <Phone className="w-3 h-3 mr-1" />
              {facility.phone}
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
            Updated {formatDateTime(facility.updatedAt)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
