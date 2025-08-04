'use client';

import { useState, useEffect } from 'react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { searchOrganizations, Organization } from '@/lib/firebase/organizations';
import { useRouter } from 'next/navigation';

interface OrganizationPickerV2Props {
  onNext?: () => void;
  onSkip?: () => void;
}

export const OrganizationPickerV2: React.FC<OrganizationPickerV2Props> = ({
  onNext,
  onSkip,
}) => {
  const router = useRouter();
  const {
    organizations,
    currentOrganization,
    setCurrentOrganization,
    createNewOrganization,
    joinExistingOrganization,
  } = useOrganization();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Organization[]>([]);
  const [searching, setSearching] = useState(false);
  const [creatingNew, setCreatingNew] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');

  // Auto-select if user only has one organization
  useEffect(() => {
    if (organizations.length === 1 && !currentOrganization) {
      handleSelectOrganization(organizations[0]);
    }
  }, [organizations]);

  const handleSelectOrganization = (org: Organization) => {
    setCurrentOrganization(org);
    // Immediately navigate to profiles
    router.push('/profiles');
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
      // Filter out organizations user is already a member of
      const filteredResults = results.filter(
        org => !organizations.some(userOrg => userOrg.id === org.id)
      );
      setSearchResults(filteredResults);
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
      // Organization will be automatically selected via useEffect
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
      // Organization will be automatically selected via useEffect
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create organization');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back!
          </h2>
          <p className="text-gray-600">
            Select your workspace or create a new one
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search for organizations to join..."
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg
              className="absolute right-3 top-3.5 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          
          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-3 border border-gray-200 rounded-lg p-4 bg-gray-50">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Organizations you can join:
              </p>
              <div className="space-y-2">
                {searchResults.map((org) => (
                  <div
                    key={org.id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                  >
                    <div>
                      <h4 className="font-medium text-gray-900">{org.name}</h4>
                      <p className="text-sm text-gray-500">{org.members.length} members</p>
                    </div>
                    <button
                      onClick={() => handleJoinOrganization(org.id)}
                      disabled={loading}
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Joining...' : 'Join'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Your Organizations */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              Your Organizations
            </h3>
            
            {organizations.length === 0 ? (
              <div className="text-center py-12 px-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <svg
                  className="w-12 h-12 mx-auto text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <p className="text-gray-600 mb-4">You're not part of any organization yet</p>
                <p className="text-sm text-gray-500">Create a new one or search for existing organizations to join</p>
              </div>
            ) : (
              <div className="space-y-3">
                {organizations.map((org) => (
                  <div
                    key={org.id}
                    onClick={() => handleSelectOrganization(org)}
                    className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg cursor-pointer hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900 group-hover:text-blue-600">
                          {org.name}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {org.members.length} members • Click to enter
                        </p>
                      </div>
                      <svg
                        className="w-5 h-5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Create New Organization */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create New Organization
            </h3>
            
            {!creatingNew ? (
              <div
                onClick={() => setCreatingNew(true)}
                className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-dashed border-green-300 rounded-lg cursor-pointer hover:border-green-400 hover:shadow-md transition-all text-center group"
              >
                <svg
                  className="w-12 h-12 mx-auto text-green-600 mb-4 group-hover:scale-110 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <p className="text-lg font-medium text-gray-900">Start a new workspace</p>
                <p className="text-sm text-gray-600 mt-2">Perfect for teams and companies</p>
              </div>
            ) : (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <input
                  type="text"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  placeholder="Enter organization name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent mb-3"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateOrganization}
                    disabled={loading || !newOrgName.trim()}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

        {/* Skip Option */}
        {onSkip && organizations.length === 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={onSkip}
              className="w-full text-gray-600 hover:text-gray-800 font-medium"
            >
              Skip for now (browse as guest)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};