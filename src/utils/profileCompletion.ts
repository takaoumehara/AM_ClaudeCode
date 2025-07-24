import { UserProfile } from '@/lib/firebase/profiles';

export interface ProfileCompletion {
  percentage: number;
  missing: string[];
  suggestions: string[];
  completedSections: string[];
  totalSections: number;
}

export const calculateProfileCompletion = (profile: UserProfile): ProfileCompletion => {
  const sections = [
    {
      name: 'Profile Photo',
      isComplete: !!profile.core.photoUrl,
      suggestion: 'Add a profile photo to help colleagues recognize you'
    },
    {
      name: 'Name',
      isComplete: !!profile.core.name,
      suggestion: 'Add your full name to your profile'
    },
    {
      name: 'Job Title',
      isComplete: !!profile.core.mainTitle,
      suggestion: 'Add your current job title or role'
    },
    {
      name: 'Skills',
      isComplete: !!(profile.core.mainSkills && profile.core.mainSkills.length > 0),
      suggestion: 'Add at least 3 skills to showcase your expertise'
    },
    {
      name: 'Teams',
      isComplete: !!(profile.core.teamIds && profile.core.teamIds.length > 0),
      suggestion: 'Join or add teams you\'re part of'
    },
    {
      name: 'Hobbies',
      isComplete: !!(profile.personal?.hobbies && profile.personal.hobbies.length > 0),
      suggestion: 'Share your hobbies and interests to connect with colleagues'
    },
    {
      name: 'Personal Motto',
      isComplete: !!profile.personal?.motto,
      suggestion: 'Add a personal motto or philosophy that represents you'
    },
    {
      name: 'Learning Goals',
      isComplete: !!(profile.personal?.learning && profile.personal.learning.length > 0),
      suggestion: 'Share what you\'re currently learning or want to learn'
    },
    {
      name: 'Activities',
      isComplete: !!(profile.personal?.activities && profile.personal.activities.length > 0),
      suggestion: 'Add your current activities and involvement'
    },
    {
      name: 'Favorites',
      isComplete: !!(profile.personal?.favorites && profile.personal.favorites.length > 0),
      suggestion: 'Share your favorite things (books, movies, tools, etc.)'
    }
  ];

  const completedSections = sections.filter(section => section.isComplete);
  const missingSections = sections.filter(section => !section.isComplete);
  
  const percentage = Math.round((completedSections.length / sections.length) * 100);
  
  const missing = missingSections.map(section => section.name);
  const suggestions = missingSections.map(section => section.suggestion);
  
  return {
    percentage,
    missing,
    suggestions,
    completedSections: completedSections.map(section => section.name),
    totalSections: sections.length
  };
};

export const getProfileCompletenessLevel = (percentage: number): {
  level: 'low' | 'medium' | 'high' | 'complete';
  label: string;
  color: string;
} => {
  if (percentage >= 100) {
    return {
      level: 'complete',
      label: 'Complete',
      color: 'green'
    };
  } else if (percentage >= 75) {
    return {
      level: 'high',
      label: 'Almost Complete',
      color: 'blue'
    };
  } else if (percentage >= 50) {
    return {
      level: 'medium',
      label: 'Good Progress',
      color: 'yellow'
    };
  } else {
    return {
      level: 'low',
      label: 'Needs Work',
      color: 'red'
    };
  }
};

export const getPriorityMissingSections = (profile: UserProfile): string[] => {
  // High priority sections that significantly impact profile visibility and usefulness
  const highPrioritySections = [
    {
      name: 'Profile Photo',
      isComplete: !!profile.core.photoUrl
    },
    {
      name: 'Job Title',
      isComplete: !!profile.core.mainTitle
    },
    {
      name: 'Skills',
      isComplete: !!(profile.core.mainSkills && profile.core.mainSkills.length >= 3)
    },
    {
      name: 'Teams',
      isComplete: !!(profile.core.teamIds && profile.core.teamIds.length > 0)
    }
  ];

  return highPrioritySections
    .filter(section => !section.isComplete)
    .map(section => section.name);
};

export const generateCompletionTips = (profile: UserProfile): string[] => {
  const tips: string[] = [];
  
  if (!profile.core.photoUrl) {
    tips.push('Upload a professional photo to increase profile views by 40%');
  }
  
  if (!profile.core.mainSkills || profile.core.mainSkills.length < 3) {
    tips.push('Add at least 3 skills to appear in more search results');
  }
  
  if (!profile.personal?.motto) {
    tips.push('A personal motto helps colleagues understand your values and approach');
  }
  
  if (!profile.personal?.learning || profile.personal.learning.length === 0) {
    tips.push('Sharing learning goals can lead to mentorship and collaboration opportunities');
  }
  
  if (!profile.personal?.hobbies || profile.personal.hobbies.length === 0) {
    tips.push('Adding hobbies helps you connect with colleagues who share similar interests');
  }
  
  return tips;
};