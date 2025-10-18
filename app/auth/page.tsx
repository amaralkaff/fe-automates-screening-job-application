'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import AuthPage from '@/components/auth/AuthPage';
import { AuthPageSkeleton } from '@/components/ui/skeletons/AuthPageSkeleton';
import { PageTransition } from '@/components/ui/PageTransition';

export default function Auth() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Redirect to home if already authenticated
    if (!isLoading && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <PageTransition>
        <AuthPageSkeleton />
      </PageTransition>
    );
  }

  // Don't show auth page if already authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  return (
    <PageTransition>
      <AuthPage />
    </PageTransition>
  );
}