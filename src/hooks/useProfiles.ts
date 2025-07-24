'use client';

import { useState, useEffect, useCallback } from 'react';
import { DocumentSnapshot } from 'firebase/firestore';
import { 
  getProfiles, 
  searchProfiles, 
  getProfilesByOrganization, 
  ProfileListItem, 
  ProfileListResult 
} from '@/lib/firebase/profiles';

interface UseProfilesOptions {
  pageSize?: number;
  searchTerm?: string;
  organizationId?: string;
  autoLoad?: boolean;
}

interface UseProfilesReturn {
  profiles: ProfileListItem[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  loadingMore: boolean;
}

export const useProfiles = ({
  pageSize = 12,
  searchTerm = '',
  organizationId,
  autoLoad = true
}: UseProfilesOptions = {}): UseProfilesReturn => {
  const [profiles, setProfiles] = useState<ProfileListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | undefined>();

  const fetchProfiles = useCallback(async (
    isLoadMore = false,
    lastDocument?: DocumentSnapshot
  ) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
      }

      let result: ProfileListResult;

      if (searchTerm.trim()) {
        result = await searchProfiles(searchTerm.trim(), pageSize, lastDocument);
      } else if (organizationId) {
        result = await getProfilesByOrganization(organizationId, pageSize, lastDocument);
      } else {
        result = await getProfiles(pageSize, lastDocument);
      }

      if (isLoadMore) {
        setProfiles(prev => [...prev, ...result.profiles]);
      } else {
        setProfiles(result.profiles);
      }

      setHasMore(result.hasMore);
      setLastDoc(result.lastDoc);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load profiles';
      setError(errorMessage);
      
      if (!isLoadMore) {
        setProfiles([]);
        setHasMore(false);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [searchTerm, organizationId, pageSize]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || loading) return;
    await fetchProfiles(true, lastDoc);
  }, [hasMore, loadingMore, loading, lastDoc, fetchProfiles]);

  const refresh = useCallback(async () => {
    setLastDoc(undefined);
    await fetchProfiles(false);
  }, [fetchProfiles]);

  // Initial load and reload when dependencies change
  useEffect(() => {
    if (autoLoad) {
      setLastDoc(undefined);
      fetchProfiles(false);
    }
  }, [fetchProfiles, autoLoad]);

  return {
    profiles,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    loadingMore
  };
};