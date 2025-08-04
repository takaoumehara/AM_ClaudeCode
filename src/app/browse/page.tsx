'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Header } from '@/components/layout/Header';
import { useOrganization } from '@/contexts/OrganizationContext';
import { ProfileCardView } from '@/components/profiles/ProfileCardView';
import { ProfileListView } from '@/components/profiles/ProfileListView';
import { getProfilesByOrganization, type ProfileListItem } from '@/lib/firebase/profiles';

type ViewMode = 'cards' | 'list';

export default function BrowsePage() {
  const { currentOrganization } = useOrganization();
  const [profiles, setProfiles] = useState<ProfileListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  // Load profiles
  useEffect(() => {
    const loadProfiles = async () => {
      if (!currentOrganization) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await getProfilesByOrganization(currentOrganization.id);
        setProfiles(result.profiles);
      } catch (err) {
        console.error('Error loading profiles:', err);
        setError('Failed to load profiles');
      } finally {
        setLoading(false);
      }
    };

    loadProfiles();
  }, [currentOrganization]);

  // Filter profiles based on search and filters
  const filteredProfiles = profiles.filter(item => {
    const profile = item.profile;
    
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        profile.core?.name?.toLowerCase().includes(searchLower) ||
        profile.core?.mainTitle?.toLowerCase().includes(searchLower) ||
        profile.core?.mainSkills?.some(skill => 
          skill.toLowerCase().includes(searchLower)
        );
      if (!matchesSearch) return false;
    }

    // Skills filter
    if (selectedSkills.length > 0) {
      const hasSelectedSkills = selectedSkills.some(skill =>
        profile.core?.mainSkills?.includes(skill)
      );
      if (!hasSelectedSkills) return false;
    }

    // Teams filter
    if (selectedTeams.length > 0) {
      const hasSelectedTeams = selectedTeams.some(team =>
        profile.core?.teamIds?.includes(team)
      );
      if (!hasSelectedTeams) return false;
    }

    return true;
  });

  // Get all unique skills for filter
  const allSkills = Array.from(
    new Set(
      profiles.flatMap(item => item.profile.core?.mainSkills || [])
    )
  ).sort();

  // Get all unique teams for filter
  const allTeams = Array.from(
    new Set(
      profiles.flatMap(item => item.profile.core?.teamIds || [])
    )
  ).sort();

  const handleViewChange = (view: ViewMode) => {
    setViewMode(view);
  };

  if (!currentOrganization) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Organization Selected</h2>
            <p className="text-gray-600">Please select an organization to browse profiles.</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header 
          showViewToggle={true}
          currentView={viewMode}
          onViewChange={handleViewChange}
        />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Page Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {viewMode === 'cards' ? 'Browse Profiles' : 'Profiles List View'}
                </h1>
                <p className="text-gray-600 mt-1">
                  Discover people in {currentOrganization.name}
                </p>
              </div>
              <div className="text-sm text-gray-500">
                Showing {filteredProfiles.length} of {profiles.length} profiles
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name, title, skills, or teams..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <svg
                    className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
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

                {/* Skills Filter */}
                <div>
                  <select
                    multiple
                    value={selectedSkills}
                    onChange={(e) => {
                      const values = Array.from(e.target.selectedOptions, option => option.value);
                      setSelectedSkills(values);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="" disabled>Filter by skills...</option>
                    {allSkills.map(skill => (
                      <option key={skill} value={skill}>{skill}</option>
                    ))}
                  </select>
                </div>

                {/* Teams Filter */}
                <div>
                  <select
                    multiple
                    value={selectedTeams}
                    onChange={(e) => {
                      const values = Array.from(e.target.selectedOptions, option => option.value);
                      setSelectedTeams(values);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="" disabled>Filter by teams...</option>
                    {allTeams.map(team => (
                      <option key={team} value={team}>{team}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Clear Filters */}
              {(searchTerm || selectedSkills.length > 0 || selectedTeams.length > 0) && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedSkills([]);
                      setSelectedTeams([]);
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>

            {/* Content */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-700">{error}</p>
              </div>
            ) : filteredProfiles.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No profiles found matching your criteria.</p>
                {(searchTerm || selectedSkills.length > 0 || selectedTeams.length > 0) && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedSkills([]);
                      setSelectedTeams([]);
                    }}
                    className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear filters to see all profiles
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border">
                {viewMode === 'cards' ? (
                  <ProfileCardView profiles={filteredProfiles} />
                ) : (
                  <ProfileListView profiles={filteredProfiles} />
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}