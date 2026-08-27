'use client';

import React from 'react';
import LocoTrackDashboard from '@/components/dashboard/LocoTrackDashboard';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <LocoTrackDashboard />
    </ProtectedRoute>
  );
}
