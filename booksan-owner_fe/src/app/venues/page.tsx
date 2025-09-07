import * as React from 'react';
import { authServiceServer } from '@/lib/auth-server';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { VenuesPage } from '@/components/venues/venues-page';
import { redirect } from 'next/navigation';

export default async function Venues() {
  const user = await authServiceServer.getCurrentUser();

  if (!user) {
    redirect('/auth/login');
  }

  if (user.role !== 'OWNER') {
    redirect('/auth/login');
  }

  return (
    <DashboardLayout user={user}>
      <VenuesPage />
    </DashboardLayout>
  );
}
