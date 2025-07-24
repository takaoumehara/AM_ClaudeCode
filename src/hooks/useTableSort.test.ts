import { renderHook, act } from '@testing-library/react';
import { useTableSort } from './useTableSort';
import { ProfileListItem } from '@/lib/firebase/profiles';

const mockProfiles: ProfileListItem[] = [
  {
    id: 'user1',
    profile: {
      core: {
        name: 'Charlie',
        mainTitle: 'Designer',
        teamIds: ['team1'],
        mainSkills: ['Figma', 'Sketch'],
      },
      personal: {},
      profiles: {},
    },
  },
  {
    id: 'user2',
    profile: {
      core: {
        name: 'Alice',
        mainTitle: 'Engineer',
        teamIds: ['team1', 'team2', 'team3'],
        mainSkills: ['JavaScript', 'React', 'TypeScript', 'Node.js'],
      },
      personal: {},
      profiles: {},
    },
  },
  {
    id: 'user3',
    profile: {
      core: {
        name: 'Bob',
        mainTitle: 'Manager',
        teamIds: ['team1', 'team2'],
        mainSkills: ['Leadership'],
      },
      personal: {},
      profiles: {},
    },
  },
];

describe('useTableSort', () => {
  it('initializes with default sort (name ascending)', () => {
    const { result } = renderHook(() => useTableSort(mockProfiles));

    expect(result.current.sortField).toBe('name');
    expect(result.current.sortDirection).toBe('asc');
    expect(result.current.sortedProfiles).toHaveLength(3);
    
    // Should be sorted by name ascending: Alice, Bob, Charlie
    expect(result.current.sortedProfiles[0].profile.core.name).toBe('Alice');
    expect(result.current.sortedProfiles[1].profile.core.name).toBe('Bob');
    expect(result.current.sortedProfiles[2].profile.core.name).toBe('Charlie');
  });

  it('initializes with custom sort options', () => {
    const { result } = renderHook(() => 
      useTableSort(mockProfiles, {
        initialSort: { field: 'title', direction: 'desc' }
      })
    );

    expect(result.current.sortField).toBe('title');
    expect(result.current.sortDirection).toBe('desc');
    
    // Should be sorted by title descending: Manager, Engineer, Designer
    expect(result.current.sortedProfiles[0].profile.core.mainTitle).toBe('Manager');
    expect(result.current.sortedProfiles[1].profile.core.mainTitle).toBe('Engineer');
    expect(result.current.sortedProfiles[2].profile.core.mainTitle).toBe('Designer');
  });

  it('sorts by name correctly', () => {
    const { result } = renderHook(() => useTableSort(mockProfiles));

    // Default should be name ascending: Alice, Bob, Charlie
    expect(result.current.sortedProfiles[0].profile.core.name).toBe('Alice');
    expect(result.current.sortedProfiles[1].profile.core.name).toBe('Bob');
    expect(result.current.sortedProfiles[2].profile.core.name).toBe('Charlie');

    // Change to descending
    act(() => {
      result.current.handleSort('name', 'desc');
    });

    expect(result.current.sortDirection).toBe('desc');
    // Should be Charlie, Bob, Alice
    expect(result.current.sortedProfiles[0].profile.core.name).toBe('Charlie');
    expect(result.current.sortedProfiles[1].profile.core.name).toBe('Bob');
    expect(result.current.sortedProfiles[2].profile.core.name).toBe('Alice');
  });

  it('sorts by title correctly', () => {
    const { result } = renderHook(() => useTableSort(mockProfiles));

    act(() => {
      result.current.handleSort('title', 'asc');
    });

    expect(result.current.sortField).toBe('title');
    expect(result.current.sortDirection).toBe('asc');
    
    // Should be sorted by title ascending: Designer, Engineer, Manager
    expect(result.current.sortedProfiles[0].profile.core.mainTitle).toBe('Designer');
    expect(result.current.sortedProfiles[1].profile.core.mainTitle).toBe('Engineer');
    expect(result.current.sortedProfiles[2].profile.core.mainTitle).toBe('Manager');
  });

  it('sorts by skill count correctly', () => {
    const { result } = renderHook(() => useTableSort(mockProfiles));

    act(() => {
      result.current.handleSort('skillCount', 'asc');
    });

    expect(result.current.sortField).toBe('skillCount');
    
    // Should be sorted by skill count ascending: Bob (1), Charlie (2), Alice (4)
    expect(result.current.sortedProfiles[0].profile.core.name).toBe('Bob');
    expect(result.current.sortedProfiles[1].profile.core.name).toBe('Charlie');
    expect(result.current.sortedProfiles[2].profile.core.name).toBe('Alice');

    // Change to descending
    act(() => {
      result.current.handleSort('skillCount', 'desc');
    });

    // Should be Alice (4), Charlie (2), Bob (1)
    expect(result.current.sortedProfiles[0].profile.core.name).toBe('Alice');
    expect(result.current.sortedProfiles[1].profile.core.name).toBe('Charlie');
    expect(result.current.sortedProfiles[2].profile.core.name).toBe('Bob');
  });

  it('sorts by team count correctly', () => {
    const { result } = renderHook(() => useTableSort(mockProfiles));

    act(() => {
      result.current.handleSort('teamCount', 'asc');
    });

    expect(result.current.sortField).toBe('teamCount');
    
    // Should be sorted by team count ascending: Charlie (1), Bob (2), Alice (3)
    expect(result.current.sortedProfiles[0].profile.core.name).toBe('Charlie');
    expect(result.current.sortedProfiles[1].profile.core.name).toBe('Bob');
    expect(result.current.sortedProfiles[2].profile.core.name).toBe('Alice');
  });

  it('handles missing data gracefully', () => {
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
            mainTitle: 'Title',
            teamIds: ['team1'],
            mainSkills: ['skill1'],
          },
          personal: {},
          profiles: {},
        },
      },
    ];

    const { result } = renderHook(() => useTableSort(profilesWithMissingData));

    // Should handle missing titles
    act(() => {
      result.current.handleSort('title', 'asc');
    });

    expect(result.current.sortedProfiles).toHaveLength(2);
    // Profile with empty title should come first
    expect(result.current.sortedProfiles[0].profile.core.name).toBe('User1');
    expect(result.current.sortedProfiles[1].profile.core.name).toBe('User2');
  });

  it('handles empty profiles array', () => {
    const { result } = renderHook(() => useTableSort([]));

    expect(result.current.sortedProfiles).toEqual([]);
    expect(result.current.sortField).toBe('name');
    expect(result.current.sortDirection).toBe('asc');

    // Should not crash when sorting empty array
    act(() => {
      result.current.handleSort('title', 'desc');
    });

    expect(result.current.sortedProfiles).toEqual([]);
  });

  it('re-sorts when profiles change', () => {
    const { result, rerender } = renderHook(
      ({ profiles }) => useTableSort(profiles),
      { initialProps: { profiles: mockProfiles.slice(0, 2) } }
    );

    // Initially has 2 profiles
    expect(result.current.sortedProfiles).toHaveLength(2);
    expect(result.current.sortedProfiles[0].profile.core.name).toBe('Alice');
    expect(result.current.sortedProfiles[1].profile.core.name).toBe('Charlie');

    // Add third profile
    rerender({ profiles: mockProfiles });

    // Should now have 3 profiles, still sorted
    expect(result.current.sortedProfiles).toHaveLength(3);
    expect(result.current.sortedProfiles[0].profile.core.name).toBe('Alice');
    expect(result.current.sortedProfiles[1].profile.core.name).toBe('Bob');
    expect(result.current.sortedProfiles[2].profile.core.name).toBe('Charlie');
  });

  it('maintains sort state when profiles update', () => {
    const { result, rerender } = renderHook(
      ({ profiles }) => useTableSort(profiles),
      { initialProps: { profiles: mockProfiles } }
    );

    // Change sort to descending
    act(() => {
      result.current.handleSort('name', 'desc');
    });

    expect(result.current.sortDirection).toBe('desc');
    expect(result.current.sortedProfiles[0].profile.core.name).toBe('Charlie');

    // Update profiles array (simulate new data)
    const updatedProfiles = [...mockProfiles].reverse();
    rerender({ profiles: updatedProfiles });

    // Should maintain desc sort order
    expect(result.current.sortDirection).toBe('desc');
    expect(result.current.sortedProfiles[0].profile.core.name).toBe('Charlie');
  });

  it('handles case-insensitive string sorting', () => {
    const profilesWithMixedCase: ProfileListItem[] = [
      {
        id: 'user1',
        profile: {
          core: {
            name: 'alice',
            mainTitle: 'engineer',
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
            name: 'CHARLIE',
            mainTitle: 'DESIGNER',
            teamIds: [],
            mainSkills: [],
          },
          personal: {},
          profiles: {},
        },
      },
      {
        id: 'user3',
        profile: {
          core: {
            name: 'Bob',
            mainTitle: 'Manager',
            teamIds: [],
            mainSkills: [],
          },
          personal: {},
          profiles: {},
        },
      },
    ];

    const { result } = renderHook(() => useTableSort(profilesWithMixedCase));

    // Should sort case-insensitively: alice, Bob, CHARLIE
    expect(result.current.sortedProfiles[0].profile.core.name).toBe('alice');
    expect(result.current.sortedProfiles[1].profile.core.name).toBe('Bob');
    expect(result.current.sortedProfiles[2].profile.core.name).toBe('CHARLIE');

    // Test title sorting too
    act(() => {
      result.current.handleSort('title', 'asc');
    });

    // Should be: DESIGNER, engineer, Manager
    expect(result.current.sortedProfiles[0].profile.core.mainTitle).toBe('DESIGNER');
    expect(result.current.sortedProfiles[1].profile.core.mainTitle).toBe('engineer');
    expect(result.current.sortedProfiles[2].profile.core.mainTitle).toBe('Manager');
  });

  it('provides stable sort for equal values', () => {
    const profilesWithSameValues: ProfileListItem[] = [
      {
        id: 'user1',
        profile: {
          core: {
            name: 'Same Name',
            mainTitle: 'Same Title',
            teamIds: ['team1'],
            mainSkills: ['skill1'],
          },
          personal: {},
          profiles: {},
        },
      },
      {
        id: 'user2',
        profile: {
          core: {
            name: 'Same Name',
            mainTitle: 'Same Title',
            teamIds: ['team1'],
            mainSkills: ['skill2'],
          },
          personal: {},
          profiles: {},
        },
      },
    ];

    const { result } = renderHook(() => useTableSort(profilesWithSameValues));

    const initialOrder = result.current.sortedProfiles.map(p => p.id);

    // Sort by name (should maintain order since names are same)
    act(() => {
      result.current.handleSort('name', 'desc');
    });

    const afterSortOrder = result.current.sortedProfiles.map(p => p.id);
    
    // Order should be consistent (stable sort)
    expect(afterSortOrder).toEqual(initialOrder);
  });
});