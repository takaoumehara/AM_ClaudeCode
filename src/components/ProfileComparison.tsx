'use client';

import { UserProfile } from '@/lib/firebase/profiles';
import { ComparisonHighlight } from './ComparisonHighlight';
import { useComparison } from '@/hooks/useComparison';

interface ProfileData {
  id: string;
  profile: UserProfile;
}

interface ProfileComparisonProps {
  profiles: ProfileData[];
  onRemoveProfile?: (profileId: string) => void;
  className?: string;
}

export const ProfileComparison: React.FC<ProfileComparisonProps> = ({
  profiles,
  onRemoveProfile,
  className = ""
}) => {
  const { commonElements, getCommonSkills, getCommonInterests } = useComparison(profiles);

  const getResponsiveColumns = (count: number): string => {
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-1 md:grid-cols-2';
    if (count === 3) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
  };

  if (profiles.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">No profiles selected for comparison.</p>
      </div>
    );
  }

  return (
    <div className={`p-6 ${className}`}>
      {/* Header with common elements summary */}
      {profiles.length > 1 && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Common Elements Found
          </h3>
          <div className="space-y-2 text-sm">
            {commonElements.skills.length > 0 && (
              <div>
                <strong className="text-blue-800">Shared Skills:</strong>{' '}
                <span className="text-blue-700">
                  {commonElements.skills.join(', ')}
                </span>
              </div>
            )}
            {commonElements.interests.length > 0 && (
              <div>
                <strong className="text-blue-800">Common Interests:</strong>{' '}
                <span className="text-blue-700">
                  {commonElements.interests.join(', ')}
                </span>
              </div>
            )}
            {commonElements.teams.length > 0 && (
              <div>
                <strong className="text-blue-800">Shared Teams:</strong>{' '}
                <span className="text-blue-700">
                  {commonElements.teams.join(', ')}
                </span>
              </div>
            )}
            {commonElements.skills.length === 0 && 
             commonElements.interests.length === 0 && 
             commonElements.teams.length === 0 && (
              <div className="text-blue-700">
                No common elements found between these profiles.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Profile comparison grid */}
      <div className={`grid gap-6 ${getResponsiveColumns(profiles.length)}`}>
        {profiles.map((profileData) => (
          <ProfileComparisonCard
            key={profileData.id}
            profileData={profileData}
            commonElements={commonElements}
            onRemove={onRemoveProfile}
            showRemove={profiles.length > 1}
          />
        ))}
      </div>

      {/* Mobile sequential view for small screens */}
      <div className="block md:hidden mt-6">
        <div className="space-y-6">
          {profiles.map((profileData, index) => (
            <div key={profileData.id} className="border-t border-gray-200 pt-6 first:border-t-0 first:pt-0">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-500">
                  Profile {index + 1} of {profiles.length}
                </h4>
                {onRemoveProfile && profiles.length > 1 && (
                  <button
                    onClick={() => onRemoveProfile(profileData.id)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
              <ProfileComparisonCard
                profileData={profileData}
                commonElements={commonElements}
                isMobile={true}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface ProfileComparisonCardProps {
  profileData: ProfileData;
  commonElements: ReturnType<typeof useComparison>['commonElements'];
  onRemove?: (profileId: string) => void;
  showRemove?: boolean;
  isMobile?: boolean;
}

const ProfileComparisonCard: React.FC<ProfileComparisonCardProps> = ({
  profileData,
  commonElements,
  onRemove,
  showRemove = false,
  isMobile = false
}) => {
  const { id, profile } = profileData;
  const { core, personal } = profile;

  const isSkillCommon = (skill: string) => commonElements.skills.includes(skill);
  const isInterestCommon = (interest: string) => commonElements.interests.includes(interest);
  const isTeamCommon = (team: string) => commonElements.teams.includes(team);

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden ${isMobile ? '' : 'hidden md:block'}`}>
      {/* Header with photo and basic info */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {core.photoUrl ? (
              <img
                src={core.photoUrl}
                alt={core.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-gray-600 font-medium text-sm">
                  {core.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??'}
                </span>
              </div>
            )}
          </div>
          <div className="flex-grow min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {core.name}
            </h3>
            {core.mainTitle && (
              <p className="text-sm text-gray-600 truncate">
                {core.mainTitle}
              </p>
            )}
          </div>
          {onRemove && showRemove && (
            <button
              onClick={() => onRemove(id)}
              className="flex-shrink-0 p-1 text-red-600 hover:text-red-700 rounded"
              aria-label={`Remove ${core.name} from comparison`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Profile content */}
      <div className="p-4 space-y-4">
        {/* Skills section */}
        {core.mainSkills && core.mainSkills.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Skills</h4>
            <div className="flex flex-wrap gap-1">
              {core.mainSkills.map((skill, index) => (
                <ComparisonHighlight
                  key={index}
                  text={skill}
                  isCommon={isSkillCommon(skill)}
                  type="skill"
                />
              ))}
            </div>
          </div>
        )}

        {/* Teams section */}
        {core.teamIds && core.teamIds.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Teams</h4>
            <div className="flex flex-wrap gap-1">
              {core.teamIds.map((team, index) => (
                <ComparisonHighlight
                  key={index}
                  text={team}
                  isCommon={isTeamCommon(team)}
                  type="team"
                />
              ))}
            </div>
          </div>
        )}

        {/* Personal interests (if visible) */}
        {personal?.hobbies && personal.hobbies.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Hobbies & Interests</h4>
            <div className="flex flex-wrap gap-1">
              {personal.hobbies.map((hobby, index) => (
                <ComparisonHighlight
                  key={index}
                  text={hobby}
                  isCommon={isInterestCommon(hobby)}
                  type="interest"
                />
              ))}
            </div>
          </div>
        )}

        {/* Learning section */}
        {personal?.learning && personal.learning.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Currently Learning</h4>
            <div className="flex flex-wrap gap-1">
              {personal.learning.map((item, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Motto section */}
        {personal?.motto && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Motto</h4>
            <p className="text-sm text-gray-700 italic">
              "{personal.motto}"
            </p>
          </div>
        )}

        {/* Activities section */}
        {personal?.activities && personal.activities.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Activities</h4>
            <div className="text-sm text-gray-700">
              <ul className="list-disc list-inside space-y-1">
                {personal.activities.map((activity, index) => (
                  <li key={index}>{activity}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};