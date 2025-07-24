'use client';

import Link from 'next/link';
import Image from 'next/image';
import { UserProfile } from '@/lib/firebase/profiles';
import { ProfileCheckbox } from '@/components/selection/ProfileCheckbox';

interface ProfileCardProps {
  profile: UserProfile;
  userId: string;
  onClick?: () => void;
  // Selection props
  isSelectable?: boolean;
  isSelected?: boolean;
  canSelect?: boolean;
  onToggleSelection?: (userId: string) => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ 
  profile, 
  userId, 
  onClick,
  isSelectable = false,
  isSelected = false,
  canSelect = true,
  onToggleSelection
}) => {
  const { core } = profile;
  const displaySkills = core.mainSkills?.slice(0, 3) || [];

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on selection checkbox area
    if (isSelectable && onToggleSelection) {
      const target = e.target as HTMLElement;
      const isCheckboxClick = target.closest('[data-selection-area]');
      if (isCheckboxClick) {
        e.preventDefault();
        return;
      }
    }
    handleClick();
  };

  const CardContent = () => (
    <div className={`group bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden relative ${isSelected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}>
        {/* Selection checkbox */}
        {isSelectable && onToggleSelection && (
          <div 
            className="absolute top-2 left-2 z-10"
            data-selection-area
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleSelection(userId);
            }}
          >
            <ProfileCheckbox
              profileId={userId}
              isSelected={isSelected}
              canSelect={canSelect}
              onToggle={onToggleSelection}
            />
          </div>
        )}

        {/* Profile Photo Section */}
        <div className="relative w-full aspect-square bg-gray-100 flex items-center justify-center">
          {core.photoUrl ? (
            <Image
              src={core.photoUrl}
              alt={core.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center group-hover:bg-gray-300 transition-colors duration-200">
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
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Profile Information Section */}
        <div className="p-4">
          {/* Name and Title */}
          <div className="mb-3">
            <h3 className="font-semibold text-gray-900 text-lg leading-tight mb-1 group-hover:text-blue-600 transition-colors duration-200">
              {core.name}
            </h3>
            {core.mainTitle && (
              <p className="text-sm text-gray-600 leading-tight">
                {core.mainTitle}
              </p>
            )}
          </div>

          {/* Skills */}
          {displaySkills.length > 0 && (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1">
                {displaySkills.map((skill, index) => (
                  <span
                    key={`${skill}-${index}`}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                  >
                    {skill}
                  </span>
                ))}
                {core.mainSkills && core.mainSkills.length > 3 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    +{core.mainSkills.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Empty State for Skills */}
          {displaySkills.length === 0 && (
            <div className="text-xs text-gray-400 italic">
              No skills listed
            </div>
          )}
        </div>

        {/* Hover Effect Overlay */}
        <div className="absolute inset-0 bg-blue-50 bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-200 pointer-events-none" />
      </div>
  );

  if (isSelectable) {
    return (
      <div onClick={handleCardClick}>
        <CardContent />
      </div>
    );
  }

  return (
    <Link href={`/profiles/${userId}`} onClick={handleClick}>
      <CardContent />
    </Link>
  );
};