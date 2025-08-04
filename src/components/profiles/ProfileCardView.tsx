'use client';

import Link from 'next/link';
import { ProfileListItem } from '@/lib/firebase/profiles';
import { User, MapPin, Users, Zap } from 'lucide-react';

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

interface ProfileGridProps {
  profiles: ProfileListItem[];
  loading?: boolean;
  onSort?: (field: SortField, direction: SortDirection) => void;
  sortField?: SortField;
  sortDirection?: SortDirection;
}

export const ProfileCardView: React.FC<ProfileGridProps> = ({
  profiles,
  loading = false,
}) => {

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-sm p-8 animate-pulse">
            <div className="flex flex-col items-center">
              {/* Avatar skeleton - Square */}
              <div className="w-full aspect-square bg-gray-200 rounded-2xl mb-6"></div>
              {/* Name skeleton */}
              <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
              {/* Title skeleton */}
              <div className="h-4 bg-gray-200 rounded w-24 mb-6"></div>
              {/* Bio skeleton */}
              <div className="space-y-2 mb-6 w-full">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-4/5 mx-auto"></div>
              </div>
              {/* Skills skeleton */}
              <div className="flex gap-2 mb-4">
                <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                <div className="h-6 bg-gray-200 rounded-full w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 m-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <User size={32} className="text-gray-400" />
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {profiles.map(({ id, profile }) => (
        <Link 
          key={id}
          href={`/profiles/${id}`}
          className="block"
        >
          <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-8 h-full flex flex-col items-center text-center group cursor-pointer">
            {/* Profile Avatar - Large Square with Initials */}
            <div className="w-full aspect-square rounded-2xl mb-6 flex items-center justify-center text-white text-6xl font-bold" 
                 style={{ backgroundColor: getProfileColor(profile?.core?.name || '') }}>
              {getInitials(profile?.core?.name || 'U')}
            </div>

            {/* Name */}
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {profile?.core?.name || 'Unknown'}
            </h3>

            {/* Title */}
            {profile?.core?.mainTitle && (
              <p className="text-lg text-gray-600 mb-6">
                {profile.core.mainTitle}
              </p>
            )}

            {/* Bio/Description - if we have motto from personal */}
            {profile?.personal?.motto && (
              <p className="text-sm text-gray-500 mb-6 line-clamp-3 leading-relaxed">
                {profile.personal.motto}
              </p>
            )}

            {/* Skills Section */}
            {profile?.core?.mainSkills && profile.core?.mainSkills.length > 0 && (
              <div className="w-full mb-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Skills</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {profile.core?.mainSkills.slice(0, 4).map((skill, index) => (
                    <span
                      key={`${skill}-${index}`}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                    >
                      {skill}
                    </span>
                  ))}
                  {profile.core.mainSkills.length > 4 && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-500">
                      +{profile.core?.mainSkills.length - 4}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Interests Section - from personal.hobbies */}
            {profile?.personal?.hobbies && profile.personal?.hobbies.length > 0 && (
              <div className="w-full">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Interests</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {profile.personal?.hobbies.slice(0, 3).map((hobby, index) => (
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

            {/* Teams indicator - subtle at bottom */}
            {profile?.core?.teamIds && profile.core?.teamIds.length > 0 && (
              <div className="mt-auto pt-4">
                <div className="flex items-center justify-center space-x-1 text-xs text-gray-400">
                  <Users size={12} />
                  <span>{profile.core?.teamIds.length} team{profile.core?.teamIds.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
};