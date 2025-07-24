import {
  applyVisibilityRules,
  canViewSection,
  getVisibilitySummary,
  VisibilityContext,
} from './profileVisibility';
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

describe('applyVisibilityRules', () => {
  describe('Own Profile Visibility', () => {
    it('shows all sections for own profile', () => {
      const context: VisibilityContext = {
        viewerUserId: 'user123',
        organizationId: 'org1',
        isOwnProfile: true,
        viewerRole: 'member'
      };

      const result = applyVisibilityRules(mockProfile, context);

      expect(result.visibleProfile).toEqual(mockProfile);
      expect(result.sectionVisibility).toEqual({
        core: true,
        skills: true,
        personal: true,
        experience: true,
        contact: true,
        all: true
      });
      expect(result.reasons).toEqual({});
    });
  });

  describe('Other Profile Visibility', () => {
    const context: VisibilityContext = {
      viewerUserId: 'viewer456',
      organizationId: 'org1',
      isOwnProfile: false,
      viewerRole: 'member'
    };

    it('applies default visibility settings', () => {
      const profileWithoutSettings: UserProfile = {
        ...mockProfile,
        personal: {
          ...mockProfile.personal!,
          show: {}
        }
      };

      const result = applyVisibilityRules(profileWithoutSettings, context);

      expect(result.sectionVisibility.core).toBe(true);
      expect(result.sectionVisibility.skills).toBe(true);
      expect(result.sectionVisibility.personal).toBe(false);
      expect(result.sectionVisibility.experience).toBe(true);
      expect(result.sectionVisibility.contact).toBe(false);
    });

    it('applies user custom visibility settings', () => {
      const result = applyVisibilityRules(mockProfile, context);

      expect(result.sectionVisibility.core).toBe(true);
      expect(result.sectionVisibility.skills).toBe(true); // User set to true
      expect(result.sectionVisibility.personal).toBe(false); // User set to false
      expect(result.sectionVisibility.experience).toBe(true); // User set org1: true
      expect(result.sectionVisibility.contact).toBe(false); // User set to false
    });

    it('provides visibility reasons for hidden sections', () => {
      const result = applyVisibilityRules(mockProfile, context);

      expect(result.reasons.personal).toBe('User has kept personal information private');
      expect(result.reasons.contact).toBe('Contact information is private');
    });

    it('filters profile data based on visibility settings', () => {
      const result = applyVisibilityRules(mockProfile, context);

      expect(result.visibleProfile.core.name).toBe(mockProfile.core.name);
      expect(result.visibleProfile.core.mainSkills).toEqual(mockProfile.core.mainSkills); // Skills visible
      expect(result.visibleProfile.core.teamIds).toEqual(mockProfile.core.teamIds); // Experience visible
      expect(result.visibleProfile.personal).toBeUndefined(); // Personal hidden
    });

    it('handles organization-specific visibility settings', () => {
      const contextOrg2: VisibilityContext = {
        viewerUserId: 'viewer456',
        organizationId: 'org2',
        isOwnProfile: false,
        viewerRole: 'member'
      };

      const result = applyVisibilityRules(mockProfile, contextOrg2);

      expect(result.sectionVisibility.experience).toBe(false); // org2: false in settings
    });

    it('handles "all" visibility settings', () => {
      const profileWithAllSettings: UserProfile = {
        ...mockProfile,
        personal: {
          ...mockProfile.personal!,
          show: {
            skills: { all: true },
            personal: { all: false },
            experience: { all: true, org1: false }, // org1 overrides all
            contact: false
          }
        }
      };

      const result = applyVisibilityRules(profileWithAllSettings, context);

      expect(result.sectionVisibility.skills).toBe(true); // all: true
      expect(result.sectionVisibility.personal).toBe(false); // all: false
      expect(result.sectionVisibility.experience).toBe(false); // org1: false overrides all: true
    });

    it('handles boolean visibility settings', () => {
      const profileWithBooleanSettings: UserProfile = {
        ...mockProfile,
        personal: {
          ...mockProfile.personal!,
          show: {
            skills: true,
            personal: false,
            experience: true,
            contact: false
          }
        }
      };

      const result = applyVisibilityRules(profileWithBooleanSettings, context);

      expect(result.sectionVisibility.skills).toBe(true);
      expect(result.sectionVisibility.personal).toBe(false);
      expect(result.sectionVisibility.experience).toBe(true);
      expect(result.sectionVisibility.contact).toBe(false);
    });

    it('filters skills and team data based on visibility', () => {
      const profileWithHiddenSkills: UserProfile = {
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

      const result = applyVisibilityRules(profileWithHiddenSkills, context);

      expect(result.visibleProfile.core.mainSkills).toEqual([]);
      expect(result.visibleProfile.core.teamIds).toEqual([]);
    });
  });

  describe('Edge Cases', () => {
    it('handles profile without personal section', () => {
      const profileWithoutPersonal: UserProfile = {
        ...mockProfile,
        personal: undefined
      };

      const context: VisibilityContext = {
        viewerUserId: 'viewer456',
        organizationId: 'org1',
        isOwnProfile: false,
        viewerRole: 'member'
      };

      const result = applyVisibilityRules(profileWithoutPersonal, context);

      expect(result.visibleProfile.personal).toBeUndefined();
      expect(result.sectionVisibility.personal).toBe(false);
    });

    it('handles missing organization ID', () => {
      const context: VisibilityContext = {
        viewerUserId: 'viewer456',
        organizationId: undefined,
        isOwnProfile: false,
        viewerRole: 'guest'
      };

      const result = applyVisibilityRules(mockProfile, context);

      // Should still work with default visibility rules
      expect(result.sectionVisibility.core).toBe(true);
    });

    it('handles empty visibility settings', () => {
      const profileWithEmptySettings: UserProfile = {
        ...mockProfile,
        personal: {
          ...mockProfile.personal!,
          show: {}
        }
      };

      const context: VisibilityContext = {
        viewerUserId: 'viewer456',
        organizationId: 'org1',
        isOwnProfile: false,
        viewerRole: 'member'
      };

      const result = applyVisibilityRules(profileWithEmptySettings, context);

      // Should apply default visibility rules
      expect(result.sectionVisibility.core).toBe(true);
      expect(result.sectionVisibility.skills).toBe(true);
      expect(result.sectionVisibility.personal).toBe(false);
      expect(result.sectionVisibility.experience).toBe(true);
      expect(result.sectionVisibility.contact).toBe(false);
    });
  });
});

describe('canViewSection', () => {
  const context: VisibilityContext = {
    viewerUserId: 'viewer456',
    organizationId: 'org1',
    isOwnProfile: false,
    viewerRole: 'member'
  };

  it('returns true for viewable sections', () => {
    expect(canViewSection(mockProfile, context, 'core')).toBe(true);
    expect(canViewSection(mockProfile, context, 'skills')).toBe(true);
    expect(canViewSection(mockProfile, context, 'experience')).toBe(true);
  });

  it('returns false for hidden sections', () => {
    expect(canViewSection(mockProfile, context, 'personal')).toBe(false);
    expect(canViewSection(mockProfile, context, 'contact')).toBe(false);
  });

  it('returns true for all sections when own profile', () => {
    const ownContext: VisibilityContext = {
      ...context,
      isOwnProfile: true
    };

    expect(canViewSection(mockProfile, ownContext, 'personal')).toBe(true);
    expect(canViewSection(mockProfile, ownContext, 'contact')).toBe(true);
  });
});

describe('getVisibilitySummary', () => {
  const context: VisibilityContext = {
    viewerUserId: 'viewer456',
    organizationId: 'org1',
    isOwnProfile: false,
    viewerRole: 'member'
  };

  it('calculates visibility level correctly', () => {
    // Mock profile with most sections visible (public level)
    const publicProfile: UserProfile = {
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

    const summary = getVisibilitySummary(publicProfile, context);
    expect(summary.level).toBe('public');
    expect(summary.visibleSections.length).toBeGreaterThan(3);
  });

  it('identifies organization level visibility', () => {
    const summary = getVisibilitySummary(mockProfile, context);
    
    // With current mock settings, should be organization level
    expect(summary.level).toBe('organization');
    expect(summary.visibleSections).toContain('core');
    expect(summary.visibleSections).toContain('skills');
    expect(summary.visibleSections).toContain('experience');
    expect(summary.hiddenSections).toContain('personal');
    expect(summary.hiddenSections).toContain('contact');
  });

  it('identifies private level visibility', () => {
    const privateProfile: UserProfile = {
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

    const summary = getVisibilitySummary(privateProfile, context);
    expect(summary.level).toBe('private');
    expect(summary.hiddenSections.length).toBeGreaterThan(2);
  });

  it('calculates total sections correctly', () => {
    const summary = getVisibilitySummary(mockProfile, context);
    
    expect(summary.totalSections).toBeGreaterThan(0);
    expect(summary.visibleSections.length + summary.hiddenSections.length).toBe(summary.totalSections);
  });

  it('provides accurate section lists', () => {
    const summary = getVisibilitySummary(mockProfile, context);
    
    expect(summary.visibleSections).toContain('core');
    expect(summary.visibleSections).toContain('skills');
    expect(summary.visibleSections).toContain('experience');
    
    expect(summary.hiddenSections).toContain('personal');
    expect(summary.hiddenSections).toContain('contact');
  });

  it('handles own profile visibility summary', () => {
    const ownContext: VisibilityContext = {
      ...context,
      isOwnProfile: true
    };

    const summary = getVisibilitySummary(mockProfile, ownContext);
    
    expect(summary.level).toBe('public');
    expect(summary.hiddenSections.length).toBe(0);
    expect(summary.visibleSections.length).toBe(summary.totalSections);
  });
});

describe('Edge Cases and Error Handling', () => {
  it('handles null profile gracefully', () => {
    const context: VisibilityContext = {
      viewerUserId: 'viewer456',
      organizationId: 'org1',
      isOwnProfile: false,
      viewerRole: 'member'
    };

    // This would typically not happen in real usage, but test defensive coding
    const emptyProfile: UserProfile = {
      core: {
        name: '',
        mainTitle: '',
        photoUrl: '',
        mainSkills: [],
        teamIds: []
      },
      personal: undefined,
      profiles: {}
    };

    expect(() => {
      applyVisibilityRules(emptyProfile, context);
    }).not.toThrow();
  });

  it('handles malformed visibility settings', () => {
    const profileWithMalformedSettings: UserProfile = {
      ...mockProfile,
      personal: {
        ...mockProfile.personal!,
        show: {
          skills: 'invalid' as any,
          personal: null as any,
          experience: undefined as any,
          contact: { malformed: 'object' } as any
        }
      }
    };

    const context: VisibilityContext = {
      viewerUserId: 'viewer456',
      organizationId: 'org1',
      isOwnProfile: false,
      viewerRole: 'member'
    };

    expect(() => {
      const result = applyVisibilityRules(profileWithMalformedSettings, context);
      expect(result).toBeDefined();
    }).not.toThrow();
  });

  it('handles different viewer roles', () => {
    const context: VisibilityContext = {
      viewerUserId: 'viewer456',
      organizationId: 'org1',
      isOwnProfile: false,
      viewerRole: 'admin'
    };

    const result = applyVisibilityRules(mockProfile, context);
    
    // Current implementation doesn't use viewer role, but ensure it doesn't break
    expect(result).toBeDefined();
    expect(result.visibleProfile).toBeDefined();
    expect(result.sectionVisibility).toBeDefined();
  });

  it('maintains data integrity in visible profile', () => {
    const context: VisibilityContext = {
      viewerUserId: 'viewer456',
      organizationId: 'org1',
      isOwnProfile: false,
      viewerRole: 'member'
    };

    const result = applyVisibilityRules(mockProfile, context);
    
    // Ensure core profile structure is maintained
    expect(result.visibleProfile.core).toBeDefined();
    expect(result.visibleProfile.core.name).toBe(mockProfile.core.name);
    expect(result.visibleProfile.profiles).toBeDefined();
    
    // Ensure we don't accidentally expose hidden data
    expect(result.visibleProfile.personal).toBeUndefined(); // Because personal is hidden
  });
});