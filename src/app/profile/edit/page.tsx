'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ProfileEditor } from '@/components/profiles/ProfileEditor';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { getCurrentSession, generateProfileSuggestions } from '@/lib/prompts/promptService';
import type { UserProfile } from '@/lib/firebase/profiles';
import type { ProfileSuggestion } from '@/lib/prompts/types';

export default function ProfileEditPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();
  const [suggestions, setSuggestions] = useState<ProfileSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Check if coming from prompts
  const fromPrompts = searchParams.get('fromPrompts') === 'true';

  useEffect(() => {
    const loadPromptSuggestions = async () => {
      if (!fromPrompts || !user || !currentOrganization) return;

      try {
        // Get the completed prompt session
        const session = await getCurrentSession(user.uid, currentOrganization.id);
        
        if (session && session.answers.length > 0) {
          // Generate suggestions from answers
          const profileSuggestions = generateProfileSuggestions(session.answers);
          setSuggestions(profileSuggestions);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error('Error loading prompt suggestions:', error);
      }
    };

    loadPromptSuggestions();
  }, [fromPrompts, user, currentOrganization]);

  const handleProfileComplete = (profile: UserProfile) => {
    // Redirect to profiles dashboard after successful save
    router.push('/profiles');
  };

  const handleDismissSuggestions = () => {
    setShowSuggestions(false);
    setSuggestions([]);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4">
          {/* Suggestions Banner */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 mt-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Profile suggestions based on your answers
                  </h3>
                  <p className="text-sm text-blue-700 mb-3">
                    We've generated some suggestions to help complete your profile. Review and apply the ones you like.
                  </p>
                  <div className="space-y-2">
                    {suggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-blue-900">{suggestion.field}:</span>
                        <span className="text-blue-700">{suggestion.suggestion}</span>
                        <span className="text-xs text-blue-600">
                          ({Math.round(suggestion.confidence * 100)}% confidence)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  onClick={handleDismissSuggestions}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}
          
          <ProfileEditor 
            onComplete={handleProfileComplete}
            initialSuggestions={suggestions}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}