import { renderHook, act, waitFor } from '@testing-library/react';
import { useProfiles } from './useProfiles';
import * as profilesUtils from '@/lib/firebase/profiles';
import { DocumentSnapshot } from 'firebase/firestore';

// Mock Firebase utilities
jest.mock('@/lib/firebase/profiles', () => ({
  getProfiles: jest.fn(),
  searchProfiles: jest.fn(),
  getProfilesByOrganization: jest.fn(),
}));

const mockGetProfiles = profilesUtils.getProfiles as jest.MockedFunction<typeof profilesUtils.getProfiles>;
const mockSearchProfiles = profilesUtils.searchProfiles as jest.MockedFunction<typeof profilesUtils.searchProfiles>;
const mockGetProfilesByOrganization = profilesUtils.getProfilesByOrganization as jest.MockedFunction<typeof profilesUtils.getProfilesByOrganization>;

const mockProfiles = [
  {
    id: 'user1',
    profile: {
      core: {
        name: 'John Doe',
        photoUrl: '',
        mainTitle: 'Developer',
        teamIds: ['team1'],
        mainSkills: ['JavaScript'],
      },
      personal: {},
      profiles: {},
    },
  },
  {
    id: 'user2',
    profile: {
      core: {
        name: 'Jane Smith',
        photoUrl: '',
        mainTitle: 'Designer',
        teamIds: ['team1'],
        mainSkills: ['Figma'],
      },
      personal: {},
      profiles: {},
    },
  },
];

const mockLastDoc = { id: 'doc123' } as DocumentSnapshot;

const mockResult = {
  profiles: mockProfiles,
  hasMore: true,
  lastDoc: mockLastDoc,
};

describe('useProfiles', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads profiles on mount by default', async () => {
    mockGetProfiles.mockResolvedValue(mockResult);

    const { result } = renderHook(() => useProfiles());

    expect(result.current.loading).toBe(true);
    expect(mockGetProfiles).toHaveBeenCalledWith(12, undefined);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.profiles).toEqual(mockProfiles);
    expect(result.current.hasMore).toBe(true);
    expect(result.current.error).toBe(null);
  });

  it('does not auto-load when autoLoad is false', () => {
    const { result } = renderHook(() => useProfiles({ autoLoad: false }));

    expect(result.current.loading).toBe(false);
    expect(mockGetProfiles).not.toHaveBeenCalled();
    expect(result.current.profiles).toEqual([]);
  });

  it('uses custom page size', async () => {
    mockGetProfiles.mockResolvedValue(mockResult);

    renderHook(() => useProfiles({ pageSize: 24 }));

    await waitFor(() => {
      expect(mockGetProfiles).toHaveBeenCalledWith(24, undefined);
    });
  });

  it('searches profiles when searchTerm is provided', async () => {
    mockSearchProfiles.mockResolvedValue(mockResult);

    renderHook(() => useProfiles({ searchTerm: 'John' }));

    await waitFor(() => {
      expect(mockSearchProfiles).toHaveBeenCalledWith('John', 12, undefined);
    });
    
    expect(mockGetProfiles).not.toHaveBeenCalled();
  });

  it('filters by organization when organizationId is provided', async () => {
    mockGetProfilesByOrganization.mockResolvedValue(mockResult);

    renderHook(() => useProfiles({ organizationId: 'org123' }));

    await waitFor(() => {
      expect(mockGetProfilesByOrganization).toHaveBeenCalledWith('org123', 12, undefined);
    });
    
    expect(mockGetProfiles).not.to

called();
  });

  it('prioritizes search over organization filter', async () => {
    mockSearchProfiles.mockResolvedValue(mockResult);

    renderHook(() => useProfiles({ 
      searchTerm: 'John', 
      organizationId: 'org123' 
    }));

    await waitFor(() => {
      expect(mockSearchProfiles).toHaveBeenCalledWith('John', 12, undefined);
    });
    
    expect(mockGetProfilesByOrganization).not.toHaveBeenCalled();
    expect(mockGetProfiles).not.toHaveBeenCalled();
  });

  it('trims search term before searching', async () => {
    mockSearchProfiles.mockResolvedValue(mockResult);

    renderHook(() => useProfiles({ searchTerm: '  John  ' }));

    await waitFor(() => {
      expect(mockSearchProfiles).toHaveBeenCalledWith('John', 12, undefined);
    });
  });

  it('falls back to getProfiles when search term is only whitespace', async () => {
    mockGetProfiles.mockResolvedValue(mockResult);

    renderHook(() => useProfiles({ searchTerm: '   ' }));

    await waitFor(() => {
      expect(mockGetProfiles).toHaveBeenCalledWith(12, undefined);
    });
    
    expect(mockSearchProfiles).not.toHaveBeenCalled();
  });

  it('handles loading more profiles', async () => {
    mockGetProfiles.mockResolvedValue(mockResult);

    const { result } = renderHook(() => useProfiles());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Mock additional profiles for load more
    const additionalProfiles = [
      {
        id: 'user3',
        profile: {
          core: {
            name: 'Bob Johnson',
            photoUrl: '',
            mainTitle: 'Manager',
            teamIds: ['team2'],
            mainSkills: ['Leadership'],
          },
          personal: {},
          profiles: {},
        },
      },
    ];

    const loadMoreResult = {
      profiles: additionalProfiles,
      hasMore: false,
      lastDoc: undefined,
    };

    mockGetProfiles.mockResolvedValue(loadMoreResult);

    act(() => {
      result.current.loadMore();
    });

    expect(result.current.loadingMore).toBe(true);
    expect(mockGetProfiles).toHaveBeenCalledWith(12, mockLastDoc);

    await waitFor(() => {
      expect(result.current.loadingMore).toBe(false);
    });

    expect(result.current.profiles).toEqual([...mockProfiles, ...additionalProfiles]);
    expect(result.current.hasMore).toBe(false);
  });

  it('prevents multiple simultaneous load more requests', async () => {
    mockGetProfiles.mockResolvedValue(mockResult);

    const { result } = renderHook(() => useProfiles());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Start first load more
    act(() => {
      result.current.loadMore();
    });

    expect(result.current.loadingMore).toBe(true);

    // Try to start second load more while first is in progress
    act(() => {
      result.current.loadMore();
    });

    // Should only be called once for the first request
    expect(mockGetProfiles).toHaveBeenCalledTimes(2); // Initial load + first loadMore
  });

  it('does not load more when hasMore is false', async () => {
    const resultWithoutMore = { ...mockResult, hasMore: false };
    mockGetProfiles.mockResolvedValue(resultWithoutMore);

    const { result } = renderHook(() => useProfiles());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    mockGetProfiles.mockClear();

    act(() => {
      result.current.loadMore();
    });

    expect(mockGetProfiles).not.toHaveBeenCalled();
    expect(result.current.loadingMore).toBe(false);
  });

  it('handles refresh correctly', async () => {
    mockGetProfiles.mockResolvedValue(mockResult);

    const { result } = renderHook(() => useProfiles());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    mockGetProfiles.mockClear();

    act(() => {
      result.current.refresh();
    });

    expect(result.current.loading).toBe(true);
    expect(mockGetProfiles).toHaveBeenCalledWith(12, undefined); // Should reset lastDoc

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('handles errors correctly', async () => {
    const errorMessage = 'Failed to load profiles';
    mockGetProfiles.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useProfiles());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.profiles).toEqual([]);
    expect(result.current.hasMore).toBe(false);
  });

  it('handles non-Error exceptions', async () => {
    mockGetProfiles.mockRejectedValue('String error');

    const { result } = renderHook(() => useProfiles());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to load profiles');
  });

  it('handles load more errors without affecting existing profiles', async () => {
    mockGetProfiles.mockResolvedValue(mockResult);

    const { result } = renderHook(() => useProfiles());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Mock error for load more
    mockGetProfiles.mockRejectedValue(new Error('Load more failed'));

    act(() => {
      result.current.loadMore();
    });

    await waitFor(() => {
      expect(result.current.loadingMore).toBe(false);
    });

    // Should keep existing profiles and not set error for load more failures
    expect(result.current.profiles).toEqual(mockProfiles);
    expect(result.current.error).toBe(null);
  });

  it('reloads when dependencies change', async () => {
    mockGetProfiles.mockResolvedValue(mockResult);

    const { result, rerender } = renderHook(
      ({ searchTerm }) => useProfiles({ searchTerm }),
      { initialProps: { searchTerm: '' } }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockGetProfiles).toHaveBeenCalledTimes(1);

    // Change search term
    mockSearchProfiles.mockResolvedValue(mockResult);
    rerender({ searchTerm: 'new search' });

    await waitFor(() => {
      expect(mockSearchProfiles).toHaveBeenCalledWith('new search', 12, undefined);
    });
  });

  it('clears error on successful reload', async () => {
    // First call fails
    mockGetProfiles.mockRejectedValue(new Error('Initial error'));

    const { result } = renderHook(() => useProfiles());

    await waitFor(() => {
      expect(result.current.error).toBe('Initial error');
    });

    // Refresh succeeds
    mockGetProfiles.mockResolvedValue(mockResult);

    act(() => {
      result.current.refresh();
    });

    expect(result.current.error).toBe(null); // Error should be cleared immediately

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.profiles).toEqual(mockProfiles);
  });
});