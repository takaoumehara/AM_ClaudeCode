import {
  createUserProfile,
  getUserProfile,
  updateUserCore,
  uploadProfilePhoto,
  deleteProfilePhoto,
  getSkills,
  searchSkills,
  createSkill,
  type UserProfile,
  type Skill
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
  getDocs: jest.fn(),
}));

jest.mock('firebase/storage', () => ({
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
  deleteObject: jest.fn(),
}));

import { doc, getDoc, setDoc, updateDoc, collection, query, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const mockDoc = doc as jest.MockedFunction<typeof doc>;
const mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>;
const mockSetDoc = setDoc as jest.MockedFunction<typeof setDoc>;
const mockUpdateDoc = updateDoc as jest.MockedFunction<typeof updateDoc>;
const mockCollection = collection as jest.MockedFunction<typeof collection>;
const mockQuery = query as jest.MockedFunction<typeof query>;
const mockGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;

const mockRef = ref as jest.MockedFunction<typeof ref>;
const mockUploadBytes = uploadBytes as jest.MockedFunction<typeof uploadBytes>;
const mockGetDownloadURL = getDownloadURL as jest.MockedFunction<typeof getDownloadURL>;
const mockDeleteObject = deleteObject as jest.MockedFunction<typeof deleteObject>;

describe('Profile Firebase Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createUserProfile', () => {
    it('creates new profile when user does not exist', async () => {
      const userId = 'test-user-id';
      const profileData = {
        core: {
          name: 'John Doe',
          mainTitle: 'Developer',
          mainSkills: ['JavaScript'],
          teamIds: [],
          photoUrl: '',
        },
      };

      const mockDocRef = { id: userId };
      const mockDocSnap = { exists: () => false };

      mockDoc.mockReturnValue(mockDocRef as any);
      mockGetDoc.mockResolvedValue(mockDocSnap as any);
      mockSetDoc.mockResolvedValue(undefined);

      await createUserProfile(userId, profileData);

      expect(mockSetDoc).toHaveBeenCalledWith(mockDocRef, {
        core: profileData.core,
        personal: {},
        profiles: {},
      });
    });

    it('updates existing profile when user exists', async () => {
      const userId = 'test-user-id';
      const profileData = {
        core: {
          name: 'John Doe Updated',
          mainTitle: 'Senior Developer',
          mainSkills: ['JavaScript', 'TypeScript'],
          teamIds: [],
          photoUrl: '',
        },
      };

      const mockDocRef = { id: userId };
      const mockDocSnap = { exists: () => true };

      mockDoc.mockReturnValue(mockDocRef as any);
      mockGetDoc.mockResolvedValue(mockDocSnap as any);
      mockUpdateDoc.mockResolvedValue(undefined);

      await createUserProfile(userId, profileData);

      expect(mockUpdateDoc).toHaveBeenCalledWith(mockDocRef, profileData);
    });

    it('throws error on failure', async () => {
      const userId = 'test-user-id';
      const profileData = { core: { name: 'Test', mainTitle: '', mainSkills: [], teamIds: [], photoUrl: '' } };

      mockDoc.mockReturnValue({} as any);
      mockGetDoc.mockRejectedValue(new Error('Firestore error'));

      await expect(createUserProfile(userId, profileData)).rejects.toThrow('Failed to save profile');
    });
  });

  describe('getUserProfile', () => {
    it('returns user profile when it exists', async () => {
      const userId = 'test-user-id';
      const mockProfile: UserProfile = {
        core: {
          name: 'John Doe',
          mainTitle: 'Developer',
          mainSkills: ['JavaScript'],
          teamIds: [],
          photoUrl: '',
        },
        personal: {},
        profiles: {},
      };

      const mockDocRef = { id: userId };
      const mockDocSnap = {
        exists: () => true,
        data: () => mockProfile,
      };

      mockDoc.mockReturnValue(mockDocRef as any);
      mockGetDoc.mockResolvedValue(mockDocSnap as any);

      const result = await getUserProfile(userId);

      expect(result).toEqual(mockProfile);
    });

    it('returns null when profile does not exist', async () => {
      const userId = 'test-user-id';

      const mockDocRef = { id: userId };
      const mockDocSnap = { exists: () => false };

      mockDoc.mockReturnValue(mockDocRef as any);
      mockGetDoc.mockResolvedValue(mockDocSnap as any);

      const result = await getUserProfile(userId);

      expect(result).toBeNull();
    });

    it('throws error on failure', async () => {
      const userId = 'test-user-id';

      mockDoc.mockReturnValue({} as any);
      mockGetDoc.mockRejectedValue(new Error('Firestore error'));

      await expect(getUserProfile(userId)).rejects.toThrow('Failed to fetch profile');
    });
  });

  describe('updateUserCore', () => {
    it('updates user core data successfully', async () => {
      const userId = 'test-user-id';
      const coreData = {
        name: 'Jane Doe',
        mainTitle: 'Product Manager',
      };

      const mockDocRef = { id: userId };
      mockDoc.mockReturnValue(mockDocRef as any);
      mockUpdateDoc.mockResolvedValue(undefined);

      await updateUserCore(userId, coreData);

      expect(mockUpdateDoc).toHaveBeenCalledWith(mockDocRef, {
        core: coreData,
      });
    });

    it('throws error on failure', async () => {
      const userId = 'test-user-id';
      const coreData = { name: 'Test' };

      mockDoc.mockReturnValue({} as any);
      mockUpdateDoc.mockRejectedValue(new Error('Firestore error'));

      await expect(updateUserCore(userId, coreData)).rejects.toThrow('Failed to update profile');
    });
  });

  describe('uploadProfilePhoto', () => {
    it('uploads photo and updates profile successfully', async () => {
      const userId = 'test-user-id';
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const downloadURL = 'http://example.com/photo.jpg';

      const mockStorageRef = { path: `profiles/${userId}/photo` };
      const mockSnapshot = { ref: mockStorageRef };
      const mockDocRef = { id: userId };

      mockRef.mockReturnValue(mockStorageRef as any);
      mockUploadBytes.mockResolvedValue(mockSnapshot as any);
      mockGetDownloadURL.mockResolvedValue(downloadURL);
      mockDoc.mockReturnValue(mockDocRef as any);
      mockUpdateDoc.mockResolvedValue(undefined);

      const result = await uploadProfilePhoto(userId, file);

      expect(mockUploadBytes).toHaveBeenCalledWith(mockStorageRef, file);
      expect(mockGetDownloadURL).toHaveBeenCalledWith(mockStorageRef);
      expect(mockUpdateDoc).toHaveBeenCalledWith(mockDocRef, {
        core: { photoUrl: downloadURL },
      });
      expect(result).toBe(downloadURL);
    });

    it('throws error on failure', async () => {
      const userId = 'test-user-id';
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      mockRef.mockReturnValue({} as any);
      mockUploadBytes.mockRejectedValue(new Error('Storage error'));

      await expect(uploadProfilePhoto(userId, file)).rejects.toThrow('Failed to upload photo');
    });
  });

  describe('deleteProfilePhoto', () => {
    it('deletes photo and updates profile successfully', async () => {
      const userId = 'test-user-id';

      const mockStorageRef = { path: `profiles/${userId}/photo` };
      const mockDocRef = { id: userId };

      mockRef.mockReturnValue(mockStorageRef as any);
      mockDeleteObject.mockResolvedValue(undefined);
      mockDoc.mockReturnValue(mockDocRef as any);
      mockUpdateDoc.mockResolvedValue(undefined);

      await deleteProfilePhoto(userId);

      expect(mockDeleteObject).toHaveBeenCalledWith(mockStorageRef);
      expect(mockUpdateDoc).toHaveBeenCalledWith(mockDocRef, {
        core: { photoUrl: '' },
      });
    });

    it('throws error on failure', async () => {
      const userId = 'test-user-id';

      mockRef.mockReturnValue({} as any);
      mockDeleteObject.mockRejectedValue(new Error('Storage error'));

      await expect(deleteProfilePhoto(userId)).rejects.toThrow('Failed to delete photo');
    });
  });

  describe('getSkills', () => {
    it('returns all skills successfully', async () => {
      const mockSkills: Skill[] = [
        { id: '1', name: 'JavaScript', synonyms: ['JS'], orgIds: [] },
        { id: '2', name: 'TypeScript', synonyms: ['TS'], orgIds: [] },
      ];

      const mockQuerySnapshot = {
        docs: mockSkills.map(skill => ({
          id: skill.id,
          data: () => ({ name: skill.name, synonyms: skill.synonyms, orgIds: skill.orgIds }),
        })),
      };

      mockCollection.mockReturnValue({} as any);
      mockQuery.mockReturnValue({} as any);
      mockGetDocs.mockResolvedValue(mockQuerySnapshot as any);

      const result = await getSkills();

      expect(result).toEqual(mockSkills);
    });

    it('throws error on failure', async () => {
      mockCollection.mockReturnValue({} as any);
      mockQuery.mockReturnValue({} as any);
      mockGetDocs.mockRejectedValue(new Error('Firestore error'));

      await expect(getSkills()).rejects.toThrow('Failed to fetch skills');
    });
  });

  describe('searchSkills', () => {
    it('searches skills by name successfully', async () => {
      const mockSkills: Skill[] = [
        { id: '1', name: 'JavaScript', synonyms: ['JS'], orgIds: [] },
        { id: '2', name: 'TypeScript', synonyms: ['TS'], orgIds: [] },
        { id: '3', name: 'Python', synonyms: [], orgIds: [] },
      ];

      // Mock getSkills to return all skills
      const originalGetSkills = require('./profiles').getSkills;
      jest.spyOn(require('./profiles'), 'getSkills').mockResolvedValue(mockSkills);

      const result = await searchSkills('script');

      expect(result).toEqual([
        { id: '1', name: 'JavaScript', synonyms: ['JS'], orgIds: [] },
        { id: '2', name: 'TypeScript', synonyms: ['TS'], orgIds: [] },
      ]);

      // Restore original function
      require('./profiles').getSkills.mockRestore();
    });

    it('searches skills by synonym successfully', async () => {
      const mockSkills: Skill[] = [
        { id: '1', name: 'JavaScript', synonyms: ['JS'], orgIds: [] },
        { id: '2', name: 'TypeScript', synonyms: ['TS'], orgIds: [] },
      ];

      jest.spyOn(require('./profiles'), 'getSkills').mockResolvedValue(mockSkills);

      const result = await searchSkills('js');

      expect(result).toEqual([
        { id: '1', name: 'JavaScript', synonyms: ['JS'], orgIds: [] },
      ]);

      require('./profiles').getSkills.mockRestore();
    });

    it('throws error on failure', async () => {
      jest.spyOn(require('./profiles'), 'getSkills').mockRejectedValue(new Error('Skills error'));

      await expect(searchSkills('test')).rejects.toThrow('Failed to search skills');

      require('./profiles').getSkills.mockRestore();
    });
  });

  describe('createSkill', () => {
    it('creates skill successfully', async () => {
      const skillData = {
        name: 'New Skill',
        synonyms: ['NS'],
        orgIds: ['org1'],
      };

      const mockDocRef = { id: 'new-skill-id' };
      mockCollection.mockReturnValue({} as any);
      mockDoc.mockReturnValue(mockDocRef as any);
      mockSetDoc.mockResolvedValue(undefined);

      const result = await createSkill(skillData);

      expect(mockSetDoc).toHaveBeenCalledWith(mockDocRef, skillData);
      expect(result).toBe('new-skill-id');
    });

    it('throws error on failure', async () => {
      const skillData = {
        name: 'New Skill',
        synonyms: [],
        orgIds: [],
      };

      mockCollection.mockReturnValue({} as any);
      mockDoc.mockReturnValue({} as any);
      mockSetDoc.mockRejectedValue(new Error('Firestore error'));

      await expect(createSkill(skillData)).rejects.toThrow('Failed to create skill');
    });
  });
});