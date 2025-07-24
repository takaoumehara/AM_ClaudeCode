'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { useAuth } from './AuthContext';
import {
  Organization,
  getUserOrganizations,
  createOrganization,
  joinOrganization,
} from '@/lib/firebase/organizations';

interface OrganizationContextType {
  organizations: Organization[];
  currentOrganization: Organization | null;
  loading: boolean;
  setCurrentOrganization: (org: Organization | null) => void;
  createNewOrganization: (name: string) => Promise<string>;
  joinExistingOrganization: (orgId: string) => Promise<void>;
  refreshOrganizations: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType>({
  organizations: [],
  currentOrganization: null,
  loading: true,
  setCurrentOrganization: () => {},
  createNewOrganization: async () => '',
  joinExistingOrganization: async () => {},
  refreshOrganizations: async () => {},
});

interface OrganizationProviderProps {
  children: ReactNode;
}

export const OrganizationProvider: React.FC<OrganizationProviderProps> = ({
  children,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user's organizations
  const loadOrganizations = async () => {
    if (!user) {
      setOrganizations([]);
      setCurrentOrganization(null);
      setLoading(false);
      return;
    }

    try {
      const userOrgs = await getUserOrganizations(user.uid);
      setOrganizations(userOrgs);
      
      // Set current organization from localStorage or first available
      const savedOrgId = localStorage.getItem('currentOrganizationId');
      const savedOrg = userOrgs.find(org => org.id === savedOrgId);
      setCurrentOrganization(savedOrg || userOrgs[0] || null);
    } catch (error) {
      console.error('Error loading organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadOrganizations();
    }
  }, [user, isAuthenticated]);

  // Save current organization to localStorage
  useEffect(() => {
    if (currentOrganization) {
      localStorage.setItem('currentOrganizationId', currentOrganization.id);
    } else {
      localStorage.removeItem('currentOrganizationId');
    }
  }, [currentOrganization]);

  const createNewOrganization = async (name: string): Promise<string> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const orgId = await createOrganization(name, user.uid);
      await loadOrganizations(); // Refresh organizations list
      return orgId;
    } catch (error) {
      console.error('Error creating organization:', error);
      throw error;
    }
  };

  const joinExistingOrganization = async (orgId: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    try {
      await joinOrganization(orgId, user.uid);
      await loadOrganizations(); // Refresh organizations list
    } catch (error) {
      console.error('Error joining organization:', error);
      throw error;
    }
  };

  const refreshOrganizations = async (): Promise<void> => {
    await loadOrganizations();
  };

  const handleSetCurrentOrganization = (org: Organization | null) => {
    setCurrentOrganization(org);
  };

  const value = {
    organizations,
    currentOrganization,
    loading,
    setCurrentOrganization: handleSetCurrentOrganization,
    createNewOrganization,
    joinExistingOrganization,
    refreshOrganizations,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganization = (): OrganizationContextType => {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};