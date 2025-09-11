'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import type { User } from '@/lib/auth';

interface ProtectedRouteProps {
  children: (user: User) => React.ReactNode;
  requiredRole?: 'USER' | 'ADMIN' | 'OWNER';
}

export function ProtectedRoute({ children, requiredRole = 'OWNER' }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (!isLoading && user && user.role !== requiredRole) {
      router.push('/auth/login');
      return;
    }
  }, [isLoading, isAuthenticated, user, router, requiredRole]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Will redirect in useEffect
  }

  return <>{children(user)}</>;
}
