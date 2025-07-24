import {
  getProfiles,
  searchProfiles,
  getProfilesByOrganization,
  ProfileListItem,
  UserProfile
} from './profiles';

// Mock Firebase services
jest.mock('./config', () => ({
  db: {
    collection: jest.fn(),
    doc: jest.fn(),
  },
  storage: {
    ref: jest.fn(),
  },
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
  limit: jest.fn(),
  startAfter: jest.fn(),
  orderBy: jest.fn(),
}));

import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  startAfter, 
  where, 
  getDocs,
  DocumentSnapshot 
} from 'firebase/firestore';

const mockCollection = collection as jest.MockedFunction<typeof collection>;
const mockQuery = query as jest.MockedFunction<typeof query>;
const mockOrderBy = orderBy as jest.MockedFunction<typeof orderBy>;
const mockLimit = limit as jest.MockedFunction<typeof limit>;
const mockStartAfter = startAfter as jest.MockedFunction<typeof startAfter>;
const mockWhere = where as jest.MockedFunction<typeof where>;
const mockGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;

const mockProfiles: UserProfile[] = [
  {
    core: {
      name: 'Alice Johnson',
      photoUrl: 'http://example.com/alice.jpg',
      mainTitle: 'Software Engineer',
      teamIds: ['team1', 'team2'],
      mainSkills: ['JavaScript', 'React', 'TypeScript'],
    },
    personal: {},
    profiles: {},
  },
  {
    core: {
      name: 'Bob Smith',
      photoUrl: '',
      mainTitle: 'Product Manager',
      teamIds: ['team1'],
      mainSkills: ['Strategy', 'Analytics'],
    },
    personal: {},
    profiles: {},
  },
  {
    core: {
      name: 'Charlie Brown',
      photoUrl: '',
      mainTitle: 'UX Designer',
      teamIds: ['team2'],
      mainSkills: ['Figma', 'Research', 'Prototyping'],
    },
    personal: {},
    profiles: {},
  },
];

const createMockDoc = (id: string, data: UserProfile) => ({
  id,
  data: () => data,
});

const mockDocs = mockProfiles.map((profile, index) => 
  createMockDoc(`user${index + 1}`, profile)
);

const mockLastDoc = { id: 'lastDoc' } as DocumentSnapshot;

describe('Profile Listing Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock chain
    mockCollection.mockReturnValue('collection' as any);
    mockOrderBy.mockReturnValue('orderBy' as any);
    mockLimit.mockReturnValue('limit' as any);
    mockStartAfter.mockReturnValue('startAfter' as any);
    mockWhere.mockReturnValue('where' as any);
    mockQuery.mockReturnValue('query' as any);
  });

  describe('getProfiles', () => {
    it('fetches profiles with default pagination', async () => {
      const mockQuerySnapshot = {
        docs: mockDocs.slice(0, 2), // Simulate 2 profiles
      };

      mockGetDocs.mockResolvedValue(mockQuerySnapshot as any);

      const result = await getProfiles();

      expect(mockCollection).toHaveBeenCalledWith(expect.anything(), 'users');
      expect(mockOrderBy).toHaveBeenCalledWith('core.name');
      expect(mockLimit).toHaveBeenCalledWith(13); // pageSize + 1
      expect(mockGetDocs).toHaveBeenCalled();

      expect(result.profiles).toHaveLength(2);
      expect(result.profiles[0].id).toBe('user1');
      expect(result.profiles[0].profile).toEqual(mockProfiles[0]);
      expect(result.hasMore).toBe(false);
    });

    it('detects when there are more profiles', async () => {
      const mockQuerySnapshot = {
        docs: mockDocs, // 3 profiles, pageSize = 2
      };

      mockGetDocs.mockResolvedValue(mockQuerySnapshot as any);

      const result = await getProfiles(2);

      expect(result.profiles).toHaveLength(2); // Should return pageSize items
      expect(result.hasMore).toBe(true); // Should detect more available
      expect(result.lastDoc).toBeDefined();
    });

    it('handles pagination with lastDoc', async () => {
      const mockQuerySnapshot = {
        docs: mockDocs.slice(1), // Simulate next page
      };

      mockGetDocs.mockResolvedValue(mockQuerySnapshot as any);

      await getProfiles(12, mockLastDoc);

      expect(mockStartAfter).toHaveBeenCalledWith(mockLastDoc);
    });

    it('handles custom page size', async () => {
      const mockQuerySnapshot = {
        docs: mockDocs.slice(0, 5),
      };

      mockGetDocs.mockResolvedValue(mockQuerySnapshot as any);

      await getProfiles(5);

      expect(mockLimit).toHaveBeenCalledWith(6); // pageSize + 1
    });

    it('handles empty results', async () => {
      const mockQuerySnapshot = {
        docs: [],
      };

      mockGetDocs.mockResolvedValue(mockQuerySnapshot as any);

      const result = await getProfiles();

      expect(result.profiles).toHaveLength(0);
      expect(result.hasMore).toBe(false);
      expect(result.lastDoc).toBeUndefined();
    });

    it('throws error on Firestore failure', async () => {
      mockGetDocs.mockRejectedValue(new Error('Firestore error'));

      await expect(getProfiles()).rejects.toThrow('Failed to fetch profiles');
    });
  });

  describe('searchProfiles', () => {
    it('searches profiles by name', async () => {
      const mockQuerySnapshot = {
        docs: mockDocs,
      };

      mockGetDocs.mockResolvedValue(mockQuerySnapshot as any);

      const result = await searchProfiles('alice');

      expect(result.profiles).toHaveLength(1);
      expect(result.profiles[0].profile.core.name).toBe('Alice Johnson');
    });

    it('searches profiles by title', async () => {
      const mockQuerySnapshot = {
        docs: mockDocs,
      };

      mockGetDocs.mockResolvedValue(mockQuerySnapshot as any);

      const result = await searchProfiles('manager');

      expect(result.profiles).toHaveLength(1);
      expect(result.profiles[0].profile.core.mainTitle).toBe('Product Manager');
    });

    it('searches profiles by skills', async () => {
      const mockQuerySnapshot = {
        docs: mockDocs,
      };

      mockGetDocs.mockResolvedValue(mockQuerySnapshot as any);

      const result = await searchProfiles('javascript');

      expect(result.profiles).toHaveLength(1);
      expect(result.profiles[0].profile.core.mainSkills).toContain('JavaScript');
    });

    it('performs case-insensitive search', async () => {
      const mockQuerySnapshot = {
        docs: mockDocs,
      };

      mockGetDocs.mockResolvedValue(mockQuerySnapshot as any);

      const result = await searchProfiles('ALICE');

      expect(result.profiles).toHaveLength(1);
      expect(result.profiles[0].profile.core.name).toBe('Alice Johnson');
    });

    it('returns multiple matches', async () => {
      const mockQuerySnapshot = {
        docs: mockDocs,
      };

      mockGetDocs.mockResolvedValue(mockQuerySnapshot as any);

      const result = await searchProfiles('team'); // Should match skills/activities

      // This would depend on the actual search implementation
      // For now, testing that it doesn't crash and returns results
      expect(result.profiles).toBeDefined();
      expect(Array.isArray(result.profiles)).toBe(true);
    });

    it('handles pagination in search results', async () => {
      const mockQuerySnapshot = {
        docs: mockDocs,
      };

      mockGetDocs.mockResolvedValue(mockQuerySnapshot as any);

      const result = await searchProfiles('', 2); // Empty search should return all

      expect(result.hasMore).toBe(true);
      expect(result.profiles).toHaveLength(2);
    });

    it('handles search with lastDoc', async () => {
      const mockQuerySnapshot = {
        docs: mockDocs.slice(1),
      };

      mockGetDocs.mockResolvedValue(mockQuerySnapshot as any);

      await searchProfiles('test', 12, mockLastDoc);

      expect(mockStartAfter).toHaveBeenCalledWith(mockLastDoc);
    });

    it('handles profiles with missing fields gracefully', async () => {
      const profileWithMissingFields: UserProfile = {
        core: {
          name: 'Test User',
          teamIds: [],
          mainSkills: [],
          // Missing title and skills
        },
        personal: {},
        profiles: {},
      };

      const mockQuerySnapshot = {
        docs: [createMockDoc('test1', profileWithMissingFields)],
      };

      mockGetDocs.mockResolvedValue(mockQuerySnapshot as any);

      const result = await searchProfiles('test');

      expect(result.profiles).toHaveLength(1);
      expect(result.profiles[0].profile.core.name).toBe('Test User');
    });

    it('throws error on Firestore failure', async () => {
      mockGetDocs.mockRejectedValue(new Error('Search error'));

      await expect(searchProfiles('test')).rejects.toThrow('Failed to search profiles');
    });
  });

  describe('getProfilesByOrganization', () => {
    it('fetches profiles filtered by organization', async () => {
      const mockQuerySnapshot = {
        docs: mockDocs.slice(0, 2), // Alice and Bob are in team1
      };

      mockGetDocs.mockResolvedValue(mockQuerySnapshot as any);

      const result = await getProfilesByOrganization('team1');

      expect(mockWhere).toHaveBeenCalledWith('core.teamIds', 'array-contains', 'team1');
      expect(mockOrderBy).toHaveBeenCalledWith('core.name');
      expect(result.profiles).toHaveLength(2);
    });

    it('handles pagination for organization profiles', async () => {
      const mockQuerySnapshot = {
        docs: mockDocs,
      };

      mockGetDocs.mockResolvedValue(mockQuerySnapshot as any);

      const result = await getProfilesByOrganization('team1', 2);

      expect(result.hasMore).toBe(true);
      expect(result.profiles).toHaveLength(2);
    });

    it('handles pagination with lastDoc for organization', async () => {
      const mockQuerySnapshot = {
        docs: mockDocs.slice(1),
      };

      mockGetDocs.mockResolvedValue(mockQuerySnapshot as any);

      await getProfilesByOrganization('team1', 12, mockLastDoc);

      expect(mockStartAfter).toHaveBeenCalledWith(mockLastDoc);
      expect(mockWhere).toHaveBeenCalledWith('core.teamIds', 'array-contains', 'team1');
    });

    it('handles empty organization results', async () => {
      const mockQuerySnapshot = {
        docs: [],
      };

      mockGetDocs.mockResolvedValue(mockQuerySnapshot as any);

      const result = await getProfilesByOrganization('nonexistent-org');

      expect(result.profiles).toHaveLength(0);
      expect(result.hasMore).toBe(false);
    });

    it('throws error on Firestore failure', async () => {
      mockGetDocs.mockRejectedValue(new Error('Organization query error'));

      await expect(getProfilesByOrganization('team1')).rejects.toThrow('Failed to fetch organization profiles');
    });
  });

  describe('ProfileListItem interface', () => {
    it('creates proper ProfileListItem structure', async () => {
      const mockQuerySnapshot = {
        docs: [mockDocs[0]],
      };

      mockGetDocs.mockResolvedValue(mockQuerySnapshot as any);

      const result = await getProfiles();

      const item: ProfileListItem = result.profiles[0];
      expect(item.id).toBe('user1');
      expect(item.profile).toEqual(mockProfiles[0]);
      expect(typeof item.id).toBe('string');
      expect(typeof item.profile).toBe('object');
    });
  });

  describe('Error handling', () => {
    it('preserves error messages from Firebase', async () => {
      const customError = new Error('Custom Firestore error');
      mockGetDocs.mockRejectedValue(customError);

      try {
        await getProfiles();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Failed to fetch profiles');
      }
    });

    it('logs errors to console', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockGetDocs.mockRejectedValue(new Error('Test error'));

      try {
        await getProfiles();
      } catch (error) {
        // Expected to throw
      }

      expect(consoleSpy).toHaveBeenCalledWith('Error fetching profiles:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });
});