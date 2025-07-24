'use client';

import { UserProfile } from '@/lib/firebase/profiles';
import { ProfileHero } from './ProfileHero';
import { SkillsSection } from './SkillsSection';
import { PersonalSection } from './PersonalSection';
import { ExperienceSection } from './ExperienceSection';
import { ProfileCompleteness } from './ProfileCompleteness';
import { useProfileVisibility } from '@/hooks/useProfileVisibility';

interface ProfilePageProps {
  profile: UserProfile;
  userId: string;
  isOwnProfile: boolean;
  currentUser: any; // Firebase User
  currentOrganization: any;
  className?: string;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  profile,
  userId,
  isOwnProfile,
  currentUser,
  currentOrganization,
  className = ""
}) => {
  // Apply visibility rules based on current context
  const {
    visibleProfile,
    canViewSection,
    getVisibilityReason
  } = useProfileVisibility(profile, currentUser, currentOrganization, isOwnProfile);

  return (
    <div className={`mt-6 lg:mt-8 ${className}`}>
      {/* Profile Hero Section */}
      <ProfileHero
        profile={visibleProfile}
        userId={userId}
        isOwnProfile={isOwnProfile}
        currentUser={currentUser}
      />

      {/* Profile Completeness Indicator (only for own profile) */}
      {isOwnProfile && (
        <div className="mb-8">
          <ProfileCompleteness profile={profile} />
        </div>
      )}

      {/* Main Content Grid - Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6 lg:space-y-8 order-2 lg:order-1">
          {/* Skills Section */}
          {canViewSection('skills') && (
            <SkillsSection
              skills={visibleProfile.core.mainSkills || []}
              isOwnProfile={isOwnProfile}
              onEdit={isOwnProfile ? () => console.log('Edit skills') : undefined}
            />
          )}

          {/* Personal Section */}
          {canViewSection('personal') && visibleProfile.personal && (
            <PersonalSection
              personal={visibleProfile.personal}
              isOwnProfile={isOwnProfile}
              onEdit={isOwnProfile ? () => console.log('Edit personal') : undefined}
            />
          )}

          {/* Experience Section */}
          {canViewSection('experience') && (
            <ExperienceSection
              teamIds={visibleProfile.core.teamIds || []}
              isOwnProfile={isOwnProfile}
              onEdit={isOwnProfile ? () => console.log('Edit experience') : undefined}
            />
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6 lg:space-y-8 order-1 lg:order-2">
          {/* Quick Info Card */}
          <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              Quick Info
            </h3>
            <div className="space-y-2 sm:space-y-3">
              {visibleProfile.core.mainTitle && (
                <div>
                  <dt className="text-xs sm:text-sm font-medium text-gray-500">Title</dt>
                  <dd className="text-xs sm:text-sm text-gray-900 mt-1">
                    {visibleProfile.core.mainTitle}
                  </dd>
                </div>
              )}
              
              {visibleProfile.core.teamIds && visibleProfile.core.teamIds.length > 0 && (
                <div>
                  <dt className="text-xs sm:text-sm font-medium text-gray-500">Teams</dt>
                  <dd className="text-xs sm:text-sm text-gray-900 mt-1">
                    {visibleProfile.core.teamIds.length} team{visibleProfile.core.teamIds.length !== 1 ? 's' : ''}
                  </dd>
                </div>
              )}
              
              {visibleProfile.core.mainSkills && visibleProfile.core.mainSkills.length > 0 && (
                <div>
                  <dt className="text-xs sm:text-sm font-medium text-gray-500">Skills</dt>
                  <dd className="text-xs sm:text-sm text-gray-900 mt-1">
                    {visibleProfile.core.mainSkills.length} skill{visibleProfile.core.mainSkills.length !== 1 ? 's' : ''}
                  </dd>
                </div>
              )}
            </div>
          </div>

          {/* Motto Card */}
          {canViewSection('personal') && visibleProfile.personal?.motto && (
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-2 sm:mb-3">
                Personal Motto
              </h3>
              <blockquote className="text-sm sm:text-base text-blue-800 italic">
                "{visibleProfile.personal.motto}"
              </blockquote>
            </div>
          )}

          {/* Contact Actions (if not own profile) */}
          {!isOwnProfile && (
            <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                Connect
              </h3>
              <div className="space-y-2 sm:space-y-3">
                <button className="w-full inline-flex items-center justify-center px-3 py-2 sm:px-4 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Send Message
                </button>
                <button className="w-full inline-flex items-center justify-center px-3 py-2 sm:px-4 border border-gray-300 text-xs sm:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add to Team
                </button>
              </div>
            </div>
          )}

          {/* Recent Activity (placeholder) */}
          <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              Recent Activity
            </h3>
            <div className="text-xs sm:text-sm text-gray-500 text-center py-3 sm:py-4">
              Activity tracking coming soon
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      {!isOwnProfile && (
        <div className="mt-6 sm:mt-8 bg-gray-50 rounded-lg p-3 sm:p-4">
          <div className="flex items-center text-xs sm:text-sm text-gray-600">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>You're viewing {visibleProfile.core.name}'s profile based on their privacy settings and your organization access.</span>
          </div>
        </div>
      )}
    </div>
  );
};