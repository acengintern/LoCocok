'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not loading and no user is found, redirect to the signin page.
    // Note: The template uses Route Groups like (auth)/signin, making the URL /signin
    if (!loading && !user) {
      router.push('/signin');
    }
  }, [loading, user, router]);

  // Show a loading spinner while authentication status is being checked
  if (loading) {
    return <LoadingSpinner />;
  }

  // If there's no user, we render nothing (or the spinner) while the redirect happens
  if (!user) {
    return null;
  }

  // If the user is authenticated, render the protected children
  return <>{children}</>;
}
