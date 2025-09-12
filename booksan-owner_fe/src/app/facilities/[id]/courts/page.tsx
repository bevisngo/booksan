'use client';

import * as React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { CourtsPage } from '@/components/courts/courts-page';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useParams } from 'next/navigation';

export default function FacilityCourtsPage() {
  const params = useParams();
  const facilityId = params.id as string;

  return (
    <ProtectedRoute requiredRole="OWNER">
      {(user) => (
        <DashboardLayout user={user}>
          <CourtsPage facilityId={facilityId} />
        </DashboardLayout>
      )}
    </ProtectedRoute>
  );
}
