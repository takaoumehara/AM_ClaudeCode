import { UserProfile } from '@/lib/firebase/profiles';

export interface VisibilityContext {
  viewerUserId?: string;
  organizationId?: string;
  isOwnProfile: boolean;
  viewerRole?: 'admin' | 'member' | 'guest';
}

export interface VisibilityResult {
  visibleProfile: UserProfile;
  sectionVisibility: { [key: string]: boolean };
  reasons: { [key: string]: string };
}

export const applyVisibilityRules = (
  profile: UserProfile,
  context: VisibilityContext
): VisibilityResult => {
  // If it's the user's own profile, show everything
  if (context.isOwnProfile) {
    return {
      visibleProfile: profile,
      sectionVisibility: {
        core: true,
        skills: true,
        personal: true,
        experience: true,
        contact: true,
        all: true
      },
      reasons: {}
    };
  }

  // Default visibility settings - these would typically come from the user's privacy settings
  const defaultVisibility = {
    core: true,        // Basic info (name, title) is usually public
    skills: true,      // Skills are usually public in professional contexts
    personal: false,   // Personal info is private by default
    experience: true,  // Teams/experience is usually visible to organization members
    contact: false     // Contact info is private by default
  };

  // Apply user's custom visibility settings if they exist
  const userVisibilitySettings = profile.personal?.show || {};
  
  const sectionVisibility: { [key: string]: boolean } = {};
  const reasons: { [key: string]: string } = {};

  // Core information (name, title, photo)
  sectionVisibility.core = true; // Always visible
  
  // Skills section
  sectionVisibility.skills = getUserVisibilitySetting(
    userVisibilitySettings,
    'skills',
    context.organizationId,
    defaultVisibility.skills
  );
  if (!sectionVisibility.skills) {
    reasons.skills = 'User has restricted skills visibility';
  }

  // Personal information
  sectionVisibility.personal = getUserVisibilitySetting(
    userVisibilitySettings,
    'personal',
    context.organizationId,
    defaultVisibility.personal
  );
  if (!sectionVisibility.personal) {
    reasons.personal = 'User has kept personal information private';
  }

  // Experience/Teams
  sectionVisibility.experience = getUserVisibilitySetting(
    userVisibilitySettings,
    'experience',
    context.organizationId,
    defaultVisibility.experience
  );
  if (!sectionVisibility.experience) {
    reasons.experience = 'User has restricted team/experience visibility';
  }

  // Contact information
  sectionVisibility.contact = getUserVisibilitySetting(
    userVisibilitySettings,
    'contact',
    context.organizationId,
    defaultVisibility.contact
  );
  if (!sectionVisibility.contact) {
    reasons.contact = 'Contact information is private';
  }

  // Create filtered profile based on visibility settings
  const visibleProfile: UserProfile = {
    core: {
      name: profile.core.name,
      photoUrl: profile.core.photoUrl,
      mainTitle: profile.core.mainTitle,
      teamIds: sectionVisibility.experience ? profile.core.teamIds : [],
      mainSkills: sectionVisibility.skills ? profile.core.mainSkills : []
    },
    personal: sectionVisibility.personal ? profile.personal : undefined,
    profiles: profile.profiles // Organization-specific profiles are handled separately
  };

  return {
    visibleProfile,
    sectionVisibility,
    reasons
  };
};

/**
 * Get user's visibility setting for a specific section
 * @param userSettings - User's custom visibility settings
 * @param section - Section name
 * @param organizationId - Current organization ID
 * @param defaultValue - Default visibility value
 */
const getUserVisibilitySetting = (
  userSettings: { [key: string]: any },
  section: string,
  organizationId?: string,
  defaultValue: boolean = true
): boolean => {
  const sectionSettings = userSettings[section];
  
  if (!sectionSettings) {
    return defaultValue;
  }

  // If it's a boolean, use that value
  if (typeof sectionSettings === 'boolean') {
    return sectionSettings;
  }

  // If it's an object with organization-specific settings
  if (typeof sectionSettings === 'object') {
    // First check organization-specific setting
    if (organizationId && sectionSettings[organizationId] !== undefined) {
      return sectionSettings[organizationId];
    }
    
    // Then check 'all' setting (public visibility)
    if (sectionSettings.all !== undefined) {
      return sectionSettings.all;
    }
    
    // Default to false if no specific setting found
    return false;
  }

  return defaultValue;
};

/**
 * Check if user has permission to view specific content
 * @param profile - User profile
 * @param context - Visibility context
 * @param section - Section to check
 */
export const canViewSection = (
  profile: UserProfile,
  context: VisibilityContext,
  section: string
): boolean => {
  const { sectionVisibility } = applyVisibilityRules(profile, context);
  return sectionVisibility[section] !== false;
};

/**
 * Get visibility summary for a profile
 * @param profile - User profile
 * @param context - Visibility context
 */
export const getVisibilitySummary = (
  profile: UserProfile,
  context: VisibilityContext
): {
  level: 'public' | 'organization' | 'private';
  visibleSections: string[];
  hiddenSections: string[];
  totalSections: number;
} => {
  const { sectionVisibility } = applyVisibilityRules(profile, context);
  
  const visibleSections = Object.entries(sectionVisibility)
    .filter(([_, visible]) => visible)
    .map(([section, _]) => section);
    
  const hiddenSections = Object.entries(sectionVisibility)
    .filter(([_, visible]) => !visible)
    .map(([section, _]) => section);

  const totalSections = Object.keys(sectionVisibility).length;
  const visibilityPercentage = visibleSections.length / totalSections;

  let level: 'public' | 'organization' | 'private';
  if (visibilityPercentage >= 0.8) {
    level = 'public';
  } else if (visibilityPercentage >= 0.4) {
    level = 'organization';
  } else {
    level = 'private';
  }

  return {
    level,
    visibleSections,
    hiddenSections,
    totalSections
  };
};