'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Power, PowerOff, ChevronLeft, ChevronRight, Clock, MapPin, Calendar, User, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Court, SPORT_DISPLAY_NAMES, SURFACE_DISPLAY_NAMES } from '@/types/court';
// import { useCourts } from '@/hooks/use-courts'; - no longer needed as props are passed

interface CourtInformationTabProps {
  court: Court;
  updateCourt: (id: string, data: any) => Promise<any>;
  courts: Court[];
}

export function CourtInformationTab({ court, updateCourt, courts }: CourtInformationTabProps) {
  const router = useRouter();
  const [isToggling, setIsToggling] = useState(false);

  // Get other courts for navigation
  const otherCourts = courts.filter(c => c.id !== court.id);
  const currentIndex = courts.findIndex(c => c.id === court.id);
  const prevCourt = currentIndex > 0 ? courts[currentIndex - 1] : null;
  const nextCourt = currentIndex < courts.length - 1 ? courts[currentIndex + 1] : null;

  const handleToggleStatus = async () => {
    setIsToggling(true);
    try {
      await updateCourt(court.id, { isActive: !court.isActive });
    } catch (error) {
      console.error('Failed to toggle court status:', error);
    } finally {
      setIsToggling(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Quick Navigation */}
      {otherCourts.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-muted-foreground">Quick Switch:</span>
              <span className="text-sm text-muted-foreground">
                {currentIndex + 1} of {courts.length} courts
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              {prevCourt && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/courts/${prevCourt.id}`)}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  {prevCourt.name}
                </Button>
              )}
              
              {nextCourt && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/courts/${nextCourt.id}`)}
                >
                  {nextCourt.name}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Actions Bar */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Court Information</h3>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/courts/${court.id}/edit`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Court
            </Button>
            
            <Button
              variant={court.isActive ? "destructive" : "default"}
              onClick={handleToggleStatus}
              disabled={isToggling}
            >
              {court.isActive ? (
                <PowerOff className="h-4 w-4 mr-2" />
              ) : (
                <Power className="h-4 w-4 mr-2" />
              )}
              {isToggling ? 'Processing...' : (court.isActive ? 'Deactivate' : 'Activate')}
            </Button>
          </div>
        </div>
      </Card>

      {/* Basic Details */}
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <MapPin className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Basic Details</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Court Name</label>
            <p className="text-lg font-medium mt-1">{court.name}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">Sport Type</label>
            <p className="text-lg font-medium mt-1">{SPORT_DISPLAY_NAMES[court.sport]}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">Surface</label>
            <p className="text-lg font-medium mt-1">
              {court.surface ? SURFACE_DISPLAY_NAMES[court.surface] : 'Not specified'}
            </p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">Location Type</label>
            <div className="mt-1">
              <Badge variant={court.indoor ? 'default' : 'secondary'}>
                {court.indoor ? 'Indoor' : 'Outdoor'}
              </Badge>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">Status</label>
            <div className="mt-1">
              <Badge variant={court.isActive ? 'default' : 'destructive'}>
                {court.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">Slot Duration</label>
            <p className="text-lg font-medium mt-1">{court.slotMinutes} minutes</p>
          </div>
        </div>
      </Card>

      {/* Operational Details */}
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Operational Details</h3>
        </div>
        
        <div className="space-y-6">
          {/* Opening Hours - This would be fetched from facility data */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">Operating Hours</label>
            <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { day: 'Monday', hours: '6:00 AM - 11:00 PM' },
                { day: 'Tuesday', hours: '6:00 AM - 11:00 PM' },
                { day: 'Wednesday', hours: '6:00 AM - 11:00 PM' },
                { day: 'Thursday', hours: '6:00 AM - 11:00 PM' },
                { day: 'Friday', hours: '6:00 AM - 11:00 PM' },
                { day: 'Saturday', hours: '7:00 AM - 10:00 PM' },
                { day: 'Sunday', hours: '7:00 AM - 10:00 PM' },
              ].map((schedule) => (
                <div key={schedule.day} className="text-sm">
                  <div className="font-medium">{schedule.day}</div>
                  <div className="text-muted-foreground">{schedule.hours}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Rules Summary */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">Pricing Summary</label>
            <div className="mt-2 space-y-2">
              <div className="text-sm">
                <span className="font-medium">Standard Rate:</span> $30/hour
              </div>
              <div className="text-sm">
                <span className="font-medium">Peak Hours:</span> $45/hour (6-9 PM)
              </div>
              <div className="text-sm">
                <span className="font-medium">Weekend Rate:</span> $35/hour
              </div>
              <Button variant="link" className="p-0 h-auto text-sm">
                View detailed pricing rules →
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Notes */}
      {court.notes && (
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Notes</h3>
          </div>
          
          <div className="prose prose-sm max-w-none">
            <p className="text-muted-foreground whitespace-pre-wrap">{court.notes}</p>
          </div>
        </Card>
      )}

      {/* Audit Information */}
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Audit Information</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Created At</label>
            <p className="text-sm mt-1">{formatDateTime(court.createdAt)}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
            <p className="text-sm mt-1">{formatDateTime(court.updatedAt)}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">Court ID</label>
            <p className="text-sm mt-1 font-mono">{court.id}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">Facility ID</label>
            <p className="text-sm mt-1 font-mono">{court.facilityId}</p>
          </div>
        </div>
      </Card>

      {/* Usage Statistics */}
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <User className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Usage Statistics</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold">87%</div>
            <div className="text-sm text-muted-foreground">This Month</div>
            <div className="text-xs text-muted-foreground">Utilization Rate</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold">142</div>
            <div className="text-sm text-muted-foreground">This Month</div>
            <div className="text-xs text-muted-foreground">Total Bookings</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold">$4,260</div>
            <div className="text-sm text-muted-foreground">This Month</div>
            <div className="text-xs text-muted-foreground">Revenue</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold">4.8</div>
            <div className="text-sm text-muted-foreground">Average</div>
            <div className="text-xs text-muted-foreground">Player Rating</div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <Button variant="outline" className="w-full">
            View Detailed Analytics →
          </Button>
        </div>
      </Card>
    </div>
  );
}
