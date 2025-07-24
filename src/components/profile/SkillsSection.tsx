'use client';

import { CollapsibleSection } from '@/components/common/CollapsibleSection';

interface SkillsSectionProps {
  skills: string[];
  isOwnProfile: boolean;
  onEdit?: () => void;
  className?: string;
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({
  skills,
  isOwnProfile,
  onEdit,
  className = ""
}) => {
  // Group skills by category (this is a simple implementation)
  const categorizeSkills = (skillList: string[]) => {
    const categories: { [key: string]: string[] } = {
      'Technical': [],
      'Other': []
    };

    const technicalKeywords = [
      'javascript', 'typescript', 'react', 'node', 'python', 'java', 'aws', 'docker', 
      'kubernetes', 'sql', 'nosql', 'mongodb', 'postgresql', 'redis', 'git', 'ci/cd',
      'html', 'css', 'vue', 'angular', 'express', 'django', 'flask', 'spring'
    ];

    skillList.forEach(skill => {
      const isLikelyTechnical = technicalKeywords.some(keyword => 
        skill.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (isLikelyTechnical) {
        categories['Technical'].push(skill);
      } else {
        categories['Other'].push(skill);
      }
    });

    // Remove empty categories
    Object.keys(categories).forEach(key => {
      if (categories[key].length === 0) {
        delete categories[key];
      }
    });

    return categories;
  };

  const categorizedSkills = categorizeSkills(skills);

  if (skills.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Skills</h2>
          {isOwnProfile && onEdit && (
            <button
              onClick={onEdit}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Add Skills
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
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          <p className="text-gray-600">
            {isOwnProfile ? 'Add your skills to showcase your expertise' : 'No skills listed yet'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <CollapsibleSection 
      title="Skills & Expertise"
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
        {Object.entries(categorizedSkills).map(([category, categorySkills]) => (
          <div key={category}>
            <h3 className="text-sm sm:text-base font-medium text-gray-700 mb-2 sm:mb-3">
              {category} ({categorySkills.length})
            </h3>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {categorySkills.map((skill, index) => (
                <SkillBadge
                  key={`${skill}-${index}`}
                  skill={skill}
                  category={category}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Skills Overview */}
      <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-gray-600 space-y-2 sm:space-y-0">
          <span>Total Skills: {skills.length}</span>
          <div className="flex items-center space-x-3 sm:space-x-4">
            {Object.entries(categorizedSkills).map(([category, categorySkills]) => (
              <span key={category} className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-1 ${
                  category === 'Technical' ? 'bg-blue-500' : 'bg-green-500'
                }`} />
                {category}: {categorySkills.length}
              </span>
            ))}
          </div>
        </div>
      </div>
    </CollapsibleSection>
  );
};

interface SkillBadgeProps {
  skill: string;
  category: string;
}

const SkillBadge: React.FC<SkillBadgeProps> = ({ skill, category }) => {
  const getSkillBadgeColor = (skillCategory: string) => {
    switch (skillCategory) {
      case 'Technical':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Other':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-1 sm:px-3 rounded-full text-xs sm:text-sm font-medium border ${getSkillBadgeColor(category)} hover:shadow-sm transition-shadow duration-200`}
      title={`${category} skill`}
    >
      {skill}
    </span>
  );
};