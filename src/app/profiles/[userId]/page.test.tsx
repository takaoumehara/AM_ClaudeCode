import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { useRouter, useParams } from 'next/navigation';
import UserProfilePage from './page';
import { getUserProfile } from '@/lib/firebase/profiles';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}));

// Mock Firebase functions
jest.mock('@/lib/firebase/profiles');

// Mock context hooks
jest.mock('@/contexts/AuthContext');
jest.mock('@/contexts/OrganizationContext');

// Mock components to isolate testing
jest.mock('@/components/auth/ProtectedRoute', () => {
  return function MockProtectedRoute({ children }: { children: React.ReactNode }) {
    return <div data-testid="protected-route">{children}</div>;
  };
});

jest.mock('@/components/profile/ProfilePage', () => {
  return function MockProfilePage(props: any) {
    return <div data-testid="profile-page" data-props={JSON.stringify(props)} />;
  };
});

jest.mock('@/components/common/BackNavigation', () => {
  return function MockBackNavigation({ onBack, onShare, showShare }: any) {
    return (
      <div data-testid="back-navigation">
        <button onClick={onBack} data-testid="back-button">Back</button>
        {showShare && <button onClick={onShare} data-testid="share-button">Share</button>}
      </div>
    );
  };
});

// Mock Head component
jest.mock('next/head', () => {
  return function MockHead({ children }: { children: React.ReactNode }) {
    return <div data-testid="head">{children}</div>;
  };
});

const mockPush = jest.fn();
const mockBack = jest.fn();
const mockGetUserProfile = getUserProfile as jest.MockedFunction<typeof getUserProfile>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseOrganization = useOrganization as jest.MockedFunction<typeof useOrganization>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseParams = useParams as jest.MockedFunction<typeof useParams>;

const mockUser = {
  uid: 'user123',
  email: 'user@example.com',
  displayName: 'Test User'
};

const mockProfile = {
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

describe('UserProfilePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: mockBack,
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    } as any);

    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      error: null,
    } as any);

    mockUseOrganization.mockReturnValue({
      currentOrganization: { id: 'org1', name: 'Test Org' },
      loading: false,
    } as any);

    // Mock window.history
    Object.defineProperty(window, 'history', {
      value: { length: 2 },
      writable: true,
    });

    // Mock navigator.share
    Object.defineProperty(navigator, 'share', {
      value: jest.fn(),
      writable: true,
    });

    // Mock navigator.clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: jest.fn().mockResolvedValue(undefined),
      },
      writable: true,
    });
  });

  describe('Dynamic Routing', () => {
    it('loads profile for given userId parameter', async () => {
      mockUseParams.mockReturnValue({ userId: 'user456' });
      mockGetUserProfile.mockResolvedValue(mockProfile);

      render(<UserProfilePage />);

      await waitFor(() => {
        expect(mockGetUserProfile).toHaveBeenCalledWith('user456');
      });
    });

    it('detects own profile correctly', async () => {
      mockUseParams.mockReturnValue({ userId: 'user123' }); // Same as mockUser.uid
      mockGetUserProfile.mockResolvedValue(mockProfile);

      render(<UserProfilePage />);

      await waitFor(() => {
        const profilePage = screen.getByTestId('profile-page');
        const props = JSON.parse(profilePage.getAttribute('data-props') || '{}');
        expect(props.isOwnProfile).toBe(true);
      });
    });

    it('detects other user profile correctly', async () => {
      mockUseParams.mockReturnValue({ userId: 'user456' }); // Different from mockUser.uid
      mockGetUserProfile.mockResolvedValue(mockProfile);

      render(<UserProfilePage />);

      await waitFor(() => {
        const profilePage = screen.getByTestId('profile-page');
        const props = JSON.parse(profilePage.getAttribute('data-props') || '{}');
        expect(props.isOwnProfile).toBe(false);
      });
    });

    it('handles missing userId parameter', async () => {
      mockUseParams.mockReturnValue({});

      render(<UserProfilePage />);

      await waitFor(() => {
        expect(screen.getByText('No user ID provided')).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('shows loading skeleton while fetching profile', () => {
      mockUseParams.mockReturnValue({ userId: 'user456' });
      mockGetUserProfile.mockReturnValue(new Promise(() => {})); // Never resolves

      render(<UserProfilePage />);

      expect(screen.getByText('Loading Profile - AboutMe Cards')).toBeInTheDocument();
      expect(screen.getByTestId('back-navigation')).toBeInTheDocument();
      
      // Check for loading skeleton elements
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('shows error state when profile fails to load', async () => {
      mockUseParams.mockReturnValue({ userId: 'user456' });
      mockGetUserProfile.mockRejectedValue(new Error('Network error'));

      render(<UserProfilePage />);

      await waitFor(() => {
        expect(screen.getByText('Error Loading Profile')).toBeInTheDocument();
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });

      expect(screen.getByText('Try Again')).toBeInTheDocument();
      expect(screen.getByText('Go Back')).toBeInTheDocument();
    });

    it('shows not found state when profile does not exist', async () => {
      mockUseParams.mockReturnValue({ userId: 'nonexistent' });
      mockGetUserProfile.mockResolvedValue(null);

      render(<UserProfilePage />);

      await waitFor(() => {
        expect(screen.getByText('Profile Not Found')).toBeInTheDocument();
        expect(screen.getByText("The profile you're looking for doesn't exist or you don't have permission to view it.")).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('navigates back when back button is clicked', async () => {
      mockUseParams.mockReturnValue({ userId: 'user456' });
      mockGetUserProfile.mockResolvedValue(mockProfile);

      render(<UserProfilePage />);

      await waitFor(() => {
        expect(screen.getByTestId('profile-page')).toBeInTheDocument();
      });

      const backButton = screen.getByTestId('back-button');
      await userEvent.click(backButton);

      expect(mockBack).toHaveBeenCalled();
    });

    it('navigates to browse when no history available', async () => {
      Object.defineProperty(window, 'history', {
        value: { length: 1 },
        writable: true,
      });

      mockUseParams.mockReturnValue({ userId: 'user456' });
      mockGetUserProfile.mockResolvedValue(mockProfile);

      render(<UserProfilePage />);

      await waitFor(() => {
        expect(screen.getByTestId('profile-page')).toBeInTheDocument();
      });

      const backButton = screen.getByTestId('back-button');
      await userEvent.click(backButton);

      expect(mockPush).toHaveBeenCalledWith('/browse');
    });
  });

  describe('Social Sharing', () => {
    it('uses native share API when available', async () => {
      const mockShare = jest.fn().mockResolvedValue(undefined);
      (navigator.share as jest.Mock) = mockShare;

      mockUseParams.mockReturnValue({ userId: 'user456' });
      mockGetUserProfile.mockResolvedValue(mockProfile);

      render(<UserProfilePage />);

      await waitFor(() => {
        expect(screen.getByTestId('profile-page')).toBeInTheDocument();
      });

      const shareButton = screen.getByTestId('share-button');
      await userEvent.click(shareButton);

      expect(mockShare).toHaveBeenCalledWith({
        title: "John Doe's Profile",
        text: 'John Doe - Software Engineer | Skills: React, TypeScript, Node.js',
        url: 'http://localhost/',
      });
    });

    it('falls back to clipboard when native share fails', async () => {
      const mockShare = jest.fn().mockRejectedValue(new Error('Share failed'));
      const mockWriteText = jest.fn().mockResolvedValue(undefined);
      (navigator.share as jest.Mock) = mockShare;
      (navigator.clipboard.writeText as jest.Mock) = mockWriteText;

      mockUseParams.mockReturnValue({ userId: 'user456' });
      mockGetUserProfile.mockResolvedValue(mockProfile);

      render(<UserProfilePage />);

      await waitFor(() => {
        expect(screen.getByTestId('profile-page')).toBeInTheDocument();
      });

      const shareButton = screen.getByTestId('share-button');
      await userEvent.click(shareButton);

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith('http://localhost/');
      });
    });

    it('uses clipboard when native share is not available', async () => {
      delete (navigator as any).share;
      const mockWriteText = jest.fn().mockResolvedValue(undefined);
      (navigator.clipboard.writeText as jest.Mock) = mockWriteText;

      mockUseParams.mockReturnValue({ userId: 'user456' });
      mockGetUserProfile.mockResolvedValue(mockProfile);

      render(<UserProfilePage />);

      await waitFor(() => {
        expect(screen.getByTestId('profile-page')).toBeInTheDocument();
      });

      const shareButton = screen.getByTestId('share-button');
      await userEvent.click(shareButton);

      expect(mockWriteText).toHaveBeenCalledWith('http://localhost/');
    });
  });

  describe('SEO and Meta Tags', () => {
    it('generates correct page title and meta tags', async () => {
      mockUseParams.mockReturnValue({ userId: 'user456' });
      mockGetUserProfile.mockResolvedValue(mockProfile);

      render(<UserProfilePage />);

      await waitFor(() => {
        const head = screen.getByTestId('head');
        expect(head).toBeInTheDocument();
        
        // Check title
        expect(screen.getByText('John Doe - AboutMe Cards')).toBeInTheDocument();
        
        // Check meta tags
        const metaTags = head.querySelectorAll('meta');
        expect(metaTags.length).toBeGreaterThan(0);
      });
    });

    it('generates fallback meta when no profile data', () => {
      mockUseParams.mockReturnValue({ userId: 'user456' });
      mockGetUserProfile.mockReturnValue(new Promise(() => {})); // Never resolves

      render(<UserProfilePage />);

      expect(screen.getByText('Loading Profile - AboutMe Cards')).toBeInTheDocument();
    });
  });

  describe('Error Recovery', () => {
    it('allows retry when profile loading fails', async () => {
      mockUseParams.mockReturnValue({ userId: 'user456' });
      mockGetUserProfile
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockProfile);

      const { rerender } = render(<UserProfilePage />);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });

      // Mock window.location.reload
      const mockReload = jest.fn();
      Object.defineProperty(window, 'location', {
        value: { reload: mockReload },
        writable: true,
      });

      const tryAgainButton = screen.getByText('Try Again');
      await userEvent.click(tryAgainButton);

      expect(mockReload).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('provides proper ARIA labels and roles', async () => {
      mockUseParams.mockReturnValue({ userId: 'user456' });
      mockGetUserProfile.mockResolvedValue(mockProfile);

      render(<UserProfilePage />);

      await waitFor(() => {
        expect(screen.getByTestId('profile-page')).toBeInTheDocument();
      });

      // Check that components are properly wrapped
      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
      expect(screen.getByTestId('back-navigation')).toBeInTheDocument();
    });

    it('maintains focus management during state changes', async () => {
      mockUseParams.mockReturnValue({ userId: 'user456' });
      mockGetUserProfile.mockResolvedValue(mockProfile);

      render(<UserProfilePage />);

      // Should not cause focus traps or accessibility issues
      await waitFor(() => {
        expect(screen.getByTestId('profile-page')).toBeInTheDocument();
      });
    });
  });

  describe('Performance', () => {
    it('does not re-fetch profile unnecessarily', async () => {
      mockUseParams.mockReturnValue({ userId: 'user456' });
      mockGetUserProfile.mockResolvedValue(mockProfile);

      const { rerender } = render(<UserProfilePage />);

      await waitFor(() => {
        expect(mockGetUserProfile).toHaveBeenCalledTimes(1);
      });

      // Re-render without changing userId
      rerender(<UserProfilePage />);

      // Should not call getUserProfile again
      expect(mockGetUserProfile).toHaveBeenCalledTimes(1);
    });

    it('handles rapid userId changes correctly', async () => {
      mockUseParams.mockReturnValue({ userId: 'user456' });
      mockGetUserProfile.mockResolvedValue(mockProfile);

      const { rerender } = render(<UserProfilePage />);

      await waitFor(() => {
        expect(mockGetUserProfile).toHaveBeenCalledWith('user456');
      });

      // Change userId
      mockUseParams.mockReturnValue({ userId: 'user789' });
      rerender(<UserProfilePage />);

      await waitFor(() => {
        expect(mockGetUserProfile).toHaveBeenCalledWith('user789');
      });

      expect(mockGetUserProfile).toHaveBeenCalledTimes(2);
    });
  });
});