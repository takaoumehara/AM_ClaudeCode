'use client';

import { useState, useEffect, useMemo } from 'react';
import { ProfileModal, ModalLoadingState, ModalErrorState } from './ProfileModal';
import { ProfileComparison } from '../ProfileComparison';
import { ComparisonModalHeader } from './ComparisonModalHeader';
import { ComparisonPagination } from './ComparisonPagination';
import { getUserProfile, UserProfile } from '@/lib/firebase/profiles';

interface ProfileData {
  id: string;
  profile: UserProfile;
}

interface ProfileComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProfileIds: string[];
  onRemoveProfile: (profileId: string) => void;
  onAddMore?: () => void;
  maxProfiles?: number;
}

export const ProfileComparisonModal: React.FC<ProfileComparisonModalProps> = ({
  isOpen,
  onClose,
  selectedProfileIds,
  onRemoveProfile,
  onAddMore,
  maxProfiles = 4
}) => {
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  const profilesPerPage = useMemo(() => {
    // Responsive profiles per page based on screen size
    // This will be handled by CSS, but we need a default for pagination
    return Math.min(maxProfiles, 4);
  }, [maxProfiles]);

  // Load profile data when selectedProfileIds change
  useEffect(() => {
    if (!isOpen || selectedProfileIds.length === 0) {
      setProfiles([]);
      setError(null);
      return;
    }

    const loadProfiles = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const profilePromises = selectedProfileIds.map(async (id) => {
          const profile = await getUserProfile(id);
          if (!profile) {
            throw new Error(`Profile not found: ${id}`);
          }
          return { id, profile };
        });

        const loadedProfiles = await Promise.all(profilePromises);
        setProfiles(loadedProfiles);
        setCurrentPage(1); // Reset to first page when profiles change
      } catch (err) {
        console.error('Error loading profiles for comparison:', err);
        setError(err instanceof Error ? err.message : 'Failed to load profiles');
        setProfiles([]);
      } finally {
        setLoading(false);
      }
    };

    loadProfiles();
  }, [isOpen, selectedProfileIds]);

  // Calculate pagination
  const totalPages = Math.ceil(profiles.length / profilesPerPage);
  const startIndex = (currentPage - 1) * profilesPerPage;
  const endIndex = startIndex + profilesPerPage;
  const currentProfiles = profiles.slice(startIndex, endIndex);

  const handleRemoveProfile = (profileId: string) => {
    onRemoveProfile(profileId);
    
    // Adjust current page if necessary
    const newProfileCount = profiles.length - 1;
    const newTotalPages = Math.ceil(newProfileCount / profilesPerPage);
    
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    }
  };

  const handleRetry = () => {
    // Trigger a reload by resetting error state
    setError(null);
  };

  const canAddMore = profiles.length < maxProfiles;

  if (!isOpen) {
    return null;
  }

  return (
    <ProfileModal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col h-full max-h-[90vh]">
        {/* Header */}
        <ComparisonModalHeader
          profiles={profiles}
          onRemoveProfile={handleRemoveProfile}
          onAddMore={onAddMore}
          canAddMore={canAddMore}
          maxProfiles={maxProfiles}
        />

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading && <ModalLoadingState />}
          
          {error && (
            <ModalErrorState 
              message={error}
              onRetry={handleRetry}
            />
          )}
          
          {!loading && !error && profiles.length > 0 && (
            <ProfileComparison
              profiles={currentProfiles}
              onRemoveProfile={handleRemoveProfile}
            />
          )}
          
          {!loading && !error && profiles.length === 0 && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No profiles selected
              </h3>
              <p className="text-gray-600 mb-4">
                Select profiles to compare their skills, interests, and experiences.
              </p>
              {onAddMore && (
                <button
                  onClick={onAddMore}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Select Profiles
                </button>
              )}
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        {!loading && !error && totalPages > 1 && (
          <ComparisonPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            profilesPerPage={profilesPerPage}
            totalProfiles={profiles.length}
          />
        )}
      </div>
    </ProfileModal>
  );
};