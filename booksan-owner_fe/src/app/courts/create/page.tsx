'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { CreateCourtForm } from '@/components/courts/create-court-form';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useToast } from '@/components/ui/use-toast';
import { useCourtMutations } from '@/hooks/use-courts';
import { useRouter } from 'next/navigation';

export default function CreateCourtPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { createCourt, loading } = useCourtMutations();

  const handleSuccess = async (data: any) => {
    try {
      await createCourt(data);

      toast({
        title: 'Success',
        description: 'Court created successfully',
      });

      router.push('/courts');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create court. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    router.push('/courts');
  };

  return (
    <ProtectedRoute requiredRole="OWNER">
      {user => (
        <DashboardLayout user={user}>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Create New Court
                </h1>
                <p className="text-muted-foreground">
                  Add a new court to your facility
                </p>
              </div>
            </div>

            <CreateCourtForm
              onSuccess={handleSuccess}
              onCancel={handleCancel}
              loading={loading}
            />
          </div>
        </DashboardLayout>
      )}
    </ProtectedRoute>
  );
}
