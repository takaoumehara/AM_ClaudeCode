import { renderHook, act } from '@testing-library/react';
import { useProfileFilters } from './useProfileFilters';
import { ProfileListItem } from '@/lib/firebase/profiles';

const mockProfiles: ProfileListItem[] = [
  {
    id: 'user1',
    profile: {
      core: {
        name: 'Alice Johnson',
        mainTitle: 'Software Engineer',
        teamIds: ['team1', 'team2'],
        mainSkills: ['JavaScript', 'React', 'TypeScript'],
      },
      personal: {},
      profiles: {},
    },
  },
  {
    id: 'user2',
    profile: {
      core: {
        name: 'Bob Smith',
        mainTitle: 'Product Manager',
        teamIds: ['team1'],
        mainSkills: ['Strategy', 'Analytics', 'Leadership'],
      },
      personal: {},
      profiles: {},
    },
  },
  {
    id: 'user3',
    profile: {
      core: {
        name: 'Charlie Brown',
        mainTitle: 'UX Designer',
        teamIds: ['team2', 'team3'],
        mainSkills: ['Figma', 'Research', 'Prototyping'],
      },
      personal: {},
      profiles: {},
    },
  },
  {
    id: 'user4',
    profile: {
      core: {
        name: 'Diana Prince',
        mainTitle: 'Data Scientist',
        teamIds: [],
        mainSkills: [],
      },
      personal: {},
      profiles: {},
    },
  },
];

describe('useProfileFilters', () => {
  it('initializes with all profiles and no filters', () => {
    const { result } = renderHook(() => useProfileFilters(mockProfiles));

    expect(result.current.filteredProfiles).toHaveLength(4);
    expect(result.current.filteredProfiles).toEqual(mockProfiles);
    expect(result.current.hasActiveFilters).toBe(false);
    expect(result.current.filters.searchTerm).toBe('');
    expect(result.current.filters.selectedSkills).toEqual([]);
    expect(result.current.filters.selectedTeams).toEqual([]);
  });

  it('extracts available skills correctly', () => {
    const { result } = renderHook(() => useProfileFilters(mockProfiles));

    const expectedSkills = [
      'Analytics', 'Figma', 'JavaScript', 'Leadership', 'Prototyping', 
      'React', 'Research', 'Strategy', 'TypeScript'
    ];
    
    expect(result.current.availableSkills).toEqual(expectedSkills);
  });

  it('extracts available teams correctly', () => {
    const { result } = renderHook(() => useProfileFilters(mockProfiles));

    expect(result.current.availableTeams).toEqual(['team1', 'team2', 'team3']);
  });

  it('filters by search term across multiple fields', () => {
    const { result } = renderHook(() => useProfileFilters(mockProfiles));

    // Search by name
    act(() => {
      result.current.updateFilters({ searchTerm: 'Alice' });
    });

    expect(result.current.filteredProfiles).toHaveLength(1);
    expect(result.current.filteredProfiles[0].profile.core.name).toBe('Alice Johnson');

    // Search by title
    act(() => {
      result.current.updateFilters({ searchTerm: 'Manager' });
    });

    expect(result.current.filteredProfiles).toHaveLength(1);
    expect(result.current.filteredProfiles[0].profile.core.name).toBe('Bob Smith');

    // Search by skill
    act(() => {
      result.current.updateFilters({ searchTerm: 'React' });
    });

    expect(result.current.filteredProfiles).toHaveLength(1);
    expect(result.current.filteredProfiles[0].profile.core.name).toBe('Alice Johnson');

    // Search by team
    act(() => {
      result.current.updateFilters({ searchTerm: 'team3' });
    });

    expect(result.current.filteredProfiles).toHaveLength(1);
    expect(result.current.filteredProfiles[0].profile.core.name).toBe('Charlie Brown');
  });

  it('performs case-insensitive search', () => {
    const { result } = renderHook(() => useProfileFilters(mockProfiles));

    act(() => {
      result.current.updateFilters({ searchTerm: 'ALICE' });
    });

    expect(result.current.filteredProfiles).toHaveLength(1);
    expect(result.current.filteredProfiles[0].profile.core.name).toBe('Alice Johnson');

    act(() => {
      result.current.updateFilters({ searchTerm: 'javascript' });
    });

    expect(result.current.filteredProfiles).toHaveLength(1);
    expect(result.current.filteredProfiles[0].profile.core.name).toBe('Alice Johnson');
  });

  it('trims search terms', () => {
    const { result } = renderHook(() => useProfileFilters(mockProfiles));

    act(() => {
      result.current.updateFilters({ searchTerm: '  Alice  ' });
    });

    expect(result.current.filteredProfiles).toHaveLength(1);
    expect(result.current.filteredProfiles[0].profile.core.name).toBe('Alice Johnson');
  });

  it('filters by selected skills', () => {
    const { result } = renderHook(() => useProfileFilters(mockProfiles));

    // Filter by JavaScript skill
    act(() => {
      result.current.updateFilters({ selectedSkills: ['JavaScript'] });
    });

    expect(result.current.filteredProfiles).toHaveLength(1);
    expect(result.current.filteredProfiles[0].profile.core.name).toBe('Alice Johnson');

    // Filter by multiple skills (OR logic)
    act(() => {
      result.current.updateFilters({ selectedSkills: ['JavaScript', 'Figma'] });
    });

    expect(result.current.filteredProfiles).toHaveLength(2);
    const names = result.current.filteredProfiles.map(p => p.profile.core.name);
    expect(names).toContain('Alice Johnson');
    expect(names).toContain('Charlie Brown');
  });

  it('filters by selected teams', () => {
    const { result } = renderHook(() => useProfileFilters(mockProfiles));

    // Filter by team1
    act(() => {
      result.current.updateFilters({ selectedTeams: ['team1'] });
    });

    expect(result.current.filteredProfiles).toHaveLength(2);
    const names = result.current.filteredProfiles.map(p => p.profile.core.name);
    expect(names).toContain('Alice Johnson');
    expect(names).toContain('Bob Smith');

    // Filter by multiple teams (OR logic)
    act(() => {
      result.current.updateFilters({ selectedTeams: ['team2', 'team3'] });
    });

    expect(result.current.filteredProfiles).toHaveLength(2);
    const namesMultiple = result.current.filteredProfiles.map(p => p.profile.core.name);
    expect(namesMultiple).toContain('Alice Johnson');
    expect(namesMultiple).toContain('Charlie Brown');
  });

  it('combines multiple filters (AND logic)', () => {
    const { result } = renderHook(() => useProfileFilters(mockProfiles));

    // Search for "Software" AND has "JavaScript" skill AND in "team1"
    act(() => {
      result.current.updateFilters({
        searchTerm: 'Software',
        selectedSkills: ['JavaScript'],
        selectedTeams: ['team1']
      });
    });

    expect(result.current.filteredProfiles).toHaveLength(1);
    expect(result.current.filteredProfiles[0].profile.core.name).toBe('Alice Johnson');

    // Search that should return no results
    act(() => {
      result.current.updateFilters({
        searchTerm: 'Software',
        selectedSkills: ['Figma'], // Alice doesn't have Figma
        selectedTeams: ['team1']
      });
    });

    expect(result.current.filteredProfiles).toHaveLength(0);
  });

  it('excludes profiles without required skills when filtering by skills', () => {
    const { result } = renderHook(() => useProfileFilters(mockProfiles));

    act(() => {
      result.current.updateFilters({ selectedSkills: ['JavaScript'] });
    });

    // Diana Prince has no skills, should be excluded
    expect(result.current.filteredProfiles).toHaveLength(1);
    expect(result.current.filteredProfiles[0].profile.core.name).toBe('Alice Johnson');
  });

  it('excludes profiles without required teams when filtering by teams', () => {
    const { result } = renderHook(() => useProfileFilters(mockProfiles));

    act(() => {
      result.current.updateFilters({ selectedTeams: ['team1'] });
    });

    // Diana Prince has no teams, should be excluded
    expect(result.current.filteredProfiles).toHaveLength(2);
    const names = result.current.filteredProfiles.map(p => p.profile.core.name);
    expect(names).not.toContain('Diana Prince');
  });

  it('clears all filters correctly', () => {
    const { result } = renderHook(() => useProfileFilters(mockProfiles));

    // Set some filters
    act(() => {
      result.current.updateFilters({
        searchTerm: 'Alice',
        selectedSkills: ['JavaScript'],
        selectedTeams: ['team1']
      });
    });

    expect(result.current.hasActiveFilters).toBe(true);
    expect(result.current.filteredProfiles).toHaveLength(1);

    // Clear all filters
    act(() => {
      result.current.clearAllFilters();
    });

    expect(result.current.hasActiveFilters).toBe(false);
    expect(result.current.filteredProfiles).toHaveLength(4);
    expect(result.current.filters.searchTerm).toBe('');
    expect(result.current.filters.selectedSkills).toEqual([]);
    expect(result.current.filters.selectedTeams).toEqual([]);
  });

  it('detects active filters correctly', () => {
    const { result } = renderHook(() => useProfileFilters(mockProfiles));

    expect(result.current.hasActiveFilters).toBe(false);

    // Search term
    act(() => {
      result.current.updateFilters({ searchTerm: 'Alice' });
    });
    expect(result.current.hasActiveFilters).toBe(true);

    // Clear search, add skill filter
    act(() => {
      result.current.updateFilters({ searchTerm: '', selectedSkills: ['JavaScript'] });
    });
    expect(result.current.hasActiveFilters).toBe(true);

    // Clear skill, add team filter
    act(() => {
      result.current.updateFilters({ selectedSkills: [], selectedTeams: ['team1'] });
    });
    expect(result.current.hasActiveFilters).toBe(true);

    // Clear all
    act(() => {
      result.current.updateFilters({ selectedTeams: [] });
    });
    expect(result.current.hasActiveFilters).toBe(false);
  });

  it('ignores whitespace-only search terms', () => {
    const { result } = renderHook(() => useProfileFilters(mockProfiles));

    act(() => {
      result.current.updateFilters({ searchTerm: '   ' });
    });

    expect(result.current.hasActiveFilters).toBe(false);
    expect(result.current.filteredProfiles).toHaveLength(4);
  });

  it('handles empty profiles array', () => {
    const { result } = renderHook(() => useProfileFilters([]));

    expect(result.current.filteredProfiles).toEqual([]);
    expect(result.current.availableSkills).toEqual([]);
    expect(result.current.availableTeams).toEqual([]);

    // Should not crash when applying filters to empty array
    act(() => {
      result.current.updateFilters({ searchTerm: 'test' });
    });

    expect(result.current.filteredProfiles).toEqual([]);
  });

  it('handles profiles with missing or empty skills/teams', () => {
    const profilesWithMissingData: ProfileListItem[] = [
      {
        id: 'user1',
        profile: {
          core: {
            name: 'User1',
            teamIds: [],
            mainSkills: [],
          },
          personal: {},
          profiles: {},
        },
      },
      {
        id: 'user2',
        profile: {
          core: {
            name: 'User2',
            teamIds: ['team1'],
            mainSkills: ['skill1'],
          },
          personal: {},
          profiles: {},
        },
      },
    ];

    const { result } = renderHook(() => useProfileFilters(profilesWithMissingData));

    expect(result.current.availableSkills).toEqual(['skill1']);
    expect(result.current.availableTeams).toEqual(['team1']);

    // Filter by skill should only return User2
    act(() => {
      result.current.updateFilters({ selectedSkills: ['skill1'] });
    });

    expect(result.current.filteredProfiles).toHaveLength(1);
    expect(result.current.filteredProfiles[0].id).toBe('user2');
  });

  it('filters out empty skills and teams from available lists', () => {
    const profilesWithEmptyValues: ProfileListItem[] = [
      {
        id: 'user1',
        profile: {
          core: {
            name: 'User1',
            teamIds: ['', 'team1', ' '],
            mainSkills: ['', 'skill1', '  '],
          },
          personal: {},
          profiles: {},
        },
      },
    ];

    const { result } = renderHook(() => useProfileFilters(profilesWithEmptyValues));

    expect(result.current.availableSkills).toEqual(['skill1']);
    expect(result.current.availableTeams).toEqual(['team1']);
  });

  it('updates filters partially', () => {
    const { result } = renderHook(() => useProfileFilters(mockProfiles));

    // Set initial filters
    act(() => {
      result.current.updateFilters({
        searchTerm: 'Alice',
        selectedSkills: ['JavaScript'],
        selectedTeams: ['team1']
      });
    });

    // Update only search term
    act(() => {
      result.current.updateFilters({ searchTerm: 'Bob' });
    });

    expect(result.current.filters.searchTerm).toBe('Bob');
    expect(result.current.filters.selectedSkills).toEqual(['JavaScript']); // Should remain
    expect(result.current.filters.selectedTeams).toEqual(['team1']); // Should remain
  });

  it('re-filters when profiles change', () => {
    const { result, rerender } = renderHook(
      ({ profiles }) => useProfileFilters(profiles),
      { initialProps: { profiles: mockProfiles.slice(0, 2) } }
    );

    // Set a filter
    act(() => {
      result.current.updateFilters({ searchTerm: 'Alice' });
    });

    expect(result.current.filteredProfiles).toHaveLength(1);

    // Add more profiles
    rerender({ profiles: mockProfiles });

    // Should still be filtered
    expect(result.current.filteredProfiles).toHaveLength(1);
    expect(result.current.filteredProfiles[0].profile.core.name).toBe('Alice Johnson');
  });
});