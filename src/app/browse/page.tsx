'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { logOut } from '@/lib/firebase/auth';
import { ProfileCard } from '@/components/profiles/ProfileCard';
import { CardGrid, EmptyProfilesState, ProfilesErrorState } from '@/components/profiles/CardGrid';
import { useProfiles } from '@/hooks/useProfiles';
import { useProfileSelection } from '@/hooks/useProfileSelection';
import { SelectionControls, SelectionToolbar } from '@/components/selection/SelectionControls';
import { ProfileComparisonModal } from '@/components/modals/ProfileComparisonModal';
import Link from 'next/link';

export default function BrowsePage() {
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);

  // Profile selection hook
  const {
    selectedIds,
    toggleSelection,
    clearSelection,
    getSelectionCount,
    isSelected,
    canSelect
  } = useProfileSelection(4);

  // Use debounced search
  const {
    profiles,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    loadingMore
  } = useProfiles({
    pageSize: 12,
    searchTerm,
    organizationId: currentOrganization?.id
  });

  const handleLogout = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(searchInput.trim());
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    // Auto-search after typing stops
    if (e.target.value === '') {
      setSearchTerm('');
    }
  };

  const handleToggleSelectionMode = () => {
    if (isSelectionMode) {
      clearSelection();
    }
    setIsSelectionMode(!isSelectionMode);
  };

  const handleCompare = () => {
    setIsComparisonModalOpen(true);
  };

  const handleCloseComparison = () => {
    setIsComparisonModalOpen(false);
  };

  const handleRemoveFromComparison = (profileId: string) => {
    toggleSelection(profileId);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation Bar */}
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center space-x-4">
                <Link href="/profiles" className="text-xl font-semibold text-gray-900 hover:text-blue-600">
                  AboutMe Cards
                </Link>
                {currentOrganization && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    {currentOrganization.name}
                  </span>
                )}
              </div>
              
              {/* Search Bar */}
              <div className="flex-1 max-w-lg mx-8">
                <form onSubmit={handleSearch} className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg 
                      className="h-5 w-5 text-gray-400" 
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
                  <input
                    type="text"
                    value={searchInput}
                    onChange={handleSearchInputChange}
                    placeholder="Search by name, title, or skills..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </form>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={handleToggleSelectionMode}
                  className={`text-sm px-3 py-1 rounded-md border transition-colors ${
                    isSelectionMode
                      ? 'bg-orange-50 text-orange-700 border-orange-200 hover:border-orange-300'
                      : 'text-gray-600 hover:text-gray-700 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {isSelectionMode ? 'Exit Compare' : 'Compare'}
                </button>
                <Link
                  href="/list"
                  className="text-sm text-purple-600 hover:text-purple-700 px-3 py-1 rounded-md border border-purple-200 hover:border-purple-300"
                >
                  List View
                </Link>
                <Link
                  href="/profile/edit"
                  className="text-sm text-blue-600 hover:text-blue-700 px-3 py-1 rounded-md border border-blue-200 hover:border-blue-300"
                >
                  Edit Profile
                </Link>
                <span className="text-sm text-gray-700">
                  {user?.displayName || user?.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {searchTerm ? `Search Results for "${searchTerm}"` : 'Browse Profiles'}
                </h1>
                <p className="text-gray-600 mt-2">
                  {currentOrganization 
                    ? `Discover people in ${currentOrganization.name}`
                    : 'Discover people and their skills'
                  }
                  {isSelectionMode && ' - Select profiles to compare'}
                </p>
              </div>
              
              <div className="text-sm text-gray-500">
                {!loading && profiles.length > 0 && (
                  <span>{profiles.length} profile{profiles.length !== 1 ? 's' : ''} found</span>
                )}
              </div>
            </div>
            
            {/* Selection toolbar */}
            {isSelectionMode && getSelectionCount() > 0 && (
              <div className="mt-4">
                <SelectionToolbar
                  selectedCount={getSelectionCount()}
                  maxSelection={4}
                  totalProfiles={profiles.length}
                  onCompare={handleCompare}
                  onClear={clearSelection}
                />
              </div>
            )}
          </div>

          {/* Error State */}
          {error && (
            <ProfilesErrorState 
              message={error}
              onRetry={refresh}
            />
          )}

          {/* Empty State */}
          {!loading && !error && profiles.length === 0 && (
            <EmptyProfilesState />
          )}

          {/* Profile Grid */}
          {!error && (
            <CardGrid loading={loading} className="mb-8">
              {profiles.map(({ id, profile }) => (
                <ProfileCard
                  key={id}
                  profile={profile}
                  userId={id}
                  isSelectable={isSelectionMode}
                  isSelected={isSelected(id)}
                  canSelect={canSelect(id)}
                  onToggleSelection={toggleSelection}
                />
              ))}
            </CardGrid>
          )}

          {/* Load More Button */}
          {!loading && !error && hasMore && (
            <div className="text-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingMore ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </button>
            </div>
          )}

          {/* Footer Info */}
          {!loading && !error && profiles.length > 0 && !hasMore && (
            <div className="text-center text-gray-500 text-sm mt-8">
              You've seen all available profiles
            </div>
          )}
        </main>

        {/* Floating selection controls */}
        {isSelectionMode && (
          <SelectionControls
            selectedCount={getSelectionCount()}
            maxSelection={4}
            onCompare={handleCompare}
            onClear={clearSelection}
          />
        )}

        {/* Comparison Modal */}
        <ProfileComparisonModal
          isOpen={isComparisonModalOpen}
          onClose={handleCloseComparison}
          selectedProfileIds={selectedIds}
          onRemoveProfile={handleRemoveFromComparison}
          onAddMore={() => setIsComparisonModalOpen(false)}
          maxProfiles={4}
        />
      </div>
    </ProtectedRoute>
  );
}