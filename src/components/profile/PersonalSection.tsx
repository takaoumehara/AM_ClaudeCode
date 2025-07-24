'use client';

import { UserProfile } from '@/lib/firebase/profiles';
import { CollapsibleSection } from '@/components/common/CollapsibleSection';

interface PersonalSectionProps {
  personal: UserProfile['personal'];
  isOwnProfile: boolean;
  onEdit?: () => void;
  className?: string;
}

export const PersonalSection: React.FC<PersonalSectionProps> = ({
  personal,
  isOwnProfile,
  onEdit,
  className = ""
}) => {
  if (!personal) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
          {isOwnProfile && onEdit && (
            <button
              onClick={onEdit}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Add Information
            </button>
          )}
        </div>
        <div className="text-center py-8">
          <svg
            className="w-12 h-12 mx-auto text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <p className="text-gray-600">
            {isOwnProfile ? 'Share your interests and personal details' : 'No personal information shared'}
          </p>
        </div>
      </div>
    );
  }

  const hasContent = 
    (personal.hobbies && personal.hobbies.length > 0) ||
    (personal.favorites && personal.favorites.length > 0) ||
    (personal.learning && personal.learning.length > 0) ||
    personal.motto ||
    (personal.activities && personal.activities.length > 0);

  if (!hasContent) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
          {isOwnProfile && onEdit && (
            <button
              onClick={onEdit}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Add Information
            </button>
          )}
        </div>
        <div className="text-center py-8">
          <p className="text-gray-600">
            {isOwnProfile ? 'Add your interests and personal details' : 'No personal information available'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <CollapsibleSection 
      title="Personal Information"
      defaultExpanded={true}
      expandOnDesktop={true}
      className={className}
    >
      {/* Edit Button */}
      {isOwnProfile && onEdit && (
        <div className="flex justify-end mb-4">
          <button
            onClick={onEdit}
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Edit
          </button>
        </div>
      )}

      <div className="space-y-4 sm:space-y-6">
        {/* Hobbies & Interests */}
        {personal.hobbies && personal.hobbies.length > 0 && (
          <div>
            <h3 className="text-sm sm:text-base font-medium text-gray-700 mb-2 sm:mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Hobbies & Interests
            </h3>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {personal.hobbies.map((hobby, index) => (
                <span
                  key={`hobby-${index}`}
                  className="inline-flex items-center px-2 py-1 sm:px-3 rounded-full text-xs sm:text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200"
                >
                  {hobby}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Favorites */}
        {personal.favorites && personal.favorites.length > 0 && (
          <div>
            <h3 className="text-sm sm:text-base font-medium text-gray-700 mb-2 sm:mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              Favorites
            </h3>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {personal.favorites.map((favorite, index) => (
                <span
                  key={`favorite-${index}`}
                  className="inline-flex items-center px-2 py-1 sm:px-3 rounded-full text-xs sm:text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200"
                >
                  {favorite}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Currently Learning */}
        {personal.learning && personal.learning.length > 0 && (
          <div>
            <h3 className="text-sm sm:text-base font-medium text-gray-700 mb-2 sm:mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Currently Learning
            </h3>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {personal.learning.map((item, index) => (
                <span
                  key={`learning-${index}`}
                  className="inline-flex items-center px-2 py-1 sm:px-3 rounded-full text-xs sm:text-sm font-medium bg-green-100 text-green-800 border border-green-200"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Personal Motto */}
        {personal.motto && (
          <div>
            <h3 className="text-sm sm:text-base font-medium text-gray-700 mb-2 sm:mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              Personal Motto
            </h3>
            <blockquote className="bg-indigo-50 border-l-4 border-indigo-400 p-3 sm:p-4 rounded-r-lg">
              <p className="text-indigo-800 italic text-sm sm:text-lg">
                "{personal.motto}"
              </p>
            </blockquote>
          </div>
        )}

        {/* Activities */}
        {personal.activities && personal.activities.length > 0 && (
          <div>
            <h3 className="text-sm sm:text-base font-medium text-gray-700 mb-2 sm:mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Activities & Involvement
            </h3>
            <div className="space-y-1 sm:space-y-2">
              {personal.activities.map((activity, index) => (
                <div
                  key={`activity-${index}`}
                  className="flex items-center p-2 sm:p-3 bg-orange-50 rounded-lg border border-orange-200"
                >
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                  <span className="text-orange-800 text-xs sm:text-sm">{activity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Custom Fields */}
        {personal.customFields && Object.keys(personal.customFields).length > 0 && (
          <div>
            <h3 className="text-sm sm:text-base font-medium text-gray-700 mb-2 sm:mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
              Additional Information
            </h3>
            <div className="space-y-2 sm:space-y-3">
              {Object.entries(personal.customFields).map(([key, value]) => (
                <div key={key} className="flex flex-col sm:flex-row sm:items-center">
                  <dt className="text-xs sm:text-sm font-medium text-gray-600 sm:w-1/3 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                  </dt>
                  <dd className="text-xs sm:text-sm text-gray-900 sm:w-2/3 mt-1 sm:mt-0">
                    {typeof value === 'string' ? value : JSON.stringify(value)}
                  </dd>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </CollapsibleSection>
  );
};