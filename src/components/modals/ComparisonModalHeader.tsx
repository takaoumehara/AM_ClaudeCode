'use client';

import { UserProfile } from '@/lib/firebase/profiles';

interface ProfileData {
  id: string;
  profile: UserProfile;
}

interface ComparisonModalHeaderProps {
  profiles: ProfileData[];
  onRemoveProfile: (profileId: string) => void;
  onAddMore?: () => void;
  canAddMore: boolean;
  maxProfiles: number;
  className?: string;
}

export const ComparisonModalHeader: React.FC<ComparisonModalHeaderProps> = ({
  profiles,
  onRemoveProfile,
  onAddMore,
  canAddMore,
  maxProfiles,
  className = ""
}) => {
  const profileCount = profiles.length;

  return (
    <div className={`bg-white border-b border-gray-200 px-6 py-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 id="modal-title" className="text-xl font-semibold text-gray-900">
            Profile Comparison
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Comparing {profileCount} profile{profileCount !== 1 ? 's' : ''}
            {canAddMore && ` (${maxProfiles - profileCount} more can be added)`}
          </p>
        </div>

        {onAddMore && canAddMore && (
          <button
            onClick={onAddMore}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add More
          </button>
        )}
      </div>

      {/* Profile navigation tabs */}
      {profiles.length > 0 && (
        <div className="mt-4">
          <nav className="flex space-x-1 overflow-x-auto">
            {profiles.map((profileData, index) => (
              <ProfileTab
                key={profileData.id}
                profile={profileData.profile}
                index={index}
                onRemove={() => onRemoveProfile(profileData.id)}
                showRemove={profiles.length > 1}
              />
            ))}
          </nav>
        </div>
      )}
    </div>
  );
};

interface ProfileTabProps {
  profile: UserProfile;
  index: number;
  onRemove: () => void;
  showRemove: boolean;
}

const ProfileTab: React.FC<ProfileTabProps> = ({
  profile,
  index,
  onRemove,
  showRemove
}) => {
  return (
    <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2 text-sm">
      <div className="flex items-center space-x-2 min-w-0">
        <div className="flex-shrink-0">
          {profile.core.photoUrl ? (
            <img
              src={profile.core.photoUrl}
              alt={profile.core.name}
              className="w-6 h-6 rounded-full object-cover"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-xs font-medium text-gray-600">
                {profile.core.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??'}
              </span>
            </div>
          )}
        </div>
        <span className="text-gray-700 truncate max-w-[120px]">
          {profile.core.name}
        </span>
      </div>
      
      {showRemove && (
        <button
          onClick={onRemove}
          className="ml-2 flex-shrink-0 text-gray-400 hover:text-red-600 rounded p-1"
          aria-label={`Remove ${profile.core.name} from comparison`}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};