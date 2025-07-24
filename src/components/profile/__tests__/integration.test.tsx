import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ProfilePage } from '../ProfilePage';
import { ProfileHero } from '../ProfileHero';
import { SkillsSection } from '../SkillsSection';
import { PersonalSection } from '../PersonalSection';
import { ExperienceSection } from '../ExperienceSection';
import { CollapsibleSection } from '../../common/CollapsibleSection';
import { UserProfile } from '@/lib/firebase/profiles';

// Mock the visibility hook with realistic behavior
jest.mock('@/hooks/useProfileVisibility', () => ({
  useProfileVisibility: jest.fn(),
}));

import { useProfileVisibility } from '@/hooks/useProfileVisibility';
const mockUseProfileVisibility = useProfileVisibility as jest.MockedFunction<typeof useProfileVisibility>;

const mockProfile: UserProfile = {
  core: {
    name: 'Jane Smith',
    mainTitle: 'Senior UX Designer',
    photoUrl: 'https://example.com/jane.jpg',
    mainSkills: ['Figma', 'User Research', 'Prototyping', 'Design Systems', 'Accessibility'],
    teamIds: ['design-team', 'product-team', 'research-team']
  },
  personal: {
    motto: 'Design with empathy, build with purpose',
    hobbies: ['Photography', 'Hiking', 'Cooking', 'Reading'],
    favorites: ['Coffee', 'Minimalist design', 'Nature documentaries'],
    learning: ['AR/VR Design', 'Voice UI', 'Sustainable Design'],
    activities: ['Mentoring junior designers', 'Speaking at conferences', 'Running design workshops'],
    customFields: {
      yearsOfExperience: '8 years',
      specialization: 'Mobile App Design',
      certifications: 'Certified UX Professional'
    },
    show: {
      skills: true,
      personal: true,
      experience: { 'org1': true, all: false },
      contact: false
    }
  },
  profiles: {}
};

const mockUser = {
  uid: 'user123',
  email: 'user@example.com',
  displayName: 'Current User'
};

const mockOrganization = {
  id: 'org1',
  name: 'Design Studio Inc'
};

describe('Profile Integration Tests', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete Profile Display', () => {
    it('renders a complete profile with all sections visible', async () => {
      mockUseProfileVisibility.mockReturnValue({
        visibleProfile: mockProfile,
        canViewSection: jest.fn().mockReturnValue(true),
        getVisibilityReason: jest.fn().mockReturnValue(''),
        sectionVisibility: {
          core: true,
          skills: true,
          personal: true,
          experience: true,
          contact: true
        },
        getVisibilityLevel: jest.fn().mockReturnValue('full'),
        getHiddenSectionsCount: jest.fn().mockReturnValue(0),
        visibilityContext: { isOwnProfile: false }
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

      // Verify all main sections are rendered
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Senior UX Designer')).toBeInTheDocument();
      expect(screen.getByText('Skills & Expertise')).toBeInTheDocument();
      expect(screen.getByText('Personal Information')).toBeInTheDocument();
      expect(screen.getByText('Teams & Experience')).toBeInTheDocument();

      // Verify specific content is displayed
      expect(screen.getByText('Figma')).toBeInTheDocument();
      expect(screen.getByText('Photography')).toBeInTheDocument();
      expect(screen.getByText('design-team')).toBeInTheDocument();
      
      // Verify sidebar elements
      expect(screen.getByText('Quick Info')).toBeInTheDocument();
      expect(screen.getByText('Personal Motto')).toBeInTheDocument();
      expect(screen.getByText('"Design with empathy, build with purpose"')).toBeInTheDocument();
    });

    it('handles partial visibility correctly', () => {
      const mockCanViewSection = jest.fn()
        .mockReturnValueOnce(true)  // core
        .mockReturnValueOnce(true)  // skills
        .mockReturnValueOnce(false) // personal
        .mockReturnValueOnce(true)  // experience
        .mockReturnValueOnce(false); // contact

      mockUseProfileVisibility.mockReturnValue({
        visibleProfile: {
          ...mockProfile,
          personal: undefined // Hidden personal section
        },
        canViewSection: mockCanViewSection,
        getVisibilityReason: jest.fn().mockImplementation((section) => {
          if (section === 'personal') return 'User has kept personal information private';
          if (section === 'contact') return 'Contact information is private';
          return '';
        }),
        sectionVisibility: {
          core: true,
          skills: true,
          personal: false,
          experience: true,
          contact: false
        },
        getVisibilityLevel: jest.fn().mockReturnValue('partial'),
        getHiddenSectionsCount: jest.fn().mockReturnValue(2),
        visibilityContext: { isOwnProfile: false }
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

      // Visible sections should be present
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Skills & Expertise')).toBeInTheDocument();
      expect(screen.getByText('Teams & Experience')).toBeInTheDocument();

      // Hidden sections should not be present
      expect(screen.queryByText('Personal Information')).not.toBeInTheDocument();
      expect(screen.queryByText('Photography')).not.toBeInTheDocument();
      expect(screen.queryByText('Personal Motto')).not.toBeInTheDocument();
    });
  });

  describe('Own Profile vs Other Profile', () => {
    it('shows edit buttons for own profile', () => {
      mockUseProfileVisibility.mockReturnValue({
        visibleProfile: mockProfile,
        canViewSection: jest.fn().mockReturnValue(true),
        getVisibilityReason: jest.fn().mockReturnValue(''),
        sectionVisibility: {
          core: true,
          skills: true,
          personal: true,
          experience: true,
          contact: true
        },
        getVisibilityLevel: jest.fn().mockReturnValue('full'),
        getHiddenSectionsCount: jest.fn().mockReturnValue(0),
        visibilityContext: { isOwnProfile: true }
      });

      render(
        <ProfilePage
          profile={mockProfile}
          userId="user123" // Same as mockUser.uid
          isOwnProfile={true}
          currentUser={mockUser}
          currentOrganization={mockOrganization}
        />
      );

      // Should show profile completeness for own profile
      expect(screen.getByText(/completion/i)).toBeInTheDocument();

      // Should not show connect actions for own profile
      expect(screen.queryByText('Connect')).not.toBeInTheDocument();
      expect(screen.queryByText('Send Message')).not.toBeInTheDocument();

      // Should not show privacy notice for own profile  
      expect(screen.queryByText(/You're viewing.*profile/)).not.toBeInTheDocument();
    });

    it('shows connect actions for other profiles', () => {
      mockUseProfileVisibility.mockReturnValue({
        visibleProfile: mockProfile,
        canViewSection: jest.fn().mockReturnValue(true),
        getVisibilityReason: jest.fn().mockReturnValue(''),
        sectionVisibility: {
          core: true,
          skills: true,
          personal: true,
          experience: true,
          contact: true
        },
        getVisibilityLevel: jest.fn().mockReturnValue('full'),
        getHiddenSectionsCount: jest.fn().mockReturnValue(0),
        visibilityContext: { isOwnProfile: false }
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

      // Should not show profile completeness for other profiles
      expect(screen.queryByText(/completion/i)).not.toBeInTheDocument();

      // Should show connect actions
      expect(screen.getByText('Connect')).toBeInTheDocument();
      expect(screen.getByText('Send Message')).toBeInTheDocument();
      expect(screen.getByText('Add to Team')).toBeInTheDocument();

      // Should show privacy notice
      expect(screen.getByText(/You're viewing Jane Smith's profile/)).toBeInTheDocument();
    });
  });

  describe('Responsive Layout Integration', () => {
    it('applies responsive layout correctly across all components', () => {
      mockUseProfileVisibility.mockReturnValue({
        visibleProfile: mockProfile,
        canViewSection: jest.fn().mockReturnValue(true),
        getVisibilityReason: jest.fn().mockReturnValue(''),
        sectionVisibility: {
          core: true,
          skills: true,
          personal: true,
          experience: true,
          contact: true
        },
        getVisibilityLevel: jest.fn().mockReturnValue('full'),
        getHiddenSectionsCount: jest.fn().mockReturnValue(0),
        visibilityContext: { isOwnProfile: false }
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

      // Check main responsive grid
      const mainGrid = document.querySelector('.grid.grid-cols-1.lg\\:grid-cols-3');
      expect(mainGrid).toBeInTheDocument();

      // Check responsive spacing
      const spacingElements = document.querySelectorAll('.gap-6.lg\\:gap-8');
      expect(spacingElements.length).toBeGreaterThan(0);

      // Check responsive text sizes in sidebar
      const quickInfoTitle = screen.getByText('Quick Info');
      expect(quickInfoTitle).toHaveClass('text-base', 'sm:text-lg');
    });

    it('handles mobile collapsible sections correctly', async () => {
      render(
        <CollapsibleSection 
          title="Test Mobile Section" 
          defaultExpanded={false}
          expandOnDesktop={true}
        >
          <div>Collapsible Content</div>
        </CollapsibleSection>
      );

      // Content should be hidden on mobile initially
      expect(screen.getByText('Collapsible Content')).not.toBeVisible();

      // But button should be enabled for mobile interaction
      const headerButton = screen.getByRole('button');
      expect(headerButton).not.toBeDisabled(); // Note: disabled state is for desktop only

      // Click should toggle visibility
      await user.click(headerButton);
      expect(screen.getByText('Collapsible Content')).toBeVisible();
    });
  });

  describe('Individual Component Integration', () => {
    it('integrates ProfileHero with responsive design', () => {
      render(
        <ProfileHero
          profile={mockProfile}
          userId="user456"
          isOwnProfile={false}
          currentUser={mockUser}
        />
      );

      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Senior UX Designer')).toBeInTheDocument();

      // Check responsive photo sizing
      const profilePhoto = document.querySelector('.w-24.h-24.sm\\:w-32.sm\\:h-32');
      expect(profilePhoto).toBeInTheDocument();

      // Check responsive background
      const background = document.querySelector('.h-24.sm\\:h-32');
      expect(background).toBeInTheDocument();
    });

    it('integrates SkillsSection with large skill sets', () => {
      render(
        <SkillsSection
          skills={mockProfile.core.mainSkills!}
          isOwnProfile={false}
        />
      );

      expect(screen.getByText('Skills & Expertise')).toBeInTheDocument();
      expect(screen.getByText('Total Skills: 5')).toBeInTheDocument();
      
      // Check skills are displayed
      expect(screen.getByText('Figma')).toBeInTheDocument();
      expect(screen.getByText('User Research')).toBeInTheDocument();
      expect(screen.getByText('Accessibility')).toBeInTheDocument();
    });

    it('integrates PersonalSection with CollapsibleSection', () => {
      render(
        <PersonalSection
          personal={mockProfile.personal!}
          isOwnProfile={false}
        />
      );

      expect(screen.getByText('Personal Information')).toBeInTheDocument();
      expect(screen.getByText('Photography')).toBeInTheDocument();
      expect(screen.getByText('AR/VR Design')).toBeInTheDocument();
      expect(screen.getByText('"Design with empathy, build with purpose"')).toBeInTheDocument();
    });

    it('integrates ExperienceSection with team data', () => {
      render(
        <ExperienceSection
          teamIds={mockProfile.core.teamIds!}
          isOwnProfile={false}
        />
      );

      expect(screen.getByText('Teams & Experience')).toBeInTheDocument();
      expect(screen.getByText('Current Teams (3)')).toBeInTheDocument();
      
      // Check team cards are displayed
      expect(screen.getByText('Design Team')).toBeInTheDocument();
      expect(screen.getByText('Product Team')).toBeInTheDocument();
      expect(screen.getByText('Research Team')).toBeInTheDocument();
    });
  });

  describe('Data Flow Integration', () => {
    it('passes correct props through component hierarchy', () => {
      const mockCanViewSection = jest.fn().mockReturnValue(true);
      
      mockUseProfileVisibility.mockReturnValue({
        visibleProfile: mockProfile,
        canViewSection: mockCanViewSection,
        getVisibilityReason: jest.fn().mockReturnValue(''),
        sectionVisibility: {
          core: true,
          skills: true,
          personal: true,
          experience: true,
          contact: true
        },
        getVisibilityLevel: jest.fn().mockReturnValue('full'),
        getHiddenSectionsCount: jest.fn().mockReturnValue(0),
        visibilityContext: { isOwnProfile: false }
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

      // Verify visibility hook is called with correct parameters
      expect(mockUseProfileVisibility).toHaveBeenCalledWith(
        mockProfile,
        mockUser,
        mockOrganization,
        false
      );

      // Verify canViewSection is called for each section
      expect(mockCanViewSection).toHaveBeenCalledWith('skills');
      expect(mockCanViewSection).toHaveBeenCalledWith('personal');
      expect(mockCanViewSection).toHaveBeenCalledWith('experience');
    });

    it('handles visibility changes correctly', () => {
      const { rerender } = render(
        <ProfilePage
          profile={mockProfile}
          userId="user456"
          isOwnProfile={false}
          currentUser={mockUser}
          currentOrganization={mockOrganization}
        />
      );

      // Initially all sections visible
      mockUseProfileVisibility.mockReturnValue({
        visibleProfile: mockProfile,
        canViewSection: jest.fn().mockReturnValue(true),
        getVisibilityReason: jest.fn().mockReturnValue(''),
        sectionVisibility: {
          core: true,
          skills: true,
          personal: true,
          experience: true,
          contact: true
        },
        getVisibilityLevel: jest.fn().mockReturnValue('full'),
        getHiddenSectionsCount: jest.fn().mockReturnValue(0),
        visibilityContext: { isOwnProfile: false }
      });

      expect(screen.getByText('Personal Information')).toBeInTheDocument();

      // Change visibility to hide personal section
      const mockCanViewSectionRestricted = jest.fn()
        .mockImplementation((section) => section !== 'personal');
      
      mockUseProfileVisibility.mockReturnValue({
        visibleProfile: {
          ...mockProfile,
          personal: undefined
        },
        canViewSection: mockCanViewSectionRestricted,
        getVisibilityReason: jest.fn().mockReturnValue('Private section'),
        sectionVisibility: {
          core: true,
          skills: true,
          personal: false,
          experience: true,
          contact: true
        },
        getVisibilityLevel: jest.fn().mockReturnValue('partial'),
        getHiddenSectionsCount: jest.fn().mockReturnValue(1),
        visibilityContext: { isOwnProfile: false }
      });

      rerender(
        <ProfilePage
          profile={mockProfile}
          userId="user456"
          isOwnProfile={false}
          currentUser={mockUser}
          currentOrganization={mockOrganization}
        />
      );

      expect(screen.queryByText('Personal Information')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling Integration', () => {
    it('handles incomplete profile data gracefully', () => {
      const incompleteProfile: UserProfile = {
        core: {
          name: 'Incomplete User',
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
        sectionVisibility: {
          core: true,
          skills: true,
          personal: false,
          experience: true,
          contact: true
        },
        getVisibilityLevel: jest.fn().mockReturnValue('minimal'),
        getHiddenSectionsCount: jest.fn().mockReturnValue(1),
        visibilityContext: { isOwnProfile: false }
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
      expect(screen.getByText('Incomplete User')).toBeInTheDocument();
      expect(screen.getByText('Skills & Expertise')).toBeInTheDocument();
      expect(screen.getByText('Teams & Experience')).toBeInTheDocument();
    });

    it('handles null context gracefully', () => {
      mockUseProfileVisibility.mockReturnValue({
        visibleProfile: mockProfile,
        canViewSection: jest.fn().mockReturnValue(true),
        getVisibilityReason: jest.fn().mockReturnValue(''),
        sectionVisibility: {
          core: true,
          skills: true,
          personal: true,
          experience: true,
          contact: true
        },
        getVisibilityLevel: jest.fn().mockReturnValue('full'),
        getHiddenSectionsCount: jest.fn().mockReturnValue(0),
        visibilityContext: { isOwnProfile: false }
      });

      render(
        <ProfilePage
          profile={mockProfile}
          userId="user456"
          isOwnProfile={false}
          currentUser={null}
          currentOrganization={null}
        />
      );

      // Should render without errors
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  describe('Accessibility Integration', () => {
    it('maintains proper focus management across components', async () => {
      render(
        <CollapsibleSection title="Focusable Section">
          <button>Inside Button</button>
          <input placeholder="Inside Input" />
        </CollapsibleSection>
      );

      const header = screen.getByRole('button', { name: /focusable section/i });
      const insideButton = screen.getByText('Inside Button');
      const insideInput = screen.getByPlaceholderText('Inside Input');

      // Focus should work correctly
      header.focus();
      expect(header).toHaveFocus();

      // Tab should move to inside elements
      await user.tab();
      expect(insideButton).toHaveFocus();

      await user.tab();
      expect(insideInput).toHaveFocus();
    });

    it('provides appropriate ARIA labels and roles', () => {
      mockUseProfileVisibility.mockReturnValue({
        visibleProfile: mockProfile,
        canViewSection: jest.fn().mockReturnValue(true),
        getVisibilityReason: jest.fn().mockReturnValue(''),
        sectionVisibility: {
          core: true,
          skills: true,
          personal: true,
          experience: true,
          contact: true
        },
        getVisibilityLevel: jest.fn().mockReturnValue('full'),
        getHiddenSectionsCount: jest.fn().mockReturnValue(0),
        visibilityContext: { isOwnProfile: false }
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

      // Check that headings have proper hierarchy
      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent('Jane Smith');

      const sectionHeadings = screen.getAllByRole('heading', { level: 2 });
      expect(sectionHeadings.length).toBeGreaterThan(0);
    });
  });
});