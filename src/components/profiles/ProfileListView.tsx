'use client';

import Link from 'next/link';
import { ProfileListItem } from '@/lib/firebase/profiles';
import { Users } from 'lucide-react';

export type SortField = 'name' | 'title' | 'skillCount' | 'teamCount';
export type SortDirection = 'asc' | 'desc';

// Helper function to get initials from name
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
};

// Helper function to generate consistent colors based on name
const getProfileColor = (name: string): string => {
  const colors = [
    '#6366f1', // indigo
    '#8b5cf6', // violet  
    '#06b6d4', // cyan
    '#10b981', // emerald
    '#f59e0b', // amber
    '#ef4444', // red
    '#ec4899', // pink
    '#84cc16', // lime
    '#f97316', // orange
    '#3b82f6', // blue
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

interface ProfileListViewProps {
  profiles: ProfileListItem[];
  loading?: boolean;
  onSort?: (field: SortField, direction: SortDirection) => void;
  sortField?: SortField;
  sortDirection?: SortDirection;
}

export const ProfileListView: React.FC<ProfileListViewProps> = ({
  profiles,
  loading = false,
}) => {

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
            <div className="flex items-center space-x-6">
              {/* Avatar skeleton - Square */}
              <div className="w-20 h-20 bg-gray-200 rounded-xl flex-shrink-0"></div>
              <div className="flex-1">
                {/* Name skeleton */}
                <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
                {/* Title skeleton */}
                <div className="h-4 bg-gray-200 rounded w-36 mb-4"></div>
                {/* Skills skeleton */}
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                  <div className="h-6 bg-gray-200 rounded-full w-24"></div>
                  <div className="h-6 bg-gray-200 rounded-full w-18"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-12 m-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <Users size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No profiles to display
          </h3>
          <p className="text-gray-600">
            No profiles match your current filters or search criteria.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      {profiles.map(({ id, profile }) => (
        <Link 
          key={id}
          href={`/profiles/${id}`}
          className="block"
        >
          <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 group cursor-pointer">
            <div className="flex items-center space-x-6">
              {/* Profile Avatar - Square with Initials */}
              <div className="w-20 h-20 rounded-xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0" 
                   style={{ backgroundColor: getProfileColor(profile?.core?.name || '') }}>
                {getInitials(profile?.core?.name || 'U')}
              </div>

              {/* Profile Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    {/* Name */}
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {profile?.core?.name || 'Unknown'}
                    </h3>

                    {/* Title */}
                    {profile?.core?.mainTitle && (
                      <p className="text-lg text-gray-600 mb-3">
                        {profile.core.mainTitle}
                      </p>
                    )}
                  </div>

                  {/* Teams indicator */}
                  {profile?.core?.teamIds && profile.core?.teamIds.length > 0 && (
                    <div className="flex items-center space-x-1 text-sm text-gray-400">
                      <Users size={16} />
                      <span>{profile.core?.teamIds.length}</span>
                    </div>
                  )}
                </div>

                {/* Bio/Description */}
                {profile?.personal?.motto && (
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                    {profile.personal.motto}
                  </p>
                )}

                {/* Skills and Interests Row */}
                <div className="flex items-center space-x-6">
                  {/* Skills */}
                  {profile?.core?.mainSkills && profile.core?.mainSkills.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Skills:</span>
                      <div className="flex gap-2">
                        {profile.core?.mainSkills.slice(0, 3).map((skill, index) => (
                          <span
                            key={`${skill}-${index}`}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                          >
                            {skill}
                          </span>
                        ))}
                        {profile.core.mainSkills.length > 3 && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-500">
                            +{profile.core?.mainSkills.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Interests */}
                  {profile?.personal?.hobbies && profile.personal?.hobbies.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Interests:</span>
                      <div className="flex gap-2">
                        {profile.personal?.hobbies.slice(0, 2).map((hobby, index) => (
                          <span
                            key={`${hobby}-${index}`}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600"
                          >
                            {hobby}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};