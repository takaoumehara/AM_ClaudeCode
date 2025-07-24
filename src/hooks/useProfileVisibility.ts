'use client';

import { useMemo } from 'react';
import { UserProfile } from '@/lib/firebase/profiles';
import { applyVisibilityRules } from '@/utils/profileVisibility';

export interface VisibilityContext {
  viewerUserId?: string;
  organizationId?: string;
  isOwnProfile: boolean;
  viewerRole?: 'admin' | 'member' | 'guest';
}

export const useProfileVisibility = (
  profile: UserProfile,
  currentUser: any,
  currentOrganization: any,
  isOwnProfile: boolean
) => {
  const visibilityContext: VisibilityContext = useMemo(() => ({
    viewerUserId: currentUser?.uid,
    organizationId: currentOrganization?.id,
    isOwnProfile,
    viewerRole: currentOrganization?.role || 'member'
  }), [currentUser, currentOrganization, isOwnProfile]);

  const { visibleProfile, sectionVisibility, reasons } = useMemo(() => {
    return applyVisibilityRules(profile, visibilityContext);
  }, [profile, visibilityContext]);

  const canViewSection = (sectionName: string): boolean => {
    return sectionVisibility[sectionName] !== false;
  };

  const getVisibilityReason = (sectionName: string): string | null => {
    return reasons[sectionName] || null;
  };

  const getVisibilityLevel = (): 'full' | 'partial' | 'minimal' => {
    const visibleSections = Object.values(sectionVisibility).filter(Boolean).length;
    const totalSections = Object.keys(sectionVisibility).length;
    const percentage = visibleSections / totalSections;

    if (percentage >= 0.8) return 'full';
    if (percentage >= 0.5) return 'partial';
    return 'minimal';
  };

  const getHiddenSectionsCount = (): number => {
    return Object.values(sectionVisibility).filter(visible => !visible).length;
  };

  return {
    visibleProfile,
    sectionVisibility,
    canViewSection,
    getVisibilityReason,
    getVisibilityLevel,
    getHiddenSectionsCount,
    visibilityContext
  };
};