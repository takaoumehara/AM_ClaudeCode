'use client';

import { useState, useMemo } from 'react';
import { ProfileListItem } from '@/lib/firebase/profiles';
import { SortField, SortDirection } from '@/components/profiles/ProfileCardView';

interface UseTableSortOptions {
  initialSort?: {
    field: SortField;
    direction: SortDirection;
  };
}

interface UseTableSortReturn {
  sortedProfiles: ProfileListItem[];
  sortField: SortField;
  sortDirection: SortDirection;
  handleSort: (field: SortField, direction: SortDirection) => void;
}

export const useTableSort = (
  profiles: ProfileListItem[],
  options: UseTableSortOptions = {}
): UseTableSortReturn => {
  const [sortField, setSortField] = useState<SortField>(
    options.initialSort?.field || 'name'
  );
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    options.initialSort?.direction || 'asc'
  );

  const sortedProfiles = useMemo(() => {
    if (!profiles.length) return profiles;

    const sorted = [...profiles].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'name':
          aValue = a.profile?.core?.name?.toLowerCase() || '';
          bValue = b.profile?.core?.name?.toLowerCase() || '';
          break;

        case 'title':
          aValue = a.profile?.core?.mainTitle?.toLowerCase() || '';
          bValue = b.profile?.core?.mainTitle?.toLowerCase() || '';
          break;

        case 'skillCount':
          aValue = a.profile?.core?.mainSkills?.length || 0;
          bValue = b.profile?.core?.mainSkills?.length || 0;
          break;

        case 'teamCount':
          aValue = a.profile?.core?.teamIds?.length || 0;
          bValue = b.profile?.core?.teamIds?.length || 0;
          break;

        default:
          aValue = a.profile?.core?.name?.toLowerCase() || '';
          bValue = b.profile?.core?.name?.toLowerCase() || '';
      }

      // Handle string comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      }

      // Handle numeric comparison
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Fallback: treat as strings
      const aStr = String(aValue);
      const bStr = String(bValue);
      if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [profiles, sortField, sortDirection]);

  const handleSort = (field: SortField, direction: SortDirection) => {
    setSortField(field);
    setSortDirection(direction);
  };

  return {
    sortedProfiles,
    sortField,
    sortDirection,
    handleSort,
  };
};