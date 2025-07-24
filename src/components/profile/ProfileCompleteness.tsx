'use client';

import { UserProfile } from '@/lib/firebase/profiles';
import { calculateProfileCompletion } from '@/utils/profileCompletion';

interface ProfileCompletenessProps {
  profile: UserProfile;
  className?: string;
}

export const ProfileCompleteness: React.FC<ProfileCompletenessProps> = ({
  profile,
  className = ""
}) => {
  const { percentage, missing, suggestions } = calculateProfileCompletion(profile);

  if (percentage === 100) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">
              Profile Complete!
            </h3>
            <div className="mt-1 text-sm text-green-700">
              Your profile is 100% complete. Great job!
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-blue-900">
          Profile Completeness
        </h3>
        <span className="text-2xl font-bold text-blue-600">
          {percentage}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm text-blue-700 mb-2">
          <span>Complete your profile to improve visibility</span>
          <span>{missing.length} item{missing.length !== 1 ? 's' : ''} remaining</span>
        </div>
        <div className="w-full bg-blue-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Missing Items */}
      {missing.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">
            Missing Information:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {missing.map((item, index) => (
              <div
                key={index}
                className="flex items-center text-sm text-blue-700 bg-blue-100 rounded px-3 py-2"
              >
                <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {item}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-blue-800 mb-2">
            Suggestions to improve your profile:
          </h4>
          <ul className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start text-sm text-blue-700">
                <svg className="w-4 h-4 mr-2 mt-0.5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Call to Action */}
      <div className="mt-4 pt-4 border-t border-blue-200">
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          Complete Profile
        </button>
      </div>
    </div>
  );
};