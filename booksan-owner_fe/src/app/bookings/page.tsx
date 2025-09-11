'use client';

import * as React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { BookingsPage } from '@/components/bookings/bookings-page';
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function Bookings() {
  return (
    <ProtectedRoute requiredRole="OWNER">
      {(user) => (
        <DashboardLayout user={user}>
          <BookingsPage />
        </DashboardLayout>
      )}
    </ProtectedRoute>
  );
}
