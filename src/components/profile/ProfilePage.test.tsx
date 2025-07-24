import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProfilePage } from './ProfilePage';
import { UserProfile } from '@/lib/firebase/profiles';

// Mock the profile components
jest.mock('./ProfileHero', () => {
  return function MockProfileHero(props: any) {
    return <div data-testid="profile-hero" data-props={JSON.stringify(props)} />;
  };
});

jest.mock('./SkillsSection', () => {
  return function MockSkillsSection(props: any) {
    return <div data-testid="skills-section" data-props={JSON.stringify(props)} />;
  };
});

jest.mock('./PersonalSection', () => {
  return function MockPersonalSection(props: any) {
    return <div data-testid="personal-section" data-props={JSON.stringify(props)} />;
  };
});

jest.mock('./ExperienceSection', () => {
  return function MockExperienceSection(props: any) {
    return <div data-testid="experience-section" data-props={JSON.stringify(props)} />;
  };
});

jest.mock('./ProfileCompleteness', () => {
  return function MockProfileCompleteness(props: any) {
    return <div data-testid="profile-completeness" data-props={JSON.stringify(props)} />;
  };
});

// Mock the visibility hook
jest.mock('@/hooks/useProfileVisibility', () => ({
  useProfileVisibility: jest.fn(),
}));

import { useProfileVisibility } from '@/hooks/useProfileVisibility';

const mockUseProfileVisibility = useProfileVisibility as jest.MockedFunction<typeof useProfileVisibility>;

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
    show: {}
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

describe('ProfilePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation
    mockUseProfileVisibility.mockReturnValue({
      visibleProfile: mockProfile,
      canViewSection: jest.fn().mockReturnValue(true),
      getVisibilityReason: jest.fn().mockReturnValue(''),
    });
  });

  describe('Layout and Structure', () => {
    it('renders main profile components', () => {
      render(
        <ProfilePage
          profile={mockProfile}
          userId="user456"
          isOwnProfile={false}
          currentUser={mockUser}
          currentOrganization={mockOrganization}
        />
      );

      expect(screen.getByTestId('profile-hero')).toBeInTheDocument();
      expect(screen.getByTestId('skills-section')).toBeInTheDocument();
      expect(screen.getByTestId('personal-section')).toBeInTheDocument();
      expect(screen.getByTestId('experience-section')).toBeInTheDocument();
    });

    it('shows profile completeness for own profile', () => {
      render(
        <ProfilePage
          profile={mockProfile}
          userId="user123" // Same as mockUser.uid
          isOwnProfile={true}
          currentUser={mockUser}
          currentOrganization={mockOrganization}
        />
      );

      expect(screen.getByTestId('profile-completeness')).toBeInTheDocument();
    });

    it('hides profile completeness for other profiles', () => {
      render(
        <ProfilePage
          profile={mockProfile}
          userId="user456"
          isOwnProfile={false}
          currentUser={mockUser}
          currentOrganization={mockOrganization}
        />
      );

      expect(screen.queryByTestId('profile-completeness')).not.toBeInTheDocument();
    });

    it('uses responsive grid layout', () => {
      render(
        <ProfilePage
          profile={mockProfile}
          userId="user456"
          isOwnProfile={false}
          currentUser={mockUser}
          currentOrganization={mockOrganization}
        />
      );

      const gridContainer = document.querySelector('.grid.grid-cols-1.lg\\:grid-cols-3');
      expect(gridContainer).toBeInTheDocument();
    });

    it('applies correct column ordering for mobile/desktop', () => {
      render(
        <ProfilePage
          profile={mockProfile}
          userId="user456"
          isOwnProfile={false}
          currentUser={mockUser}
          currentOrganization={mockOrganization}
        />
      );

      const leftColumn = document.querySelector('.lg\\:col-span-2.space-y-6.lg\\:space-y-8.order-2.lg\\:order-1');
      const rightColumn = document.querySelector('.space-y-6.lg\\:space-y-8.order-1.lg\\:order-2');
      
      expect(leftColumn).toBeInTheDocument();
      expect(rightColumn).toBeInTheDocument();
    });
  });

  describe('Visibility Rules', () => {
    it('calls useProfileVisibility with correct parameters', () => {
      render(
        <ProfilePage
          profile={mockProfile}
          userId="user456"
          isOwnProfile={false}
          currentUser={mockUser}
          currentOrganization={mockOrganization}
        />
      );

      expect(mockUseProfileVisibility).toHaveBeenCalledWith(
        mockProfile,
        mockUser,
        mockOrganization,
        false
      );
    });

    it('passes visible profile to components', () => {
      const visibleProfile = { ...mockProfile, core: { ...mockProfile.core, name: 'Visible Name' } };
      mockUseProfileVisibility.mockReturnValue({
        visibleProfile,
        canViewSection: jest.fn().mockReturnValue(true),
        getVisibilityReason: jest.fn().mockReturnValue(''),
      });

      render(
        <ProfilePage
          profile={mockProfile}
          userId="user456"
          isOwnProfile={false}
          currentUser={mockUser}
          currentOrganization={mockOrganization}
        />
      );

      const heroProps = JSON.parse(screen.getByTestId('profile-hero').getAttribute('data-props') || '{}');
      expect(heroProps.profile.core.name).toBe('Visible Name');
    });

    it('hides sections based on visibility rules', () => {
      const mockCanViewSection = jest.fn()
        .mockReturnValueOnce(true)  // skills
        .mockReturnValueOnce(false) // personal
        .mockReturnValueOnce(true); // experience

      mockUseProfileVisibility.mockReturnValue({
        visibleProfile: mockProfile,
        canViewSection: mockCanViewSection,
        getVisibilityReason: jest.fn().mockReturnValue('Private section'),
      });

      render(
        <ProfilePage
          profile={mockProfile}
          userId="user456"
          isOwnProfile={false}
          currentUser={mockUser}
          currentOrganization={mockOrganization}
        />
      );

      expect(screen.getByTestId('skills-section')).toBeInTheDocument();
      expect(screen.queryByTestId('personal-section')).not.toBeInTheDocument();
      expect(screen.getByTestId('experience-section')).toBeInTheDocument();
    });

    it('shows privacy notice for other profiles', () => {
      render(
        <ProfilePage
          profile={mockProfile}
          userId="user456"
          isOwnProfile={false}
          currentUser={mockUser}
          currentOrganization={mockOrganization}
        />
      );

      expect(screen.getByText(`You're viewing ${mockProfile.core.name}'s profile based on their privacy settings and your organization access.`)).toBeInTheDocument();
    });

    it('hides privacy notice for own profile', () => {
      render(
        <ProfilePage
          profile={mockProfile}
          userId="user123"
          isOwnProfile={true}
          currentUser={mockUser}
          currentOrganization={mockOrganization}
        />
      );

      expect(screen.queryByText(/You're viewing.*profile based on/)).not.toBeInTheDocument();
    });
  });

  describe('Sidebar Components', () => {
    it('renders Quick Info card with profile data', () => {
      render(
        <ProfilePage
          profile={mockProfile}
          userId="user456"
          isOwnProfile={false}
          currentUser={mockUser}
          currentOrganization={mockOrganization}
        />
      );

      expect(screen.getByText('Quick Info')).toBeInTheDocument();
      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
      expect(screen.getByText('2 teams')).toBeInTheDocument();
      expect(screen.getByText('3 skills')).toBeInTheDocument();
    });

    it('shows motto card when personal section is visible and motto exists', () => {
      const mockCanViewSection = jest.fn()
        .mockReturnValue(true); // personal section visible

      mockUseProfileVisibility.mockReturnValue({
        visibleProfile: mockProfile,
        canViewSection: mockCanViewSection,
        getVisibilityReason: jest.fn().mockReturnValue(''),
      });

      render(
        <ProfilePage
          profile={mockProfile}
          userId="user456"
          isOwnProfile={false}
          currentUser={mockUser}
          currentOrganization={mockOrganization}
        />
      );

      expect(screen.getByText('Personal Motto')).toBeInTheDocument();
      expect(screen.getByText('"Code for impact"')).toBeInTheDocument();
    });

    it('hides motto card when personal section is not visible', () => {
      const mockCanViewSection = jest.fn((section) => section !== 'personal');

      mockUseProfileVisibility.mockReturnValue({
        visibleProfile: mockProfile,
        canViewSection: mockCanViewSection,
        getVisibilityReason: jest.fn().mockReturnValue(''),
      });

      render(
        <ProfilePage
          profile={mockProfile}
          userId="user456"
          isOwnProfile={false}
          currentUser={mockUser}
          currentOrganization={mockOrganization}
        />
      );

      expect(screen.queryByText('Personal Motto')).not.toBeInTheDocument();
    });

    it('shows connect actions for other profiles', () => {
      render(
        <ProfilePage
          profile={mockProfile}
          userId="user456"
          isOwnProfile={false}
          currentUser={mockUser}
          currentOrganization={mockOrganization}
        />
      );

      expect(screen.getByText('Connect')).toBeInTheDocument();
      expect(screen.getByText('Send Message')).toBeInTheDocument();
      expect(screen.getByText('Add to Team')).toBeInTheDocument();
    });

    it('hides connect actions for own profile', () => {
      render(
        <ProfilePage
          profile={mockProfile}
          userId="user123"
          isOwnProfile={true}
          currentUser={mockUser}
          currentOrganization={mockOrganization}
        />
      );

      expect(screen.queryByText('Connect')).not.toBeInTheDocument();
      expect(screen.queryByText('Send Message')).not.toBeInTheDocument();
      expect(screen.queryByText('Add to Team')).not.toBeInTheDocument();
    });

    it('shows recent activity placeholder', () => {
      render(
        <ProfilePage
          profile={mockProfile}
          userId="user456"
          isOwnProfile={false}
          currentUser={mockUser}
          currentOrganization={mockOrganization}
        />
      );

      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
      expect(screen.getByText('Activity tracking coming soon')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('applies responsive spacing classes', () => {
      render(
        <ProfilePage
          profile={mockProfile}
          userId="user456"
          isOwnProfile={false}
          currentUser={mockUser}
          currentOrganization={mockOrganization}
        />
      );

      // Check for responsive spacing classes
      const container = document.querySelector('.mt-6.lg\\:mt-8');
      expect(container).toBeInTheDocument();

      const grid = document.querySelector('.gap-6.lg\\:gap-8');
      expect(grid).toBeInTheDocument();

      const leftColumn = document.querySelector('.space-y-6.lg\\:space-y-8');
      expect(leftColumn).toBeInTheDocument();
    });

    it('applies mobile-first responsive text sizes', () => {
      render(
        <ProfilePage
          profile={mockProfile}
          userId="user456"
          isOwnProfile={false}
          currentUser={mockUser}
          currentOrganization={mockOrganization}
        />
      );

      // Check sidebar responsive classes
      const quickInfoTitle = screen.getByText('Quick Info').closest('h3');
      expect(quickInfoTitle).toHaveClass('text-base', 'sm:text-lg');

      const privacyText = screen.getByText(/You're viewing.*profile/).closest('span');
      expect(privacyText).toBeInTheDocument();
    });

    it('applies responsive padding to sidebar cards', () => {
      render(
        <ProfilePage
          profile={mockProfile}
          userId="user456"
          isOwnProfile={false}
          currentUser={mockUser}
          currentOrganization={mockOrganization}
        />
      );

      // Check for responsive padding classes in sidebar cards
      const cards = document.querySelectorAll('.p-4.sm\\:p-6');
      expect(cards.length).toBeGreaterThan(0);
    });
  });

  describe('Edit Functionality', () => {
    it('shows edit buttons for own profile sections', () => {
      render(
        <ProfilePage
          profile={mockProfile}
          userId="user123"
          isOwnProfile={true}
          currentUser={mockUser}
          currentOrganization={mockOrganization}
        />
      );

      // Check that edit functions are passed to components
      const skillsProps = JSON.parse(screen.getByTestId('skills-section').getAttribute('data-props') || '{}');
      const personalProps = JSON.parse(screen.getByTestId('personal-section').getAttribute('data-props') || '{}');
      const experienceProps = JSON.parse(screen.getByTestId('experience-section').getAttribute('data-props') || '{}');

      expect(skillsProps.isOwnProfile).toBe(true);
      expect(skillsProps.onEdit).toBeDefined();
      expect(personalProps.isOwnProfile).toBe(true);
      expect(personalProps.onEdit).toBeDefined();
      expect(experienceProps.isOwnProfile).toBe(true);
      expect(experienceProps.onEdit).toBeDefined();
    });

    it('hides edit buttons for other profiles', () => {
      render(
        <ProfilePage
          profile={mockProfile}
          userId="user456"
          isOwnProfile={false}
          currentUser={mockUser}
          currentOrganization={mockOrganization}
        />
      );

      // Check that edit functions are not passed to components
      const skillsProps = JSON.parse(screen.getByTestId('skills-section').getAttribute('data-props') || '{}');
      const personalProps = JSON.parse(screen.getByTestId('personal-section').getAttribute('data-props') || '{}');
      const experienceProps = JSON.parse(screen.getByTestId('experience-section').getAttribute('data-props') || '{}');

      expect(skillsProps.isOwnProfile).toBe(false);
      expect(skillsProps.onEdit).toBeUndefined();
      expect(personalProps.isOwnProfile).toBe(false);
      expect(personalProps.onEdit).toBeUndefined();
      expect(experienceProps.isOwnProfile).toBe(false);
      expect(experienceProps.onEdit).toBeUndefined();
    });
  });

  describe('Data Handling', () => {
    it('handles missing profile data gracefully', () => {
      const incompleteProfile: UserProfile = {
        core: {
          name: 'Jane Doe',
          mainTitle: '',
          photoUrl: '',
          mainSkills: [],
          teamIds: []
        },
        personal: undefined,
        profiles: {}
      };

      mockUseProfileVisibility.mockReturnValue({
        visibleProfile: incompleteProfile,
        canViewSection: jest.fn().mockReturnValue(true),
        getVisibilityReason: jest.fn().mockReturnValue(''),
      });

      render(
        <ProfilePage
          profile={incompleteProfile}
          userId="user456"
          isOwnProfile={false}
          currentUser={mockUser}
          currentOrganization={mockOrganization}
        />
      );

      // Should render without errors
      expect(screen.getByTestId('profile-hero')).toBeInTheDocument();
      expect(screen.getByTestId('skills-section')).toBeInTheDocument();
      expect(screen.queryByTestId('personal-section')).not.toBeInTheDocument(); // Not visible when undefined
    });

    it('handles null user context gracefully', () => {
      render(
        <ProfilePage
          profile={mockProfile}
          userId="user456"
          isOwnProfile={false}
          currentUser={null}
          currentOrganization={mockOrganization}
        />
      );

      expect(screen.getByTestId('profile-page')).toBeInTheDocument();
    });

    it('handles null organization context gracefully', () => {
      render(
        <ProfilePage
          profile={mockProfile}
          userId="user456"
          isOwnProfile={false}
          currentUser={mockUser}
          currentOrganization={null}
        />
      );

      expect(screen.getByTestId('profile-page')).toBeInTheDocument();
    });
  });

  describe('Custom CSS Classes', () => {
    it('applies custom className prop', () => {
      render(
        <ProfilePage
          profile={mockProfile}
          userId="user456"
          isOwnProfile={false}
          currentUser={mockUser}
          currentOrganization={mockOrganization}
          className="custom-profile-class"
        />
      );

      const container = document.querySelector('.custom-profile-class');
      expect(container).toBeInTheDocument();
    });

    it('combines custom className with default classes', () => {
      render(
        <ProfilePage
          profile={mockProfile}
          userId="user456"
          isOwnProfile={false}
          currentUser={mockUser}
          currentOrganization={mockOrganization}
          className="custom-class"
        />
      );

      const container = document.querySelector('.mt-6.lg\\:mt-8.custom-class');
      expect(container).toBeInTheDocument();
    });
  });
});