'use client';

import React, { useState } from 'react';
import { Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { BOOKING_STATUSES } from '@/types/booking';

export function BookingLegend() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Info className="h-4 w-4 mr-2" />
        Legend
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Legend Card */}
          <Card className="absolute right-0 top-full mt-2 p-4 w-80 z-50 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Booking Legend</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="p-1 h-auto"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Booking Statuses */}
              <div>
                <h4 className="text-sm font-medium mb-2">Booking Status</h4>
                <div className="space-y-2">
                  {BOOKING_STATUSES.map(status => (
                    <div key={status.value} className="flex items-center justify-between">
                      <span className="text-sm">{status.label}</span>
                      <Badge 
                        variant="secondary"
                        className={`bg-${status.color}-100 text-${status.color}-700`}
                      >
                        {status.label}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Slot Types */}
              <div>
                <h4 className="text-sm font-medium mb-2">Slot Types</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Available</span>
                    <div className="w-6 h-6 border-2 border-dashed border-muted-foreground/30 rounded"></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Booked</span>
                    <div className="w-6 h-6 bg-primary/10 border border-primary/20 rounded"></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Outside Hours</span>
                    <div className="w-6 h-6 bg-muted/50 rounded"></div>
                  </div>
                </div>
              </div>

              {/* Interactions */}
              <div>
                <h4 className="text-sm font-medium mb-2">Interactions</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div>• Click booking to view details</div>
                  <div>• Click empty slot to create booking</div>
                  <div>• Drag to select multiple slots</div>
                  <div>• Hover for quick info</div>
                </div>
              </div>

              {/* View Types */}
              <div>
                <h4 className="text-sm font-medium mb-2">View Types</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div><strong>Day:</strong> Hourly timeline view</div>
                  <div><strong>Week:</strong> 7-day grid layout</div>
                  <div><strong>Month:</strong> Calendar overview</div>
                </div>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
