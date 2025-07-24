'use client';

import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ProfileEditor } from '@/components/profiles/ProfileEditor';
import type { UserProfile } from '@/lib/firebase/profiles';

export default function ProfileEditPage() {
  const router = useRouter();

  const handleProfileComplete = (profile: UserProfile) => {
    // Redirect to profiles dashboard after successful save
    router.push('/profiles');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4">
          <ProfileEditor onComplete={handleProfileComplete} />
        </div>
      </div>
    </ProtectedRoute>
  );
}