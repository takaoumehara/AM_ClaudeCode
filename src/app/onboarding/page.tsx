'use client';

import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { OrganizationPickerV2 } from '@/components/onboarding/OrganizationPickerV2';

export default function OnboardingPage() {
  const router = useRouter();

  const handleSkipOrganization = () => {
    router.push('/profiles');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <OrganizationPickerV2
          onSkip={handleSkipOrganization}
        />
      </div>
    </ProtectedRoute>
  );
}