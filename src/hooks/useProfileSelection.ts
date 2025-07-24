'use client';

import { useState, useCallback } from 'react';

export interface SelectionState {
  selectedIds: Set<string>;
  maxSelection: number;
}

export const useProfileSelection = (maxSelection: number = 4) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelection = useCallback((profileId: string) => {
    setSelectedIds(prev => {
      const newSelection = new Set(prev);
      
      if (newSelection.has(profileId)) {
        // Remove if already selected
        newSelection.delete(profileId);
      } else if (newSelection.size < maxSelection) {
        // Add if under limit
        newSelection.add(profileId);
      }
      // If at limit and trying to add, ignore the action
      
      return newSelection;
    });
  }, [maxSelection]);

  const selectProfile = useCallback((profileId: string) => {
    setSelectedIds(prev => {
      if (prev.size >= maxSelection && !prev.has(profileId)) {
        return prev; // Don't add if at limit
      }
      const newSelection = new Set(prev);
      newSelection.add(profileId);
      return newSelection;
    });
  }, [maxSelection]);

  const deselectProfile = useCallback((profileId: string) => {
    setSelectedIds(prev => {
      const newSelection = new Set(prev);
      newSelection.delete(profileId);
      return newSelection;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const selectMultiple = useCallback((profileIds: string[]) => {
    setSelectedIds(prev => {
      const newSelection = new Set(prev);
      
      for (const id of profileIds) {
        if (newSelection.size >= maxSelection) break;
        newSelection.add(id);
      }
      
      return newSelection;
    });
  }, [maxSelection]);

  const isSelected = useCallback((profileId: string) => {
    return selectedIds.has(profileId);
  }, [selectedIds]);

  const canSelect = useCallback((profileId: string) => {
    return !selectedIds.has(profileId) && selectedIds.size < maxSelection;
  }, [selectedIds, maxSelection]);

  const getSelectionCount = useCallback(() => {
    return selectedIds.size;
  }, [selectedIds]);

  const getSelectedIds = useCallback(() => {
    return Array.from(selectedIds);
  }, [selectedIds]);

  const isAtLimit = useCallback(() => {
    return selectedIds.size >= maxSelection;
  }, [selectedIds, maxSelection]);

  const getRemainingSlots = useCallback(() => {
    return maxSelection - selectedIds.size;
  }, [selectedIds, maxSelection]);

  return {
    selectedIds: Array.from(selectedIds),
    toggleSelection,
    selectProfile,
    deselectProfile,
    clearSelection,
    selectMultiple,
    isSelected,
    canSelect,
    getSelectionCount,
    getSelectedIds,
    isAtLimit,
    getRemainingSlots,
    maxSelection
  };
};