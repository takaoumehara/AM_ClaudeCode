import { renderHook } from '@testing-library/react';
import { useComparison, compareProfiles, calculateGroupSimilarity } from './useComparison';
import { UserProfile } from '@/lib/firebase/profiles';

const mockProfile1: UserProfile = {
  core: {
    name: 'John Doe',
    photoUrl: '',
    mainTitle: 'Software Engineer',
    teamIds: ['team1', 'team2'],
    mainSkills: ['JavaScript', 'React', 'Node.js']
  },
  personal: {
    hobbies: ['Photography', 'Hiking', 'Reading'],
    favorites: ['Coffee', 'Books'],
    learning: ['Machine Learning'],
    motto: 'Learn every day',
    activities: ['Coding', 'Teaching'],
    show: {}
  }
};

const mockProfile2: UserProfile = {
  core: {
    name: 'Jane Smith',
    photoUrl: '',
    mainTitle: 'Frontend Developer',
    teamIds: ['team1', 'team3'],
    mainSkills: ['JavaScript', 'Vue.js', 'CSS']
  },
  personal: {
    hobbies: ['Photography', 'Cooking', 'Travel'],
    favorites: ['Tea', 'Movies'],
    learning: ['TypeScript'],
    motto: 'Stay curious',
    activities: ['Design', 'Mentoring'],
    show: {}
  }
};

const mockProfile3: UserProfile = {
  core: {
    name: 'Bob Wilson',
    photoUrl: '',
    mainTitle: 'Backend Developer',
    teamIds: ['team2', 'team4'],
    mainSkills: ['Python', 'Django', 'PostgreSQL']
  },
  personal: {
    hobbies: ['Gaming', 'Music', 'Reading'],
    favorites: ['Pizza', 'Music'],
    learning: ['Docker'],
    motto: 'Code with passion',
    activities: ['Development', 'Code Review'],
    show: {}
  }
};

const profileData1 = { id: '1', profile: mockProfile1 };
const profileData2 = { id: '2', profile: mockProfile2 };
const profileData3 = { id: '3', profile: mockProfile3 };

describe('useComparison', () => {
  it('returns empty common elements for single profile', () => {
    const { result } = renderHook(() => useComparison([profileData1]));

    expect(result.current.commonElements).toEqual({
      skills: [],
      interests: [],
      teams: []
    });
  });

  it('finds common elements between two profiles', () => {
    const { result } = renderHook(() => useComparison([profileData1, profileData2]));

    expect(result.current.commonElements.skills).toContain('JavaScript');
    expect(result.current.commonElements.interests).toContain('Photography');
    expect(result.current.commonElements.teams).toContain('team1');
  });

  it('handles profiles with no common elements', () => {
    const profileWithNoCommon = {
      id: '4',
      profile: {
        core: {
          name: 'Alice Johnson',
          photoUrl: '',
          mainTitle: 'Designer',
          teamIds: ['team5'],
          mainSkills: ['Figma', 'Sketch']
        },
        personal: {
          hobbies: ['Drawing', 'Painting'],
          show: {}
        }
      }
    };

    const { result } = renderHook(() => useComparison([profileData1, profileWithNoCommon]));

    expect(result.current.commonElements.skills).toHaveLength(0);
    expect(result.current.commonElements.interests).toHaveLength(0);
    expect(result.current.commonElements.teams).toHaveLength(0);
  });

  it('finds common elements across multiple profiles', () => {
    const { result } = renderHook(() => useComparison([profileData1, profileData2, profileData3]));

    // Only elements common to ALL profiles should be included
    expect(result.current.commonElements.skills).toHaveLength(0); // No skills common to all 3
    expect(result.current.commonElements.interests).toHaveLength(0); // Reading is not in profile 2
    expect(result.current.commonElements.teams).toHaveLength(0); // No teams common to all 3
  });

  it('provides helper functions for getting common elements', () => {
    const { result } = renderHook(() => useComparison([profileData1, profileData2]));

    expect(result.current.getCommonSkills()).toEqual(result.current.commonElements.skills);
    expect(result.current.getCommonInterests()).toEqual(result.current.commonElements.interests);
    expect(result.current.getCommonTeams()).toEqual(result.current.commonElements.teams);
  });

  it('provides functions to get individual profile data', () => {
    const { result } = renderHook(() => useComparison([profileData1, profileData2]));

    expect(result.current.getProfileSkills('1')).toEqual(['JavaScript', 'React', 'Node.js']);
    expect(result.current.getProfileInterests('1')).toEqual(['Photography', 'Hiking', 'Reading']);
    expect(result.current.getProfileTeams('1')).toEqual(['team1', 'team2']);
  });

  it('returns empty arrays for non-existent profile IDs', () => {
    const { result } = renderHook(() => useComparison([profileData1, profileData2]));

    expect(result.current.getProfileSkills('999')).toEqual([]);
    expect(result.current.getProfileInterests('999')).toEqual([]);
    expect(result.current.getProfileTeams('999')).toEqual([]);
  });

  it('provides comparison statistics', () => {
    const { result } = renderHook(() => useComparison([profileData1, profileData2]));

    const stats = result.current.getComparisonStats();
    expect(stats.totalProfiles).toBe(2);
    expect(stats.totalCommonElements).toBeGreaterThan(0);
    expect(stats.hasCommonSkills).toBe(true);
    expect(stats.hasCommonInterests).toBe(true);
    expect(stats.hasCommonTeams).toBe(true);
  });

  it('handles case-insensitive comparison', () => {
    const profileWithDifferentCase = {
      id: '4',
      profile: {
        core: {
          name: 'Test User',
          photoUrl: '',
          mainTitle: 'Developer',
          teamIds: ['TEAM1'], // Different case
          mainSkills: ['javascript', 'REACT'] // Different cases
        },
        personal: {
          hobbies: ['PHOTOGRAPHY'], // Different case
          show: {}
        }
      }
    };

    const { result } = renderHook(() => useComparison([profileData1, profileWithDifferentCase]));

    expect(result.current.commonElements.skills).toContain('JavaScript');
    expect(result.current.commonElements.skills).toContain('React');
    expect(result.current.commonElements.interests).toContain('Photography');
    expect(result.current.commonElements.teams).toContain('team1');
  });

  it('updates common elements when profiles change', () => {
    const { result, rerender } = renderHook(
      ({ profiles }) => useComparison(profiles),
      { initialProps: { profiles: [profileData1] } }
    );

    expect(result.current.commonElements.skills).toHaveLength(0);

    rerender({ profiles: [profileData1, profileData2] });

    expect(result.current.commonElements.skills).toContain('JavaScript');
    expect(result.current.commonElements.interests).toContain('Photography');
  });
});

describe('compareProfiles', () => {
  it('compares two profiles correctly', () => {
    const comparison = compareProfiles(mockProfile1, mockProfile2);

    expect(comparison.commonSkills).toContain('JavaScript');
    expect(comparison.commonInterests).toContain('Photography');
    expect(comparison.commonTeams).toContain('team1');
    expect(comparison.totalCommon).toBeGreaterThan(0);
    expect(comparison.similarityScore).toBeGreaterThan(0);
  });

  it('handles profiles with no similarities', () => {
    const dissimilarProfile: UserProfile = {
      core: {
        name: 'Different Person',
        photoUrl: '',
        mainTitle: 'Designer',
        teamIds: ['team99'],
        mainSkills: ['Figma', 'Sketch']
      },
      personal: {
        hobbies: ['Drawing'],
        show: {}
      }
    };

    const comparison = compareProfiles(mockProfile1, dissimilarProfile);

    expect(comparison.commonSkills).toHaveLength(0);
    expect(comparison.commonInterests).toHaveLength(0);
    expect(comparison.commonTeams).toHaveLength(0);
    expect(comparison.totalCommon).toBe(0);
    expect(comparison.similarityScore).toBe(0);
  });

  it('calculates similarity score correctly', () => {
    const identicalProfile = { ...mockProfile1 };
    const comparison = compareProfiles(mockProfile1, identicalProfile);

    expect(comparison.similarityScore).toBe(100);
  });
});

describe('calculateGroupSimilarity', () => {
  it('returns 0 for single profile', () => {
    const similarity = calculateGroupSimilarity([profileData1]);
    expect(similarity).toBe(0);
  });

  it('returns 0 for empty array', () => {
    const similarity = calculateGroupSimilarity([]);
    expect(similarity).toBe(0);
  });

  it('calculates average similarity for multiple profiles', () => {
    const similarity = calculateGroupSimilarity([profileData1, profileData2, profileData3]);
    expect(similarity).toBeGreaterThanOrEqual(0);
    expect(similarity).toBeLessThanOrEqual(100);
  });

  it('returns 100 for identical profiles', () => {
    const identicalProfiles = [
      profileData1,
      { id: '2', profile: { ...mockProfile1 } },
      { id: '3', profile: { ...mockProfile1 } }
    ];
    const similarity = calculateGroupSimilarity(identicalProfiles);
    expect(similarity).toBe(100);
  });
});