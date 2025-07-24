'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { logOut } from '@/lib/firebase/auth';
import { ProfileTable } from '@/components/profiles/ProfileTable';
import { SkillFilter } from '@/components/filters/SkillFilter';
import { TeamFilter } from '@/components/filters/TeamFilter';
import { SearchBox } from '@/components/filters/SearchBox';
import { useProfiles } from '@/hooks/useProfiles';
import { useProfileFilters } from '@/hooks/useProfileFilters';
import { useTableSort } from '@/hooks/useTableSort';
import Link from 'next/link';

export default function ListViewPage() {
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();

  // Fetch profiles data
  const {
    profiles,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    loadingMore
  } = useProfiles({
    pageSize: 50, // Load more for table view
    organizationId: currentOrganization?.id
  });

  // Apply filters
  const {
    filteredProfiles,
    availableSkills,
    availableTeams,
    filters,
    updateFilters,
    clearAllFilters,
    hasActiveFilters
  } = useProfileFilters(profiles);

  // Apply sorting
  const {
    sortedProfiles,
    sortField,
    sortDirection,
    handleSort
  } = useTableSort(filteredProfiles, {
    initialSort: { field: 'name', direction: 'asc' }
  });

  const handleLogout = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Error Loading Profiles
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={refresh}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Try Again
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

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

              <div className="flex items-center space-x-4">
                <Link
                  href="/browse"
                  className="text-sm text-green-600 hover:text-green-700 px-3 py-1 rounded-md border border-green-200 hover:border-green-300"
                >
                  Card View
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
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Profiles List View
                </h1>
                <p className="text-gray-600 mt-2">
                  {currentOrganization 
                    ? `Browse and compare people in ${currentOrganization.name}`
                    : 'Browse and compare profiles in a detailed table format'
                  }
                </p>
              </div>
              
              <div className="text-sm text-gray-600">
                {!loading && (
                  <span>
                    Showing {sortedProfiles.length} of {profiles.length} profile{profiles.length !== 1 ? 's' : ''}
                    {hasActiveFilters && ' (filtered)'}
                  </span>
                )}
              </div>
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {/* Search */}
              <div className="md:col-span-2">
                <SearchBox
                  value={filters.searchTerm}
                  onChange={(value) => updateFilters({ searchTerm: value })}
                  placeholder="Search by name, title, skills, or teams..."
                  disabled={loading}
                />
              </div>

              {/* Skills Filter */}
              <div>
                <SkillFilter
                  availableSkills={availableSkills}
                  selectedSkills={filters.selectedSkills}
                  onSkillsChange={(skills) => updateFilters({ selectedSkills: skills })}
                  loading={loading}
                />
              </div>

              {/* Teams Filter */}
              <div>
                <TeamFilter
                  availableTeams={availableTeams}
                  selectedTeams={filters.selectedTeams}
                  onTeamsChange={(teams) => updateFilters({ selectedTeams: teams })}
                  loading={loading}
                />
              </div>
            </div>

            {/* Active Filters Summary */}
            {hasActiveFilters && (
              <div className="flex items-center justify-between bg-blue-50 rounded-lg p-3 mb-6">
                <div className="flex items-center space-x-2 text-sm">
                  <span className="font-medium text-blue-900">Active filters:</span>
                  {filters.searchTerm && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      Search: "{filters.searchTerm}"
                    </span>
                  )}
                  {filters.selectedSkills.length > 0 && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {filters.selectedSkills.length} skill{filters.selectedSkills.length !== 1 ? 's' : ''}
                    </span>
                  )}
                  {filters.selectedTeams.length > 0 && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {filters.selectedTeams.length} team{filters.selectedTeams.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="mb-8">
            <ProfileTable
              profiles={sortedProfiles}
              loading={loading}
              onSort={handleSort}
              sortField={sortField}
              sortDirection={sortDirection}
            />
          </div>

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
                  'Load More Profiles'
                )}
              </button>
            </div>
          )}

          {/* Footer Info */}
          {!loading && !error && sortedProfiles.length > 0 && !hasMore && (
            <div className="text-center text-gray-500 text-sm mt-8">
              You've seen all available profiles
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}