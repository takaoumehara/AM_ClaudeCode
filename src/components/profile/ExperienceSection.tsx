'use client';

import { CollapsibleSection } from '@/components/common/CollapsibleSection';

interface ExperienceSectionProps {
  teamIds: string[];
  isOwnProfile: boolean;
  onEdit?: () => void;
  className?: string;
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({
  teamIds,
  isOwnProfile,
  onEdit,
  className = ""
}) => {
  if (!teamIds || teamIds.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Teams & Experience</h2>
          {isOwnProfile && onEdit && (
            <button
              onClick={onEdit}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Add Teams
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
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <p className="text-gray-600">
            {isOwnProfile ? 'Add your team memberships and experience' : 'No team information available'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <CollapsibleSection 
      title="Teams & Experience"
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

      {/* Current Teams */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
          <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Current Teams ({teamIds.length})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {teamIds.map((teamId, index) => (
            <TeamCard key={`${teamId}-${index}`} teamId={teamId} />
          ))}
        </div>
      </div>

      {/* Projects Section (placeholder) */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
          <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Recent Projects
        </h3>
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-600">
            Project tracking and experience details coming soon
          </p>
        </div>
      </div>

      {/* Experience Timeline (placeholder) */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
          <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Experience Timeline
        </h3>
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-600">
            Detailed experience timeline will be available in future updates
          </p>
        </div>
      </div>
    </CollapsibleSection>
  );
};

interface TeamCardProps {
  teamId: string;
}

const TeamCard: React.FC<TeamCardProps> = ({ teamId }) => {
  // In a real implementation, you would fetch team details from the database
  // For now, we'll create a placeholder display
  
  const getTeamDisplayName = (id: string) => {
    // Convert teamId to a more readable format
    return id.charAt(0).toUpperCase() + id.slice(1).replace(/[-_]/g, ' ');
  };

  const getTeamColor = (id: string) => {
    // Generate consistent colors based on team ID
    const colors = [
      'bg-blue-100 text-blue-800 border-blue-200',
      'bg-green-100 text-green-800 border-green-200',
      'bg-purple-100 text-purple-800 border-purple-200',
      'bg-orange-100 text-orange-800 border-orange-200',
      'bg-pink-100 text-pink-800 border-pink-200',
      'bg-indigo-100 text-indigo-800 border-indigo-200'
    ];
    
    const hash = id.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className={`p-4 rounded-lg border ${getTeamColor(teamId)} hover:shadow-md transition-shadow duration-200`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h4 className="font-medium text-sm">
              {getTeamDisplayName(teamId)}
            </h4>
            <p className="text-xs opacity-75">
              Active Member
            </p>
          </div>
        </div>
        <div className="w-2 h-2 bg-current rounded-full opacity-60"></div>
      </div>
      
      <div className="mt-3 text-xs opacity-75">
        <div className="flex items-center justify-between">
          <span>Since 2024</span>
          <span>Team ID: {teamId}</span>
        </div>
      </div>
    </div>
  );
};