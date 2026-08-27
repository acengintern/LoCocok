'use client';

import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';

/**
 * Client-side wrapper that applies ProtectedRoute protection.
 * Use this in server component pages that need auth guarding
 * while still exporting metadata.
 */
export default function ProtectedContent({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
