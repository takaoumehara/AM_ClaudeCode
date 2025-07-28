'use client';

import { useState, useMemo } from 'react';
import { ProfileListItem } from '@/lib/firebase/profiles';

interface FilterOptions {
  searchTerm: string;
  selectedSkills: string[];
  selectedTeams: string[];
}

interface UseProfileFiltersReturn {
  filteredProfiles: ProfileListItem[];
  availableSkills: string[];
  availableTeams: string[];
  filters: FilterOptions;
  updateFilters: (updates: Partial<FilterOptions>) => void;
  clearAllFilters: () => void;
  hasActiveFilters: boolean;
}

export const useProfileFilters = (
  profiles: ProfileListItem[]
): UseProfileFiltersReturn => {
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: '',
    selectedSkills: [],
    selectedTeams: [],
  });

  // Extract available skills and teams from all profiles
  const { availableSkills, availableTeams } = useMemo(() => {
    const skillsSet = new Set<string>();
    const teamsSet = new Set<string>();

    profiles.forEach(({ profile }) => {
      // Collect skills - check if profile.core exists first
      if (profile?.core?.mainSkills) {
        profile.core.mainSkills.forEach(skill => {
          if (skill && skill.trim()) {
            skillsSet.add(skill);
          }
        });
      }

      // Collect teams - check if profile.core exists first
      if (profile?.core?.teamIds) {
        profile.core.teamIds.forEach(teamId => {
          if (teamId && teamId.trim()) {
            teamsSet.add(teamId);
          }
        });
      }
    });

    return {
      availableSkills: Array.from(skillsSet).sort(),
      availableTeams: Array.from(teamsSet).sort(),
    };
  }, [profiles]);

  // Apply filters to profiles
  const filteredProfiles = useMemo(() => {
    let filtered = profiles;

    // Apply search filter
    if (filters.searchTerm.trim()) {
      const searchLower = filters.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(({ profile }) => {
        const name = profile?.core?.name?.toLowerCase() || '';
        const title = profile?.core?.mainTitle?.toLowerCase() || '';
        const skills = profile?.core?.mainSkills?.map(s => s.toLowerCase()).join(' ') || '';
        const teams = profile?.core?.teamIds?.join(' ').toLowerCase() || '';

        return (
          name.includes(searchLower) ||
          title.includes(searchLower) ||
          skills.includes(searchLower) ||
          teams.includes(searchLower)
        );
      });
    }

    // Apply skills filter
    if (filters.selectedSkills.length > 0) {
      filtered = filtered.filter(({ profile }) => {
        if (!profile?.core?.mainSkills || profile.core.mainSkills.length === 0) {
          return false;
        }

        // Check if profile has any of the selected skills
        return filters.selectedSkills.some(selectedSkill =>
          profile.core.mainSkills?.includes(selectedSkill)
        );
      });
    }

    // Apply teams filter
    if (filters.selectedTeams.length > 0) {
      filtered = filtered.filter(({ profile }) => {
        if (!profile?.core?.teamIds || profile.core.teamIds.length === 0) {
          return false;
        }

        // Check if profile has any of the selected teams
        return filters.selectedTeams.some(selectedTeam =>
          profile.core.teamIds?.includes(selectedTeam)
        );
      });
    }

    return filtered;
  }, [profiles, filters]);

  const updateFilters = (updates: Partial<FilterOptions>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  };

  const clearAllFilters = () => {
    setFilters({
      searchTerm: '',
      selectedSkills: [],
      selectedTeams: [],
    });
  };

  const hasActiveFilters = useMemo(() => {
    return (
      filters.searchTerm.trim() !== '' ||
      filters.selectedSkills.length > 0 ||
      filters.selectedTeams.length > 0
    );
  }, [filters]);

  return {
    filteredProfiles,
    availableSkills,
    availableTeams,
    filters,
    updateFilters,
    clearAllFilters,
    hasActiveFilters,
  };
};