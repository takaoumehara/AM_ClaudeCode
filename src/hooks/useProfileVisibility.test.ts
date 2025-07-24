import { renderHook } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useProfileVisibility } from './useProfileVisibility';
import { UserProfile } from '@/lib/firebase/profiles';

const mockProfile: UserProfile = {
  core: {
    name: 'John Doe',
    mainTitle: 'Software Engineer',
    photoUrl: 'https://example.com/photo.jpg',
    mainSkills: ['React', 'TypeScript', 'Node.js'],
    teamIds: ['team1', 'team2']
  },
  personal: {
    motto: 'Code for impact',
    hobbies: ['coding', 'gaming'],
    favorites: ['coffee', 'books'],
    learning: ['AI', 'ML'],
    activities: ['mentoring'],
    show: {
      skills: true,
      personal: false,
      experience: { org1: true, org2: false, all: false },
      contact: false
    }
  },
  profiles: {}
};

const mockUser = {
  uid: 'user123',
  email: 'user@example.com',
  displayName: 'Test User'
};

const mockOrganization = {
  id: 'org1',
  name: 'Test Organization'
};

describe('useProfileVisibility', () => {
  describe('Own Profile Access', () => {
    it('returns full profile access for own profile', () => {
      const { result } = renderHook(() =>
        useProfileVisibility(mockProfile, mockUser, mockOrganization, true)
      );

      expect(result.current.visibleProfile).toEqual(mockProfile);
      expect(result.current.canViewSection('skills')).toBe(true);
      expect(result.current.canViewSection('personal')).toBe(true);
      expect(result.current.canViewSection('experience')).toBe(true);
      expect(result.current.canViewSection('contact')).toBe(true);
      expect(result.current.getVisibilityReason('personal')).toBe('');
    });

    it('ignores privacy settings for own profile', () => {
      const restrictiveProfile: UserProfile = {
        ...mockProfile,
        personal: {
          ...mockProfile.personal!,
          show: {
            skills: false,
            personal: false,
            experience: false,
            contact: false
          }
        }
      };

      const { result } = renderHook(() =>
        useProfileVisibility(restrictiveProfile, mockUser, mockOrganization, true)
      );

      expect(result.current.canViewSection('skills')).toBe(true);
      expect(result.current.canViewSection('personal')).toBe(true);
      expect(result.current.canViewSection('experience')).toBe(true);
      expect(result.current.canViewSection('contact')).toBe(true);
    });
  });

  describe('Other Profile Access', () => {
    it('applies visibility rules for other profiles', () => {
      const { result } = renderHook(() =>
        useProfileVisibility(mockProfile, mockUser, mockOrganization, false)
      );

      expect(result.current.canViewSection('core')).toBe(true);
      expect(result.current.canViewSection('skills')).toBe(true);
      expect(result.current.canViewSection('personal')).toBe(false);
      expect(result.current.canViewSection('experience')).toBe(true); // org1: true
      expect(result.current.canViewSection('contact')).toBe(false);
    });

    it('provides visibility reasons for hidden sections', () => {
      const { result } = renderHook(() =>
        useProfileVisibility(mockProfile, mockUser, mockOrganization, false)
      );

      expect(result.current.getVisibilityReason('personal')).toBe('User has kept personal information private');
      expect(result.current.getVisibilityReason('contact')).toBe('Contact information is private');
      expect(result.current.getVisibilityReason('skills')).toBe(''); // Visible section
    });

    it('filters profile data based on visibility settings', () => {
      const { result } = renderHook(() =>
        useProfileVisibility(mockProfile, mockUser, mockOrganization, false)
      );

      expect(result.current.visibleProfile.core.name).toBe(mockProfile.core.name);
      expect(result.current.visibleProfile.core.mainSkills).toEqual(mockProfile.core.mainSkills);
      expect(result.current.visibleProfile.core.teamIds).toEqual(mockProfile.core.teamIds);
      expect(result.current.visibleProfile.personal).toBeUndefined(); // Hidden
    });
  });

  describe('Organization-specific Visibility', () => {
    it('respects organization-specific settings', () => {
      const org2 = { id: 'org2', name: 'Other Organization' };
      
      const { result } = renderHook(() =>
        useProfileVisibility(mockProfile, mockUser, org2, false)
      );

      expect(result.current.canViewSection('experience')).toBe(false); // org2: false
    });

    it('handles missing organization context', () => {
      const { result } = renderHook(() =>
        useProfileVisibility(mockProfile, mockUser, null, false)
      );

      // Should still work with default visibility rules
      expect(result.current.canViewSection('core')).toBe(true);
      expect(result.current.canViewSection('skills')).toBe(true);
    });

    it('uses "all" setting when organization-specific setting is not found', () => {
      const profileWithAllSettings: UserProfile = {
        ...mockProfile,
        personal: {
          ...mockProfile.personal!,
          show: {
            skills: { all: true },
            personal: { all: false },
            experience: { all: true },
            contact: { all: false }
          }
        }
      };

      const unknownOrg = { id: 'unknown-org', name: 'Unknown Org' };
      
      const { result } = renderHook(() =>
        useProfileVisibility(profileWithAllSettings, mockUser, unknownOrg, false)
      );

      expect(result.current.canViewSection('skills')).toBe(true); // all: true
      expect(result.current.canViewSection('personal')).toBe(false); // all: false
      expect(result.current.canViewSection('experience')).toBe(true); // all: true
    });
  });

  describe('Data Filtering', () => {
    it('filters skills when skills section is hidden', () => {
      const profileWithHiddenSkills: UserProfile = {
        ...mockProfile,
        personal: {
          ...mockProfile.personal!,
          show: {
            skills: false,
            personal: false,
            experience: true,
            contact: false
          }
        }
      };

      const { result } = renderHook(() =>
        useProfileVisibility(profileWithHiddenSkills, mockUser, mockOrganization, false)
      );

      expect(result.current.visibleProfile.core.mainSkills).toEqual([]);
    });

    it('filters team data when experience section is hidden', () => {
      const profileWithHiddenExperience: UserProfile = {
        ...mockProfile,
        personal: {
          ...mockProfile.personal!,
          show: {
            skills: true,
            personal: false,
            experience: false,
            contact: false
          }
        }
      };

      const { result } = renderHook(() =>
        useProfileVisibility(profileWithHiddenExperience, mockUser, mockOrganization, false)
      );

      expect(result.current.visibleProfile.core.teamIds).toEqual([]);
    });

    it('preserves core profile data regardless of other settings', () => {
      const { result } = renderHook(() =>
        useProfileVisibility(mockProfile, mockUser, mockOrganization, false)
      );

      expect(result.current.visibleProfile.core.name).toBe(mockProfile.core.name);
      expect(result.current.visibleProfile.core.mainTitle).toBe(mockProfile.core.mainTitle);
      expect(result.current.visibleProfile.core.photoUrl).toBe(mockProfile.core.photoUrl);
    });
  });

  describe('Hook State Management', () => {
    it('updates visibility when profile changes', () => {
      const { result, rerender } = renderHook(
        ({ profile, user, org, isOwn }) => useProfileVisibility(profile, user, org, isOwn),
        {
          initialProps: {
            profile: mockProfile,
            user: mockUser,
            org: mockOrganization,
            isOwn: false
          }
        }
      );

      expect(result.current.canViewSection('personal')).toBe(false);

      // Update profile with more open settings
      const openProfile: UserProfile = {
        ...mockProfile,
        personal: {
          ...mockProfile.personal!,
          show: {
            skills: true,
            personal: true,
            experience: true,
            contact: true
          }
        }
      };

      rerender({
        profile: openProfile,
        user: mockUser,
        org: mockOrganization,
        isOwn: false
      });

      expect(result.current.canViewSection('personal')).toBe(true);
    });

    it('updates visibility when user context changes', () => {
      const { result, rerender } = renderHook(
        ({ profile, user, org, isOwn }) => useProfileVisibility(profile, user, org, isOwn),
        {
          initialProps: {
            profile: mockProfile,
            user: mockUser,
            org: mockOrganization,
            isOwn: false
          }
        }
      );

      expect(result.current.canViewSection('personal')).toBe(false);

      // Change to own profile
      rerender({
        profile: mockProfile,
        user: mockUser,
        org: mockOrganization,
        isOwn: true
      });

      expect(result.current.canViewSection('personal')).toBe(true);
    });

    it('updates visibility when organization context changes', () => {
      const { result, rerender } = renderHook(
        ({ profile, user, org, isOwn }) => useProfileVisibility(profile, user, org, isOwn),
        {
          initialProps: {
            profile: mockProfile,
            user: mockUser,
            org: mockOrganization, // org1
            isOwn: false
          }
        }
      );

      expect(result.current.canViewSection('experience')).toBe(true); // org1: true

      // Change to org2
      const org2 = { id: 'org2', name: 'Other Organization' };
      rerender({
        profile: mockProfile,
        user: mockUser,
        org: org2,
        isOwn: false
      });

      expect(result.current.canViewSection('experience')).toBe(false); // org2: false
    });
  });

  describe('Edge Cases', () => {
    it('handles profile without personal section', () => {
      const profileWithoutPersonal: UserProfile = {
        ...mockProfile,
        personal: undefined
      };

      const { result } = renderHook(() =>
        useProfileVisibility(profileWithoutPersonal, mockUser, mockOrganization, false)
      );

      expect(result.current.visibleProfile.personal).toBeUndefined();
      expect(result.current.canViewSection('personal')).toBe(false);
    });

    it('handles null user context', () => {
      const { result } = renderHook(() =>
        useProfileVisibility(mockProfile, null, mockOrganization, false)
      );

      expect(result.current.visibleProfile).toBeDefined();
      expect(result.current.canViewSection('core')).toBe(true);
    });

    it('handles empty visibility settings', () => {
      const profileWithEmptySettings: UserProfile = {
        ...mockProfile,
        personal: {
          ...mockProfile.personal!,
          show: {}
        }
      };

      const { result } = renderHook(() =>
        useProfileVisibility(profileWithEmptySettings, mockUser, mockOrganization, false)
      );

      // Should apply default visibility rules
      expect(result.current.canViewSection('core')).toBe(true);
      expect(result.current.canViewSection('skills')).toBe(true);
      expect(result.current.canViewSection('personal')).toBe(false);
      expect(result.current.canViewSection('experience')).toBe(true);
      expect(result.current.canViewSection('contact')).toBe(false);
    });

    it('handles malformed visibility settings gracefully', () => {
      const profileWithMalformedSettings: UserProfile = {
        ...mockProfile,
        personal: {
          ...mockProfile.personal!,
          show: {
            skills: 'invalid' as any,
            personal: null as any,
            experience: undefined as any,
            contact: { malformed: 'data' } as any
          }
        }
      };

      expect(() => {
        renderHook(() =>
          useProfileVisibility(profileWithMalformedSettings, mockUser, mockOrganization, false)
        );
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('returns stable references when inputs do not change', () => {
      const { result, rerender } = renderHook(() =>
        useProfileVisibility(mockProfile, mockUser, mockOrganization, false)
      );

      const firstResult = result.current;
      
      // Re-render with same props
      rerender();
      
      const secondResult = result.current;
      
      // References should be stable
      expect(firstResult.canViewSection).toBe(secondResult.canViewSection);
      expect(firstResult.getVisibilityReason).toBe(secondResult.getVisibilityReason);
    });

    it('only recalculates when necessary inputs change', () => {
      const mockApplyVisibilityRules = jest.fn().mockReturnValue({
        visibleProfile: mockProfile,
        sectionVisibility: { core: true, skills: true },
        reasons: {}
      });

      // Mock the utility function temporarily
      jest.doMock('../utils/profileVisibility', () => ({
        applyVisibilityRules: mockApplyVisibilityRules
      }));

      const { rerender } = renderHook(() =>
        useProfileVisibility(mockProfile, mockUser, mockOrganization, false)
      );

      const initialCallCount = mockApplyVisibilityRules.mock.calls.length;

      // Re-render with same props
      rerender();

      // Should not recalculate
      expect(mockApplyVisibilityRules.mock.calls.length).toBe(initialCallCount);

      jest.unmock('../utils/profileVisibility');
    });
  });

  describe('API Compatibility', () => {
    it('provides consistent API surface', () => {
      const { result } = renderHook(() =>
        useProfileVisibility(mockProfile, mockUser, mockOrganization, false)
      );

      // Check that all expected properties exist
      expect(result.current).toHaveProperty('visibleProfile');
      expect(result.current).toHaveProperty('canViewSection');
      expect(result.current).toHaveProperty('getVisibilityReason');

      // Check that functions are callable
      expect(typeof result.current.canViewSection).toBe('function');
      expect(typeof result.current.getVisibilityReason).toBe('function');

      // Check that functions return expected types
      expect(typeof result.current.canViewSection('skills')).toBe('boolean');
      expect(typeof result.current.getVisibilityReason('skills')).toBe('string');
    });

    it('handles all standard section types', () => {
      const { result } = renderHook(() =>
        useProfileVisibility(mockProfile, mockUser, mockOrganization, false)
      );

      const sections = ['core', 'skills', 'personal', 'experience', 'contact'];
      
      sections.forEach(section => {
        expect(() => {
          result.current.canViewSection(section);
          result.current.getVisibilityReason(section);
        }).not.toThrow();
      });
    });
  });
});