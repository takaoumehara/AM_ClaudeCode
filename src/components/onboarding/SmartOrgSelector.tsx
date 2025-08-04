'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOrganization } from '@/contexts/OrganizationContext';
import { searchOrganizations, Organization } from '@/lib/firebase/organizations';
import { getProfilesByOrganization, ProfileListItem } from '@/lib/firebase/profiles';

interface SmartOrgSelectorProps {
  onOrgSelected?: (org: Organization) => void;
}

export const SmartOrgSelector: React.FC<SmartOrgSelectorProps> = ({ onOrgSelected }) => {
  const router = useRouter();
  const { organizations, currentOrganization, setCurrentOrganization, createNewOrganization, joinExistingOrganization } = useOrganization();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Organization[]>([]);
  const [searching, setSearching] = useState(false);
  const [previewProfiles, setPreviewProfiles] = useState<{ [orgId: string]: ProfileListItem[] }>({});
  const [loadingPreviews, setLoadingPreviews] = useState<{ [orgId: string]: boolean }>({});
  const [creatingNew, setCreatingNew] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-select and navigate if user has only one organization
  useEffect(() => {
    if (organizations.length === 1 && !currentOrganization) {
      const org = organizations[0];
      setCurrentOrganization(org);
      onOrgSelected?.(org);
      router.push('/browse');
    }
  }, [organizations, currentOrganization, setCurrentOrganization, onOrgSelected, router]);

  // Load preview profiles for organizations
  const loadPreview = async (orgId: string) => {
    if (previewProfiles[orgId] || loadingPreviews[orgId]) return;

    setLoadingPreviews(prev => ({ ...prev, [orgId]: true }));
    try {
      const result = await getProfilesByOrganization(orgId, 3); // Just get 3 profiles for preview
      setPreviewProfiles(prev => ({ ...prev, [orgId]: result.profiles }));
    } catch (error) {
      console.error('Error loading preview:', error);
    } finally {
      setLoadingPreviews(prev => ({ ...prev, [orgId]: false }));
    }
  };

  // Load previews for user's organizations
  useEffect(() => {
    organizations.forEach(org => {
      loadPreview(org.id);
    });
  }, [organizations]);

  const handleSelectOrganization = (org: Organization) => {
    setCurrentOrganization(org);
    onOrgSelected?.(org);
    router.push('/browse');
  };

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const results = await searchOrganizations(term.trim());
      const filteredResults = results.filter(
        org => !organizations.some(userOrg => userOrg.id === org.id)
      );
      setSearchResults(filteredResults);
      
      // Load previews for search results
      filteredResults.forEach(org => loadPreview(org.id));
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleJoinOrganization = async (orgId: string) => {
    setLoading(true);
    setError('');

    try {
      await joinExistingOrganization(orgId);
      // Will auto-navigate via useEffect
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join organization');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrganization = async () => {
    if (!newOrgName.trim()) {
      setError('Please enter an organization name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await createNewOrganization(newOrgName.trim());
      setCreatingNew(false);
      setNewOrgName('');
      // Will auto-navigate via useEffect
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create organization');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string): string => {
    return name.split(' ').map(word => word.charAt(0).toUpperCase()).slice(0, 2).join('');
  };

  const getProfileColor = (name: string): string => {
    const colors = ['#3B82F6', '#8B5CF6', '#EF4444', '#10B981', '#F59E0B', '#EC4899', '#6366F1', '#84CC16'];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const OrganizationCard = ({ org, isUserOrg = false }: { org: Organization; isUserOrg?: boolean }) => {
    const profiles = previewProfiles[org.id] || [];
    const isLoadingPreview = loadingPreviews[org.id];

    return (
      <div className="border rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer bg-white">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{org.name}</h3>
            <p className="text-sm text-gray-500">{org.members.length} members</p>
          </div>
          {isUserOrg ? (
            <button
              onClick={() => handleSelectOrganization(org)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              Enter
            </button>
          ) : (
            <button
              onClick={() => handleJoinOrganization(org.id)}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-50"
            >
              {loading ? 'Joining...' : 'Join'}
            </button>
          )}
        </div>

        {/* Profile Previews */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">People Preview</p>
          {isLoadingPreview ? (
            <div className="flex gap-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
              ))}
            </div>
          ) : profiles.length > 0 ? (
            <div className="flex gap-2">
              {profiles.map((item) => (
                <div
                  key={item.id}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium"
                  style={{ backgroundColor: getProfileColor(item.profile.core?.name || '') }}
                  title={item.profile.core?.name}
                >
                  {getInitials(item.profile.core?.name || 'U')}
                </div>
              ))}
              {org.members.length > 3 && (
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs text-gray-600">
                  +{org.members.length - 3}
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-gray-400">No profiles yet</div>
          )}
        </div>

        {/* Quick Stats */}
        {profiles.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex gap-4 text-xs text-gray-500">
              <span>{profiles.length} profiles</span>
              <span>{profiles.reduce((acc, item) => acc + (item.profile.core?.mainSkills?.length || 0), 0)} skills</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Workspace</h1>
        <p className="text-gray-600">Select an organization to explore profiles and connect with people</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="mb-8">
        <div className="relative max-w-md mx-auto">
          <input
            type="text"
            placeholder="Search organizations..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* User's Organizations */}
      {organizations.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Organizations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizations.map((org) => (
              <OrganizationCard key={org.id} org={org} isUserOrg={true} />
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Organizations You Can Join</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((org) => (
              <OrganizationCard key={org.id} org={org} isUserOrg={false} />
            ))}
          </div>
        </div>
      )}

      {/* Create New Organization */}
      <div className="text-center">
        {!creatingNew ? (
          <button
            onClick={() => setCreatingNew(true)}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            + Create New Organization
          </button>
        ) : (
          <div className="max-w-md mx-auto bg-gray-50 p-6 rounded-lg">
            <input
              type="text"
              placeholder="Organization name"
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={handleCreateOrganization}
                disabled={loading || !newOrgName.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create'}
              </button>
              <button
                onClick={() => {
                  setCreatingNew(false);
                  setNewOrgName('');
                  setError('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};