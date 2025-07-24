'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Welcome } from '@/components/onboarding/Welcome';
import { OrganizationPicker } from '@/components/onboarding/OrganizationPicker';

type OnboardingStep = 'welcome' | 'organization' | 'complete';

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const router = useRouter();

  const handleWelcomeNext = () => {
    setCurrentStep('organization');
  };

  const handleOrganizationNext = () => {
    setCurrentStep('complete');
    // Redirect to profiles after a brief success message
    setTimeout(() => {
      router.push('/profiles');
    }, 2000);
  };

  const handleSkipOrganization = () => {
    router.push('/profiles');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        {currentStep === 'welcome' && (
          <Welcome onNext={handleWelcomeNext} />
        )}

        {currentStep === 'organization' && (
          <OrganizationPicker
            onNext={handleOrganizationNext}
            onSkip={handleSkipOrganization}
          />
        )}

        {currentStep === 'complete' && (
          <div className="w-full max-w-md mx-auto text-center">
            <div className="bg-white shadow-lg rounded-lg p-8">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome Aboard!
              </h2>
              <p className="text-gray-600 mb-6">
                Your account is set up and ready to go. 
                Redirecting you to the platform...
              </p>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}