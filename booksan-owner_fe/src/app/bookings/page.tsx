import * as React from 'react';
import { authServiceServer } from '@/lib/auth-server';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { BookingsPage } from '@/components/bookings/bookings-page';
import { redirect } from 'next/navigation';

export default async function Bookings() {
  const user = await authServiceServer.getCurrentUser();
  
  if (!user) {
    redirect('/auth/login');
  }

  if (user.role !== 'OWNER') {
    redirect('/auth/login');
  }

  return (
    <DashboardLayout user={user}>
      <BookingsPage />
    </DashboardLayout>
  );
}
