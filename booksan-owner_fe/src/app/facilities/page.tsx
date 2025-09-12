'use client';

import * as React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { FacilitiesPage } from '@/components/facilities/facilities-page';
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function Facilities() {
  return (
    <ProtectedRoute requiredRole="OWNER">
      {(user) => (
        <DashboardLayout user={user}>
          <FacilitiesPage />
        </DashboardLayout>
      )}
    </ProtectedRoute>
  );
}
