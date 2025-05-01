
'use client';

import type React from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldAlert } from 'lucide-react'; // Import icons

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // User not logged in
        toast({
          title: 'Authentication Required',
          description: 'Please log in to access the admin panel.',
          variant: 'destructive',
        });
        router.push('/login?redirect=/admin/orders');
      } else if (!user.isAdmin) {
        // User logged in but not an admin
        toast({
          title: 'Access Denied',
          description: 'You do not have permission to access the admin panel.',
          variant: 'destructive',
        });
        router.push('/'); // Redirect to homepage
      }
      // If user is logged in and is admin, do nothing, allow access
    }
  }, [user, isLoading, router, toast]);

  // Show loading spinner while checking auth state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Verifying access...</p>
      </div>
    );
  }

  // Show fallback UI if redirecting (although redirect should happen quickly)
  if (!user || !user.isAdmin) {
     return (
       <div className="container mx-auto px-4 py-16 flex flex-col justify-center items-center min-h-[calc(100vh-10rem)] text-center">
         <ShieldAlert className="h-12 w-12 text-destructive mb-4" />
         <p className="text-lg font-semibold text-destructive">Access Denied</p>
         <p className="text-muted-foreground">Redirecting...</p>
       </div>
     );
  }

  // Render children if user is authenticated and is an admin
  return <>{children}</>;
}
