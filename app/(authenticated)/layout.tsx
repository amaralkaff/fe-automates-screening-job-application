'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/home/Header';
import { PageTransition } from '@/components/ui/PageTransition';
import { AuthPageSkeleton } from '@/components/ui/skeletons/AuthPageSkeleton';
import { useAuth } from '@/lib/auth';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated, signOut } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [authLoading, isAuthenticated, router]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <PageTransition>
        <AuthPageSkeleton />
      </PageTransition>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/auth');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Header userName={user?.name} onSignOut={handleSignOut} />
        <PageTransition>
          {children}
        </PageTransition>
      </div>
    </div>
  );
}