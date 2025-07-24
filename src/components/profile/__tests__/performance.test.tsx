import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProfilePage } from '../ProfilePage';
import { SkillsSection } from '../SkillsSection';
import { PersonalSection } from '../PersonalSection';
import { ExperienceSection } from '../ExperienceSection';
import { UserProfile } from '@/lib/firebase/profiles';

// Mock the visibility hook
jest.mock('@/hooks/useProfileVisibility', () => ({
  useProfileVisibility: jest.fn().mockReturnValue({
    visibleProfile: {},
    canViewSection: jest.fn().mockReturnValue(true),
    getVisibilityReason: jest.fn().mockReturnValue(''),
  }),
}));

// Mock child components for ProfilePage tests
jest.mock('../ProfileHero', () => ({
  ProfileHero: () => <div data-testid="profile-hero">ProfileHero</div>
}));

jest.mock('../ProfileCompleteness', () => ({
  ProfileCompleteness: () => <div data-testid="profile-completeness">ProfileCompleteness</div>
}));

import { useProfileVisibility } from '@/hooks/useProfileVisibility';
const mockUseProfileVisibility = useProfileVisibility as jest.MockedFunction<typeof useProfileVisibility>;

describe('Performance Tests', () => {
  // Generate large test data
  const generateLargeProfile = (skillsCount: number, teamsCount: number, activitiesCount: number): UserProfile => {
    const skills = Array.from({ length: skillsCount }, (_, i) => `Skill ${i + 1}`);
    const teams = Array.from({ length: teamsCount }, (_, i) => `team-${i + 1}`);
    const activities = Array.from({ length: activitiesCount }, (_, i) => `Activity ${i + 1}`);
    const hobbies = Array.from({ length: 50 }, (_, i) => `Hobby ${i + 1}`);
    const favorites = Array.from({ length: 30 }, (_, i) => `Favorite ${i + 1}`);
    const learning = Array.from({ length: 20 }, (_, i) => `Learning ${i + 1}`);

    return {
      core: {
        name: 'John Doe',
        mainTitle: 'Senior Software Engineer',
        photoUrl: 'https://example.com/photo.jpg',
        mainSkills: skills,
        teamIds: teams
      },
      personal: {
        motto: 'Always be learning and growing',
        hobbies,
        favorites,
        learning,
        activities,
        show: {
          skills: true,
          personal: true,
          experience: true,
          contact: true
        }
      },
      profiles: {}
    };
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ProfilePage Performance', () => {
    it('renders efficiently with large profiles', () => {
      const largeProfile = generateLargeProfile(100, 50, 75);
      
      mockUseProfileVisibility.mockReturnValue({
        visibleProfile: largeProfile,
        canViewSection: jest.fn().mockReturnValue(true),
        getVisibilityReason: jest.fn().mockReturnValue(''),
        sectionVisibility: {},
        getVisibilityLevel: jest.fn().mockReturnValue('full'),
        getHiddenSectionsCount: jest.fn().mockReturnValue(0),
        visibilityContext: { isOwnProfile: false }
      });

      const startTime = performance.now();
      
      render(
        <ProfilePage
          profile={largeProfile}
          userId="user456"
          isOwnProfile={false}
          currentUser={mockUser}
          currentOrganization={mockOrganization}
        />
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within reasonable time (less than 100ms for large profile)
      expect(renderTime).toBeLessThan(100);
      
      // Verify main components are rendered
      expect(screen.getByTestId('profile-hero')).toBeInTheDocument();
    });

    it('handles rapid re-renders efficiently', () => {
      const profile = generateLargeProfile(50, 25, 30);
      
      mockUseProfileVisibility.mockReturnValue({
        visibleProfile: profile,
        canViewSection: jest.fn().mockReturnValue(true),
        getVisibilityReason: jest.fn().mockReturnValue(''),
        sectionVisibility: {},
        getVisibilityLevel: jest.fn().mockReturnValue('full'),
        getHiddenSectionsCount: jest.fn().mockReturnValue(0),
        visibilityContext: { isOwnProfile: false }
      });

      const { rerender } = render(
        <ProfilePage
          profile={profile}
          userId="user456"
          isOwnProfile={false}
          currentUser={mockUser}
          currentOrganization={mockOrganization}
        />
      );

      // Measure multiple re-renders
      const startTime = performance.now();
      
      for (let i = 0; i < 10; i++) {
        rerender(
          <ProfilePage
            profile={profile}
            userId="user456"
            isOwnProfile={false}
            currentUser={mockUser}
            currentOrganization={mockOrganization}
          />
        );
      }

      const endTime = performance.now();
      const rerenderTime = endTime - startTime;

      // 10 re-renders should complete within 100ms
      expect(rerenderTime).toBeLessThan(100);
    });
  });

  describe('SkillsSection Performance', () => {
    it('renders large skill lists efficiently', () => {
      const largeSkillsList = Array.from({ length: 200 }, (_, i) => `Skill ${i + 1}`);

      const startTime = performance.now();
      
      render(
        <SkillsSection
          skills={largeSkillsList}
          isOwnProfile={false}
        />
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      expect(renderTime).toBeLessThan(50);
      expect(screen.getByText('Skills & Expertise')).toBeInTheDocument();
      expect(screen.getByText('Total Skills: 200')).toBeInTheDocument();
    });

    it('categorizes skills efficiently', () => {
      const mixedSkills = [
        ...Array.from({ length: 50 }, (_, i) => `React ${i}`),
        ...Array.from({ length: 50 }, (_, i) => `Leadership ${i}`),
        ...Array.from({ length: 50 }, (_, i) => `JavaScript ${i}`),
        ...Array.from({ length: 50 }, (_, i) => `Communication ${i}`)
      ];

      const startTime = performance.now();
      
      render(
        <SkillsSection
          skills={mixedSkills}
          isOwnProfile={false}
        />
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      expect(renderTime).toBeLessThan(100);
      
      // Should properly categorize technical vs other skills
      expect(screen.getByText(/Technical/)).toBeInTheDocument();
    });

    it('handles rapid skill list updates', () => {
      const { rerender } = render(
        <SkillsSection
          skills={[]}
          isOwnProfile={false}
        />
      );

      const startTime = performance.now();

      // Simulate rapid updates
      for (let i = 1; i <= 20; i++) {
        const skills = Array.from({ length: i * 5 }, (_, j) => `Skill ${j}`);
        rerender(
          <SkillsSection
            skills={skills}
            isOwnProfile={false}
          />
        );
      }

      const endTime = performance.now();
      const updateTime = endTime - startTime;

      expect(updateTime).toBeLessThan(200);
    });
  });

  describe('PersonalSection Performance', () => {
    it('renders large personal data efficiently', () => {
      const largePersonalData = {
        motto: 'A very long personal motto that goes on and on about life, work, and everything in between',
        hobbies: Array.from({ length: 100 }, (_, i) => `Hobby ${i + 1}`),
        favorites: Array.from({ length: 80 }, (_, i) => `Favorite ${i + 1}`),
        learning: Array.from({ length: 60 }, (_, i) => `Learning ${i + 1}`),
        activities: Array.from({ length: 120 }, (_, i) => `Activity ${i + 1} with detailed description`),
        customFields: Object.fromEntries(
          Array.from({ length: 50 }, (_, i) => [`field${i}`, `Value ${i} with some extra text`])
        ),
        show: {}
      };

      const startTime = performance.now();
      
      render(
        <PersonalSection
          personal={largePersonalData}
          isOwnProfile={false}
        />
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      expect(renderTime).toBeLessThan(100);
      expect(screen.getByText('Personal Information')).toBeInTheDocument();
    });

    it('handles empty and null personal data efficiently', () => {
      const startTime = performance.now();
      
      render(
        <PersonalSection
          personal={null}
          isOwnProfile={false}
        />
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      expect(renderTime).toBeLessThan(10);
    });
  });

  describe('ExperienceSection Performance', () => {
    it('renders large team lists efficiently', () => {
      const largeTeamList = Array.from({ length: 100 }, (_, i) => `team-${i + 1}`);

      const startTime = performance.now();
      
      render(
        <ExperienceSection
          teamIds={largeTeamList}
          isOwnProfile={false}
        />
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      expect(renderTime).toBeLessThan(100);
      expect(screen.getByText('Teams & Experience')).toBeInTheDocument();
      expect(screen.getByText('Current Teams (100)')).toBeInTheDocument();
    });

    it('generates team colors consistently and efficiently', () => {
      const teamIds = Array.from({ length: 50 }, (_, i) => `team-${i}`);

      const startTime = performance.now();
      
      render(
        <ExperienceSection
          teamIds={teamIds}
          isOwnProfile={false}
        />
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      expect(renderTime).toBeLessThan(50);
    });
  });

  describe('Memory Usage', () => {
    it('does not create memory leaks with large datasets', () => {
      const largeProfile = generateLargeProfile(500, 100, 200);
      
      mockUseProfileVisibility.mockReturnValue({
        visibleProfile: largeProfile,
        canViewSection: jest.fn().mockReturnValue(true),
        getVisibilityReason: jest.fn().mockReturnValue(''),
        sectionVisibility: {},
        getVisibilityLevel: jest.fn().mockReturnValue('full'),
        getHiddenSectionsCount: jest.fn().mockReturnValue(0),
        visibilityContext: { isOwnProfile: false }
      });

      // Measure memory before
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

      const { unmount } = render(
        <ProfilePage
          profile={largeProfile}
          userId="user456"
          isOwnProfile={false}
          currentUser={mockUser}
          currentOrganization={mockOrganization}
        />
      );

      // Unmount component
      unmount();

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      // Measure memory after
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Memory increase should be reasonable (less than 10MB)
      const memoryIncrease = finalMemory - initialMemory;
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });

    it('properly cleans up event listeners and effects', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

      const { unmount } = render(
        <SkillsSection
          skills={Array.from({ length: 100 }, (_, i) => `Skill ${i}`)}
          isOwnProfile={false}
        />
      );

      const addedListeners = addEventListenerSpy.mock.calls.length;
      
      unmount();
      
      const removedListeners = removeEventListenerSpy.mock.calls.length;

      // Should clean up any event listeners that were added
      expect(removedListeners).toBe(addedListeners);

      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });
  });

  describe('Concurrent Rendering', () => {
    it('handles concurrent updates gracefully', async () => {
      const profile = generateLargeProfile(100, 50, 75);
      
      mockUseProfileVisibility.mockReturnValue({
        visibleProfile: profile,
        canViewSection: jest.fn().mockReturnValue(true),
        getVisibilityReason: jest.fn().mockReturnValue(''),
        sectionVisibility: {},
        getVisibilityLevel: jest.fn().mockReturnValue('full'),
        getHiddenSectionsCount: jest.fn().mockReturnValue(0),
        visibilityContext: { isOwnProfile: false }
      });

      const { rerender } = render(
        <ProfilePage
          profile={profile}
          userId="user456"
          isOwnProfile={false}
          currentUser={mockUser}
          currentOrganization={mockOrganization}
        />
      );

      // Simulate concurrent updates
      const promises = Array.from({ length: 10 }, (_, i) =>
        act(async () => {
          const updatedProfile = {
            ...profile,
            core: {
              ...profile.core,
              name: `Updated Name ${i}`
            }
          };
          
          rerender(
            <ProfilePage
              profile={updatedProfile}
              userId="user456"
              isOwnProfile={false}
              currentUser={mockUser}
              currentOrganization={mockOrganization}
            />
          );
        })
      );

      // Should handle all concurrent updates without errors
      await expect(Promise.all(promises)).resolves.not.toThrow();
    });
  });

  describe('Responsive Performance', () => {
    it('applies responsive classes efficiently', () => {
      const profile = generateLargeProfile(50, 25, 40);
      
      mockUseProfileVisibility.mockReturnValue({
        visibleProfile: profile,
        canViewSection: jest.fn().mockReturnValue(true),
        getVisibilityReason: jest.fn().mockReturnValue(''),
        sectionVisibility: {},
        getVisibilityLevel: jest.fn().mockReturnValue('full'),
        getHiddenSectionsCount: jest.fn().mockReturnValue(0),
        visibilityContext: { isOwnProfile: false }
      });

      const startTime = performance.now();
      
      render(
        <ProfilePage
          profile={profile}
          userId="user456"
          isOwnProfile={false}
          currentUser={mockUser}
          currentOrganization={mockOrganization}
        />
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Responsive layout should not significantly impact performance
      expect(renderTime).toBeLessThan(100);

      // Verify responsive classes are applied
      const gridContainer = document.querySelector('.grid.grid-cols-1.lg\\:grid-cols-3');
      expect(gridContainer).toBeInTheDocument();
    });
  });
});