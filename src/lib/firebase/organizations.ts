// Organization management utilities
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  arrayUnion,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';

export interface Organization {
  id: string;
  name: string;
  admins: string[];
  members: string[];
  orgProfileTemplate: {
    fields: Array<{
      key: string;
      type: string;
      required: boolean;
      publicDefault: boolean;
    }>;
  };
  teams: string[];
  projects: string[];
  inviteLinks: string[];
  tags: string[];
  createdAt?: any;
  logo?: string;
  description?: string;
  type?: 'corporate' | 'community' | 'project' | 'startup' | 'other';
}

export interface OrganizationInvitation {
  id: string;
  organizationId: string;
  organizationName: string;
  organizationLogo?: string;
  email: string;
  invitedBy: string;
  inviterName: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: any;
  expiresAt: any;
}

export interface UserOrganizationMembership {
  role: 'admin' | 'member';
  joinedAt: any;
}

// Get organizations user is a member of
export const getUserOrganizations = async (userId: string): Promise<Organization[]> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) return [];

    const userData = userDoc.data();
    const memberships = userData.organizationMemberships || {};
    const orgIds = Object.keys(memberships);

    if (orgIds.length === 0) return [];

    const organizations: Organization[] = [];
    for (const orgId of orgIds) {
      const orgDoc = await getDoc(doc(db, 'organizations', orgId));
      if (orgDoc.exists()) {
        organizations.push({ id: orgDoc.id, ...orgDoc.data() } as Organization);
      }
    }

    return organizations;
  } catch (error) {
    console.error('Error getting user organizations:', error);
    throw error;
  }
};

// Create a new organization
export const createOrganization = async (
  name: string,
  adminUserId: string
): Promise<string> => {
  try {
    const orgRef = doc(collection(db, 'organizations'));
    const orgId = orgRef.id;

    const organization: Omit<Organization, 'id'> = {
      name,
      admins: [adminUserId],
      members: [adminUserId],
      orgProfileTemplate: {
        fields: [
          { key: 'name', type: 'text', required: true, publicDefault: true },
          { key: 'title', type: 'text', required: true, publicDefault: true },
          { key: 'skills', type: 'array', required: false, publicDefault: true },
          { key: 'interests', type: 'array', required: false, publicDefault: false },
        ],
      },
      teams: [],
      projects: [],
      inviteLinks: [],
      tags: [],
      createdAt: serverTimestamp(),
    };

    await setDoc(orgRef, organization);

    // Add organization membership to user
    await updateDoc(doc(db, 'users', adminUserId), {
      [`organizationMemberships.${orgId}`]: {
        role: 'admin',
        joinedAt: serverTimestamp(),
      },
    });

    return orgId;
  } catch (error) {
    console.error('Error creating organization:', error);
    throw error;
  }
};

// Join an existing organization
export const joinOrganization = async (
  orgId: string,
  userId: string,
  role: 'admin' | 'member' = 'member'
): Promise<void> => {
  try {
    // Check if organization exists
    const orgDoc = await getDoc(doc(db, 'organizations', orgId));
    if (!orgDoc.exists()) {
      throw new Error('Organization not found');
    }

    // Add user to organization members
    await updateDoc(doc(db, 'organizations', orgId), {
      members: arrayUnion(userId),
      ...(role === 'admin' && { admins: arrayUnion(userId) }),
    });

    // Add organization membership to user
    await updateDoc(doc(db, 'users', userId), {
      [`organizationMemberships.${orgId}`]: {
        role,
        joinedAt: serverTimestamp(),
      },
    });
  } catch (error) {
    console.error('Error joining organization:', error);
    throw error;
  }
};

// Get organization by ID
export const getOrganization = async (orgId: string): Promise<Organization | null> => {
  try {
    const orgDoc = await getDoc(doc(db, 'organizations', orgId));
    if (!orgDoc.exists()) return null;

    return { id: orgDoc.id, ...orgDoc.data() } as Organization;
  } catch (error) {
    console.error('Error getting organization:', error);
    throw error;
  }
};

// Search organizations by name (for joining)
export const searchOrganizations = async (searchTerm: string): Promise<Organization[]> => {
  try {
    const orgsQuery = query(
      collection(db, 'organizations'),
      where('name', '>=', searchTerm),
      where('name', '<=', searchTerm + '\uf8ff')
    );

    const querySnapshot = await getDocs(orgsQuery);
    const organizations: Organization[] = [];

    querySnapshot.forEach((doc) => {
      organizations.push({ id: doc.id, ...doc.data() } as Organization);
    });

    return organizations;
  } catch (error) {
    console.error('Error searching organizations:', error);
    throw error;
  }
};

// Get invitations for a user by email
export const getUserInvitations = async (email: string): Promise<OrganizationInvitation[]> => {
  try {
    const invitationsQuery = query(
      collection(db, 'organizationInvitations'),
      where('email', '==', email),
      where('status', '==', 'pending')
    );

    const querySnapshot = await getDocs(invitationsQuery);
    const invitations: OrganizationInvitation[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Check if invitation is not expired
      const now = new Date();
      const expiresAt = data.expiresAt?.toDate();
      
      if (!expiresAt || expiresAt > now) {
        invitations.push({ id: doc.id, ...data } as OrganizationInvitation);
      }
    });

    return invitations;
  } catch (error) {
    console.error('Error getting user invitations:', error);
    throw error;
  }
};

// Accept an invitation
export const acceptInvitation = async (invitationId: string, userId: string): Promise<void> => {
  try {
    // Get invitation details
    const invitationDoc = await getDoc(doc(db, 'organizationInvitations', invitationId));
    if (!invitationDoc.exists()) {
      throw new Error('Invitation not found');
    }

    const invitation = invitationDoc.data() as OrganizationInvitation;
    if (invitation.status !== 'pending') {
      throw new Error('Invitation is no longer valid');
    }

    // Join the organization
    await joinOrganization(invitation.organizationId, userId);

    // Update invitation status
    await updateDoc(doc(db, 'organizationInvitations', invitationId), {
      status: 'accepted',
      acceptedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    throw error;
  }
};

// Decline an invitation
export const declineInvitation = async (invitationId: string, feedback?: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'organizationInvitations', invitationId), {
      status: 'declined',
      declinedAt: serverTimestamp(),
      declineFeedback: feedback || '',
    });
  } catch (error) {
    console.error('Error declining invitation:', error);
    throw error;
  }
};