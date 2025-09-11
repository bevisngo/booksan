'use client';

import * as React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { VenuesPage } from '@/components/venues/venues-page';
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function Venues() {
  return (
    <ProtectedRoute requiredRole="OWNER">
      {(user) => (
        <DashboardLayout user={user}>
          <VenuesPage />
        </DashboardLayout>
      )}
    </ProtectedRoute>
  );
}
