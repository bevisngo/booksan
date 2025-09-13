'use client';

import * as React from 'react';
import { MapPin, Activity, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCourtStats } from '@/hooks/use-courts';

interface CourtStatsCardProps {
  facilityId?: string;
  className?: string;
}

export function CourtStatsCard({ facilityId, className }: CourtStatsCardProps) {
  const { stats, loading, error } = useCourtStats();

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center">
            <MapPin className="mr-2 h-4 w-4" />
            Court Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded animate-pulse"></div>
            <div className="h-4 bg-muted rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-muted rounded animate-pulse w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center">
            <MapPin className="mr-2 h-4 w-4" />
            Court Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Unable to load court statistics</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center">
          <MapPin className="mr-2 h-4 w-4" />
          Court Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total Courts</span>
          <Badge variant="outline">{stats.total}</Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Active</span>
          <Badge variant="default">{stats.active}</Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Inactive</span>
          <Badge variant="secondary">{stats.inactive}</Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Indoor</span>
          <Badge variant="outline">{stats.indoor}</Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Outdoor</span>
          <Badge variant="outline">{stats.outdoor}</Badge>
        </div>

        {Object.keys(stats.bySport).length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground mb-2">By Sport</p>
            <div className="flex flex-wrap gap-1">
              {Object.entries(stats.bySport).slice(0, 3).map(([sport, count]) => (
                <Badge key={sport} variant="outline" className="text-xs">
                  {sport}: {count}
                </Badge>
              ))}
              {Object.keys(stats.bySport).length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{Object.keys(stats.bySport).length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
