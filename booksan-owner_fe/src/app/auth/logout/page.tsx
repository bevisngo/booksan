'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { authServiceClient } from '@/lib/auth-client';
import { useToast } from '@/components/ui/use-toast';

export default function LogoutPage() {
  const router = useRouter();
  const { toast } = useToast();

  React.useEffect(() => {
    const handleLogout = async () => {
      try {
        await authServiceClient.logout();
        toast({
          title: 'Logged out successfully',
          description: 'You have been signed out of your account.',
        });
      } catch (error) {
        // Silent failure, still redirect to login
      } finally {
        router.push('/auth/login');
      }
    };

    handleLogout();
  }, [router, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Signing out...</p>
      </div>
    </div>
  );
}
