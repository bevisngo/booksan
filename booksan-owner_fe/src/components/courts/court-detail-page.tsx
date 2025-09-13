'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Plus, Activity, Calendar, Info } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCourts, useCourtMutations } from '@/hooks/use-courts';
import { CourtBookingsTab } from './court-bookings-tab';
import { CourtInformationTab } from './court-information-tab';
import { CreateBookingDialog } from '../bookings/create-booking-dialog';

type TabType = 'bookings' | 'information';

interface CourtDetailPageProps {
  courtId: string;
}

export function CourtDetailPage({ courtId }: CourtDetailPageProps) {
  const router = useRouter();
  const { courts } = useCourts();
  const { updateCourt } = useCourtMutations();
  const [activeTab, setActiveTab] = useState<TabType>('bookings');
  const [showCreateBooking, setShowCreateBooking] = useState(false);

  const court = courts.find(c => c.id === courtId);

  if (!court) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Court not found</p>
      </div>
    );
  }

  const tabs = [
    {
      id: 'bookings' as TabType,
      label: 'Bookings',
      icon: Calendar,
      description: 'Manage court bookings and schedule'
    },
    {
      id: 'information' as TabType,
      label: 'Information',
      icon: Info,
      description: 'View and edit court details'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/courts')}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{court.name}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant={court.isActive ? 'default' : 'secondary'}>
                <Activity className="h-3 w-3 mr-1" />
                {court.isActive ? 'Active' : 'Inactive'}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {court.sport} • {court.indoor ? 'Indoor' : 'Outdoor'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/courts/${courtId}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Court
          </Button>
          <Button onClick={() => setShowCreateBooking(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Booking
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <Card className="p-1">
        <div className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'bookings' && (
          <CourtBookingsTab
            court={court}
            onCreateBooking={() => setShowCreateBooking(true)}
          />
        )}
        {activeTab === 'information' && (
          <CourtInformationTab court={court} updateCourt={updateCourt} courts={courts} />
        )}
      </div>

      {/* Create Booking Dialog */}
      <CreateBookingDialog
        isOpen={showCreateBooking}
        onClose={() => setShowCreateBooking(false)}
        courtId={courtId}
        preselectedCourt={court}
      />
    </div>
  );
}
