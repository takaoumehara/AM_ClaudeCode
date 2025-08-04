'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function ListPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to unified browse page
    router.replace('/browse');
  }, [router]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to browse page...</p>
        </div>
      </div>
    </ProtectedRoute>
  );
}