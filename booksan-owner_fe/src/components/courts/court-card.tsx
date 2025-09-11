'use client';

import * as React from 'react';
import { MoreHorizontal, Edit, Trash2, Power, PowerOff, MapPin } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Court } from '@/types/court';
import { SPORT_DISPLAY_NAMES, SURFACE_DISPLAY_NAMES } from '@/types/court';

interface CourtCardProps {
  court: Court;
  onUpdate?: () => void;
  onDelete?: (id: string) => void;
  onToggleActive?: (id: string, isActive: boolean) => void;
}

export function CourtCard({ court, onUpdate, onDelete, onToggleActive }: CourtCardProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isToggling, setIsToggling] = React.useState(false);

  const handleDelete = async () => {
    if (!onDelete) return;
    
    setIsDeleting(true);
    try {
      await onDelete(court.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleActive = async () => {
    if (!onToggleActive) return;
    
    setIsToggling(true);
    try {
      await onToggleActive(court.id, !court.isActive);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{court.name}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {court.facilityId}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={court.isActive ? 'default' : 'secondary'}>
              {court.isActive ? 'Active' : 'Inactive'}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onUpdate}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleToggleActive}
                  disabled={isToggling}
                >
                  {court.isActive ? (
                    <>
                      <PowerOff className="mr-2 h-4 w-4" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <Power className="mr-2 h-4 w-4" />
                      Activate
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">
            {SPORT_DISPLAY_NAMES[court.sport]}
          </Badge>
          {court.surface && (
            <Badge variant="outline">
              {SURFACE_DISPLAY_NAMES[court.surface]}
            </Badge>
          )}
          <Badge variant="outline">
            {court.indoor ? 'Indoor' : 'Outdoor'}
          </Badge>
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p><strong>Slot Duration:</strong> {court.slotMinutes} minutes</p>
          {court.notes && (
            <p className="mt-1"><strong>Notes:</strong> {court.notes}</p>
          )}
        </div>
        
        <div className="text-xs text-muted-foreground">
          <p>Created: {new Date(court.createdAt).toLocaleDateString()}</p>
          <p>Updated: {new Date(court.updatedAt).toLocaleDateString()}</p>
        </div>
      </CardContent>
    </Card>
  );
}
