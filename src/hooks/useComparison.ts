'use client';

import { useMemo } from 'react';
import { UserProfile } from '@/lib/firebase/profiles';

interface ProfileData {
  id: string;
  profile: UserProfile;
}

interface CommonElements {
  skills: string[];
  interests: string[];
  teams: string[];
}

export const useComparison = (profiles: ProfileData[]) => {
  const commonElements = useMemo(() => {
    if (profiles.length < 2) {
      return { skills: [], interests: [], teams: [] };
    }

    // Get all skills from all profiles
    const allSkills = profiles.map(p => p.profile.core.mainSkills || []);
    const allInterests = profiles.map(p => p.profile.personal?.hobbies || []);
    const allTeams = profiles.map(p => p.profile.core.teamIds || []);

    // Find common elements using intersection
    const commonSkills = findCommonElements(allSkills);
    const commonInterests = findCommonElements(allInterests);
    const commonTeams = findCommonElements(allTeams);

    return {
      skills: commonSkills,
      interests: commonInterests,
      teams: commonTeams
    };
  }, [profiles]);

  const getCommonSkills = () => commonElements.skills;
  const getCommonInterests = () => commonElements.interests;
  const getCommonTeams = () => commonElements.teams;

  const getProfileSkills = (profileId: string) => {
    const profile = profiles.find(p => p.id === profileId);
    return profile?.profile.core.mainSkills || [];
  };

  const getProfileInterests = (profileId: string) => {
    const profile = profiles.find(p => p.id === profileId);
    return profile?.profile.personal?.hobbies || [];
  };

  const getProfileTeams = (profileId: string) => {
    const profile = profiles.find(p => p.id === profileId);
    return profile?.profile.core.teamIds || [];
  };

  const getComparisonStats = () => {
    const totalProfiles = profiles.length;
    const totalCommonElements = commonElements.skills.length + 
                               commonElements.interests.length + 
                               commonElements.teams.length;
    
    return {
      totalProfiles,
      totalCommonElements,
      hasCommonSkills: commonElements.skills.length > 0,
      hasCommonInterests: commonElements.interests.length > 0,
      hasCommonTeams: commonElements.teams.length > 0
    };
  };

  return {
    commonElements,
    getCommonSkills,
    getCommonInterests,
    getCommonTeams,
    getProfileSkills,
    getProfileInterests,
    getProfileTeams,
    getComparisonStats
  };
};

// Helper function to find common elements across multiple arrays
function findCommonElements(arrays: string[][]): string[] {
  if (arrays.length === 0) return [];
  if (arrays.length === 1) return arrays[0];

  // Start with the first array
  let common = arrays[0];

  // Intersect with each subsequent array
  for (let i = 1; i < arrays.length; i++) {
    common = common.filter(element => 
      arrays[i].some(item => 
        item.toLowerCase() === element.toLowerCase()
      )
    );
  }

  // Remove duplicates and return
  return Array.from(new Set(common.map(item => item.toLowerCase())))
    .map(lowerItem => {
      // Find the original case version from the first occurrence
      for (const array of arrays) {
        const found = array.find(item => item.toLowerCase() === lowerItem);
        if (found) return found;
      }
      return lowerItem;
    });
}

// Utility functions for profile comparison analysis
export const compareProfiles = (profile1: UserProfile, profile2: UserProfile) => {
  const skills1 = profile1.core.mainSkills || [];
  const skills2 = profile2.core.mainSkills || [];
  const interests1 = profile1.personal?.hobbies || [];
  const interests2 = profile2.personal?.hobbies || [];
  const teams1 = profile1.core.teamIds || [];
  const teams2 = profile2.core.teamIds || [];

  const commonSkills = findCommonElements([skills1, skills2]);
  const commonInterests = findCommonElements([interests1, interests2]);
  const commonTeams = findCommonElements([teams1, teams2]);

  const totalCommon = commonSkills.length + commonInterests.length + commonTeams.length;
  const totalElements = new Set([
    ...skills1, ...skills2, 
    ...interests1, ...interests2, 
    ...teams1, ...teams2
  ]).size;

  const similarityScore = totalElements > 0 ? (totalCommon / totalElements) * 100 : 0;

  return {
    commonSkills,
    commonInterests,
    commonTeams,
    totalCommon,
    similarityScore: Math.round(similarityScore)
  };
};

export const calculateGroupSimilarity = (profiles: ProfileData[]) => {
  if (profiles.length < 2) return 0;

  let totalSimilarity = 0;
  let comparisons = 0;

  // Compare each pair of profiles
  for (let i = 0; i < profiles.length; i++) {
    for (let j = i + 1; j < profiles.length; j++) {
      const comparison = compareProfiles(profiles[i].profile, profiles[j].profile);
      totalSimilarity += comparison.similarityScore;
      comparisons++;
    }
  }

  return comparisons > 0 ? Math.round(totalSimilarity / comparisons) : 0;
};