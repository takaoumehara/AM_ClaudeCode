'use client';

import Image from 'next/image';
import { UserProfile } from '@/lib/firebase/profiles';

interface ProfileHeroProps {
  profile: UserProfile;
  userId: string;
  isOwnProfile: boolean;
  currentUser: any;
  className?: string;
}

export const ProfileHero: React.FC<ProfileHeroProps> = ({
  profile,
  userId,
  isOwnProfile,
  currentUser,
  className = ""
}) => {
  const { core } = profile;

  return (
    <div className={`bg-white rounded-lg shadow-sm border overflow-hidden ${className}`}>
      {/* Background gradient */}
      <div className="h-24 sm:h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
      
      {/* Profile content */}
      <div className="relative px-6 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6">
          {/* Profile Photo */}
          <div className="relative -mt-12 sm:-mt-16 mb-4 sm:mb-0 flex justify-center sm:justify-start">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white p-1 shadow-lg">
              <div className="w-full h-full rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                {core.photoUrl ? (
                  <Image
                    src={core.photoUrl}
                    alt={core.name}
                    width={120}
                    height={120}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-gray-400"
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
                  </div>
                )}
              </div>
            </div>
            
            {/* Online status indicator */}
            <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 w-4 h-4 sm:w-6 sm:h-6 bg-green-400 border-2 border-white rounded-full"></div>
          </div>

          {/* Profile Info */}
          <div className="flex-1 min-w-0">
            {/* Name and Title */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl truncate">
                  {core.name}
                </h1>
                {core.mainTitle && (
                  <p className="text-lg text-gray-600 mt-1 truncate">
                    {core.mainTitle}
                  </p>
                )}
              </div>
              
              {/* Action buttons */}
              <div className="mt-4 sm:mt-0 flex space-x-3">
                {isOwnProfile ? (
                  <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Message
                    </button>
                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Connect
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Skills Preview */}
            {core.mainSkills && core.mainSkills.length > 0 && (
              <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                  {core.mainSkills.slice(0, 5).map((skill, index) => (
                    <span
                      key={`${skill}-${index}`}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200"
                    >
                      {skill}
                    </span>
                  ))}
                  {core.mainSkills.length > 5 && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                      +{core.mainSkills.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Basic Stats */}
            <div className="mt-4 flex items-center space-x-6 text-sm text-gray-600">
              {core.teamIds && core.teamIds.length > 0 && (
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {core.teamIds.length} team{core.teamIds.length !== 1 ? 's' : ''}
                </div>
              )}
              
              {core.mainSkills && core.mainSkills.length > 0 && (
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  {core.mainSkills.length} skill{core.mainSkills.length !== 1 ? 's' : ''}
                </div>
              )}
              
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Member since 2024
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};