'use client';

import * as React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { CourtsPage } from '@/components/courts/courts-page';
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function Courts() {
  return (
    <ProtectedRoute requiredRole="OWNER">
      {(user) => (
        <DashboardLayout user={user}>
          <CourtsPage />
        </DashboardLayout>
      )}
    </ProtectedRoute>
  );
}
