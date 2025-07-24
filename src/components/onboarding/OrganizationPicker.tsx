'use client';

import { useState } from 'react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { searchOrganizations, Organization } from '@/lib/firebase/organizations';

interface OrganizationPickerProps {
  onNext: () => void;
  onSkip?: () => void;
}

type TabType = 'select' | 'create' | 'join';

export const OrganizationPicker: React.FC<OrganizationPickerProps> = ({
  onNext,
  onSkip,
}) => {
  const {
    organizations,
    currentOrganization,
    setCurrentOrganization,
    createNewOrganization,
    joinExistingOrganization,
  } = useOrganization();

  const [activeTab, setActiveTab] = useState<TabType>('select');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Create organization states
  const [newOrgName, setNewOrgName] = useState('');

  // Join organization states
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Organization[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSelectOrganization = (org: Organization) => {
    setCurrentOrganization(org);
    onNext();
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
      onNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create organization');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchOrganizations = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    setError('');

    try {
      const results = await searchOrganizations(searchTerm.trim());
      setSearchResults(results);
    } catch (err) {
      setError('Failed to search organizations');
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
      onNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join organization');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
          Choose Your Organization
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Select an existing organization, create a new one, or join by invitation
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('select')}
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === 'select'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            My Organizations ({organizations.length})
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === 'create'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Create New
          </button>
          <button
            onClick={() => setActiveTab('join')}
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === 'join'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Join Existing
          </button>
        </div>

        {/* Select Existing Organization */}
        {activeTab === 'select' && (
          <div className="space-y-4">
            {organizations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">You're not a member of any organizations yet.</p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Create your first organization
                </button>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-600 mb-4">
                  Select an organization to continue:
                </p>
                <div className="space-y-3">
                  {organizations.map((org) => (
                    <div
                      key={org.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        currentOrganization?.id === org.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleSelectOrganization(org)}
                    >
                      <h3 className="font-medium text-gray-900">{org.name}</h3>
                      <p className="text-sm text-gray-500">
                        {org.members.length} members
                      </p>
                    </div>
                  ))}
                </div>
                {currentOrganization && (
                  <button
                    onClick={onNext}
                    className="w-full mt-6 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Continue with {currentOrganization.name}
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* Create New Organization */}
        {activeTab === 'create' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="orgName" className="block text-sm font-medium text-gray-700 mb-2">
                Organization Name
              </label>
              <input
                id="orgName"
                type="text"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter organization name"
                disabled={loading}
              />
            </div>
            <button
              onClick={handleCreateOrganization}
              disabled={loading || !newOrgName.trim()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Organization...' : 'Create Organization'}
            </button>
          </div>
        )}

        {/* Join Existing Organization */}
        {activeTab === 'join' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Organizations
              </label>
              <div className="flex gap-2">
                <input
                  id="search"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter organization name"
                  disabled={searching}
                />
                <button
                  onClick={handleSearchOrganizations}
                  disabled={searching || !searchTerm.trim()}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {searching ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">Search Results:</p>
                {searchResults.map((org) => (
                  <div
                    key={org.id}
                    className="p-4 border border-gray-200 rounded-lg flex justify-between items-center"
                  >
                    <div>
                      <h3 className="font-medium text-gray-900">{org.name}</h3>
                      <p className="text-sm text-gray-500">
                        {org.members.length} members
                      </p>
                    </div>
                    <button
                      onClick={() => handleJoinOrganization(org.id)}
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Joining...' : 'Join'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {searchTerm && searchResults.length === 0 && !searching && (
              <p className="text-center text-gray-500 py-4">
                No organizations found matching "{searchTerm}"
              </p>
            )}
          </div>
        )}

        {/* Skip Option */}
        {onSkip && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={onSkip}
              className="w-full text-gray-600 hover:text-gray-800 font-medium"
            >
              Skip for now (you can set this up later)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};