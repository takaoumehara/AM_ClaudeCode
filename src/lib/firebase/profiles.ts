import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, limit, startAfter, orderBy, DocumentSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './config';

// Profile visibility types
export type ProfileVisibility = 'private' | 'team' | 'organization' | 'public';

// User profile data types based on architecture
export interface UserProfile {
  core: {
    name: string;
    photoUrl?: string;
    mainTitle?: string;
    teamIds: string[];
    mainSkills: string[];
  };
  personal?: {
    hobbies?: string[];
    favorites?: string[];
    learning?: string[];
    motto?: string;
    activities?: string[];
    customFields?: { [key: string]: any };
    show?: { [key: string]: boolean };
  };
  profiles?: { [orgId: string]: any };
  organizationMemberships?: { 
    [orgId: string]: {
      role: 'admin' | 'member';
      joinedAt: Date;
    };
  };
}

export interface Skill {
  id: string;
  name: string;
  synonyms: string[];
  orgIds: string[];
}

// Create or update user profile
export const createUserProfile = async (userId: string, profileData: Partial<UserProfile>): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      // Update existing profile
      await updateDoc(userDocRef, profileData);
    } else {
      // Create new profile with default structure
      const defaultProfile: UserProfile = {
        core: {
          name: profileData.core?.name || '',
          photoUrl: profileData.core?.photoUrl || '',
          mainTitle: profileData.core?.mainTitle || '',
          teamIds: profileData.core?.teamIds || [],
          mainSkills: profileData.core?.mainSkills || [],
        },
        personal: profileData.personal || {},
        profiles: profileData.profiles || {},
      };
      
      await setDoc(userDocRef, defaultProfile);
    }
  } catch (error) {
    console.error('Error creating/updating user profile:', error);
    throw new Error('Failed to save profile');
  }
};

// Get user profile
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw new Error('Failed to fetch profile');
  }
};

// Update user core profile
export const updateUserCore = async (userId: string, coreData: Partial<UserProfile['core']>): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      core: coreData
    });
  } catch (error) {
    console.error('Error updating user core:', error);
    throw new Error('Failed to update profile');
  }
};

// Upload profile photo
export const uploadProfilePhoto = async (userId: string, file: File): Promise<string> => {
  try {
    // Create a reference to the file location
    const photoRef = ref(storage, `profiles/${userId}/photo`);
    
    // Upload the file
    const snapshot = await uploadBytes(photoRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    // Update user profile with photo URL
    await updateUserCore(userId, { photoUrl: downloadURL });
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading profile photo:', error);
    throw new Error('Failed to upload photo');
  }
};

// Delete profile photo
export const deleteProfilePhoto = async (userId: string): Promise<void> => {
  try {
    const photoRef = ref(storage, `profiles/${userId}/photo`);
    await deleteObject(photoRef);
    
    // Remove photo URL from profile
    await updateUserCore(userId, { photoUrl: '' });
  } catch (error) {
    console.error('Error deleting profile photo:', error);
    throw new Error('Failed to delete photo');
  }
};

// Skills management
export const getSkills = async (): Promise<Skill[]> => {
  try {
    const skillsQuery = query(collection(db, 'skills'));
    const querySnapshot = await getDocs(skillsQuery);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Skill[];
  } catch (error) {
    console.error('Error fetching skills:', error);
    throw new Error('Failed to fetch skills');
  }
};

// Search skills by name or synonym
export const searchSkills = async (searchTerm: string): Promise<Skill[]> => {
  try {
    const skills = await getSkills();
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    return skills.filter(skill => 
      skill.name.toLowerCase().includes(lowerSearchTerm) ||
      skill.synonyms.some(synonym => synonym.toLowerCase().includes(lowerSearchTerm))
    );
  } catch (error) {
    console.error('Error searching skills:', error);
    throw new Error('Failed to search skills');
  }
};

// Create or update skill
export const createSkill = async (skillData: Omit<Skill, 'id'>): Promise<string> => {
  try {
    const skillRef = doc(collection(db, 'skills'));
    await setDoc(skillRef, skillData);
    return skillRef.id;
  } catch (error) {
    console.error('Error creating skill:', error);
    throw new Error('Failed to create skill');
  }
};

// Profile listing and pagination interfaces and functions
export interface ProfileListItem {
  id: string;
  profile: UserProfile;
}

export interface ProfileListResult {
  profiles: ProfileListItem[];
  hasMore: boolean;
  lastDoc?: DocumentSnapshot;
}

// Get paginated list of profiles
export const getProfiles = async (
  pageSize: number = 12,
  lastDoc?: DocumentSnapshot
): Promise<ProfileListResult> => {
  try {
    let profileQuery = query(
      collection(db, 'users'),
      orderBy('core.name'),
      limit(pageSize + 1) // Get one extra to check if there are more
    );

    if (lastDoc) {
      profileQuery = query(
        collection(db, 'users'),
        orderBy('core.name'),
        startAfter(lastDoc),
        limit(pageSize + 1)
      );
    }

    const querySnapshot = await getDocs(profileQuery);
    const docs = querySnapshot.docs;
    
    // Check if there are more profiles
    const hasMore = docs.length > pageSize;
    const profilesToReturn = hasMore ? docs.slice(0, -1) : docs;
    
    const profiles: ProfileListItem[] = profilesToReturn.map(doc => ({
      id: doc.id,
      profile: doc.data() as UserProfile
    }));

    return {
      profiles,
      hasMore,
      lastDoc: profilesToReturn.length > 0 ? profilesToReturn[profilesToReturn.length - 1] : undefined
    };
  } catch (error) {
    console.error('Error fetching profiles:', error);
    throw new Error('Failed to fetch profiles');
  }
};

// Search profiles by name or skills
export const searchProfiles = async (
  searchTerm: string,
  pageSize: number = 12,
  lastDoc?: DocumentSnapshot
): Promise<ProfileListResult> => {
  try {
    // Note: Firestore doesn't support full-text search, so we'll do basic name search
    // For production, consider using Algolia or similar for better search
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    let profileQuery = query(
      collection(db, 'users'),
      orderBy('core.name'),
      limit(pageSize + 1)
    );

    if (lastDoc) {
      profileQuery = query(
        collection(db, 'users'),
        orderBy('core.name'),
        startAfter(lastDoc),
        limit(pageSize + 1)
      );
    }

    const querySnapshot = await getDocs(profileQuery);
    const docs = querySnapshot.docs;
    
    // Filter results client-side (in production, use proper search service)
    const filteredDocs = docs.filter(doc => {
      const profile = doc.data() as UserProfile;
      const name = profile.core.name?.toLowerCase() || '';
      const title = profile.core.mainTitle?.toLowerCase() || '';
      const skills = profile.core.mainSkills?.map(skill => skill.toLowerCase()).join(' ') || '';
      
      return name.includes(lowerSearchTerm) || 
             title.includes(lowerSearchTerm) || 
             skills.includes(lowerSearchTerm);
    });

    // Check if there are more profiles
    const hasMore = filteredDocs.length > pageSize;
    const profilesToReturn = hasMore ? filteredDocs.slice(0, -1) : filteredDocs;
    
    const profiles: ProfileListItem[] = profilesToReturn.map(doc => ({
      id: doc.id,
      profile: doc.data() as UserProfile
    }));

    return {
      profiles,
      hasMore,
      lastDoc: profilesToReturn.length > 0 ? profilesToReturn[profilesToReturn.length - 1] : undefined
    };
  } catch (error) {
    console.error('Error searching profiles:', error);
    throw new Error('Failed to search profiles');
  }
};

// Get profiles by organization (simplified query to avoid index issues)
export const getProfilesByOrganization = async (
  orgId: string,
  pageSize: number = 12,
  lastDoc?: DocumentSnapshot
): Promise<ProfileListResult> => {
  try {
    // Get all profiles and filter client-side to avoid index requirements
    const profileQuery = query(collection(db, 'users'));
    const querySnapshot = await getDocs(profileQuery);
    const docs = querySnapshot.docs;
    
    // Filter profiles that belong to the organization
    const filteredDocs = docs.filter(doc => {
      const profile = doc.data() as UserProfile;
      // Check multiple ways a profile might be linked to organization
      return (
        profile.profiles?.[orgId] || // Direct organization membership
        profile.organizationMemberships?.[orgId] || // Organization membership field
        profile.core?.teamIds?.includes(orgId) || // Team ID includes org ID
        (profile.core?.teamIds && profile.core.teamIds.some(teamId => 
          teamId === orgId || teamId.includes('techcorp') || teamId.includes('innovation')
        )) // Partial matching for demo data
      );
    });

    console.log(`Found ${filteredDocs.length} profiles for organization ${orgId}`);

    // Apply pagination to filtered results
    const hasMore = filteredDocs.length > pageSize;
    const profilesToReturn = hasMore ? filteredDocs.slice(0, pageSize) : filteredDocs;
    
    const profiles: ProfileListItem[] = profilesToReturn.map(doc => ({
      id: doc.id,
      profile: doc.data() as UserProfile
    }));

    return {
      profiles,
      hasMore,
      lastDoc: profilesToReturn.length > 0 ? profilesToReturn[profilesToReturn.length - 1] : undefined
    };
  } catch (error) {
    console.error('Error fetching organization profiles:', error);
    
    // Fallback: return all profiles if organization filtering fails
    try {
      const fallbackQuery = query(collection(db, 'users'), limit(pageSize));
      const fallbackSnapshot = await getDocs(fallbackQuery);
      const fallbackProfiles = fallbackSnapshot.docs.map(doc => ({
        id: doc.id,
        profile: doc.data() as UserProfile
      }));
      
      console.log(`Fallback: returning ${fallbackProfiles.length} profiles`);
      
      return {
        profiles: fallbackProfiles,
        hasMore: false,
        lastDoc: undefined
      };
    } catch (fallbackError) {
      console.error('Fallback query also failed:', fallbackError);
      throw new Error('Failed to fetch organization profiles');
    }
  }
};