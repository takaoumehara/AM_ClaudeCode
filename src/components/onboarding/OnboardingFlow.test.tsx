import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OnboardingFlow } from './OnboardingFlow';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { getUserInvitations, acceptInvitation, declineInvitation } from '@/lib/firebase/organizations';

// Mock the dependencies
jest.mock('@/contexts/AuthContext');
jest.mock('@/contexts/OrganizationContext');
jest.mock('@/lib/firebase/organizations');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseOrganization = useOrganization as jest.MockedFunction<typeof useOrganization>;
const mockGetUserInvitations = getUserInvitations as jest.MockedFunction<typeof getUserInvitations>;
const mockAcceptInvitation = acceptInvitation as jest.MockedFunction<typeof acceptInvitation>;
const mockDeclineInvitation = declineInvitation as jest.MockedFunction<typeof declineInvitation>;

const mockUser = {
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
};

const mockOrganization = {
  id: 'org-1',
  name: 'Test Organization',
  admins: ['test-user-id'],
  members: ['test-user-id'],
  orgProfileTemplate: {
    fields: [
      { key: 'name', type: 'text', required: true, publicDefault: true },
      { key: 'title', type: 'text', required: true, publicDefault: true },
    ],
  },
  teams: [],
  projects: [],
  inviteLinks: [],
  tags: [],
  description: 'A test organization',
};

const mockInvitation = {
  id: 'invitation-1',
  organizationId: 'org-2',
  organizationName: 'Another Organization',
  email: 'test@example.com',
  invitedBy: 'inviter-id',
  inviterName: 'John Doe',
  status: 'pending' as const,
  createdAt: new Date(),
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
};

describe('OnboardingFlow', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      login: jest.fn(),
      logout: jest.fn(),
      loading: false,
    });

    mockUseOrganization.mockReturnValue({
      organizations: [],
      currentOrganization: null,
      loading: false,
      setCurrentOrganization: jest.fn(),
      createNewOrganization: jest.fn(),
      joinExistingOrganization: jest.fn(),
      refreshOrganizations: jest.fn(),
    });

    mockGetUserInvitations.mockResolvedValue([]);
    mockAcceptInvitation.mockResolvedValue();
    mockDeclineInvitation.mockResolvedValue();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<OnboardingFlow />);
    expect(screen.getByText('Loading your workspace...')).toBeInTheDocument();
  });

  it('displays invitations when user has pending invitations', async () => {
    mockGetUserInvitations.mockResolvedValue([mockInvitation]);

    render(<OnboardingFlow />);

    await waitFor(() => {
      expect(screen.getByText("You've Been Invited!")).toBeInTheDocument();
      expect(screen.getByText('Another Organization')).toBeInTheDocument();
      expect(screen.getByText('Invited by John Doe')).toBeInTheDocument();
    });
  });

  it('allows accepting invitations', async () => {
    mockGetUserInvitations.mockResolvedValue([mockInvitation]);
    const mockRefreshOrganizations = jest.fn();
    mockUseOrganization.mockReturnValue({
      organizations: [],
      currentOrganization: null,
      loading: false,
      setCurrentOrganization: jest.fn(),
      createNewOrganization: jest.fn(),
      joinExistingOrganization: jest.fn(),
      refreshOrganizations: mockRefreshOrganizations,
    });

    render(<OnboardingFlow />);

    await waitFor(() => {
      expect(screen.getByText('Another Organization')).toBeInTheDocument();
    });

    const acceptButton = screen.getByText('Accept');
    fireEvent.click(acceptButton);

    await waitFor(() => {
      expect(mockAcceptInvitation).toHaveBeenCalledWith('invitation-1', 'test-user-id');
      expect(mockRefreshOrganizations).toHaveBeenCalled();
    });
  });

  it('allows declining invitations with feedback', async () => {
    mockGetUserInvitations.mockResolvedValue([mockInvitation]);

    render(<OnboardingFlow />);

    await waitFor(() => {
      expect(screen.getByText('Another Organization')).toBeInTheDocument();
    });

    // Click decline button
    const declineButton = screen.getByText('Decline');
    fireEvent.click(declineButton);

    // Should show feedback form
    const feedbackTextarea = screen.getByPlaceholderText(
      "Optional: Let them know why you're declining"
    );
    expect(feedbackTextarea).toBeInTheDocument();

    // Enter feedback and confirm decline
    fireEvent.change(feedbackTextarea, { target: { value: 'Not interested right now' } });
    
    const confirmDeclineButton = screen.getAllByText('Decline')[1]; // Second "Decline" button in form
    fireEvent.click(confirmDeclineButton);

    await waitFor(() => {
      expect(mockDeclineInvitation).toHaveBeenCalledWith('invitation-1', 'Not interested right now');
    });
  });

  it('shows discovery step when user has organizations but no invitations', async () => {
    mockGetUserInvitations.mockResolvedValue([]);
    mockUseOrganization.mockReturnValue({
      organizations: [mockOrganization],
      currentOrganization: null,
      loading: false,
      setCurrentOrganization: jest.fn(),
      createNewOrganization: jest.fn(),
      joinExistingOrganization: jest.fn(),
      refreshOrganizations: jest.fn(),
    });

    render(<OnboardingFlow />);

    await waitFor(() => {
      expect(screen.getByText('Choose Your Organization')).toBeInTheDocument();
      expect(screen.getByText('Test Organization')).toBeInTheDocument();
      expect(screen.getByText('Select as Primary')).toBeInTheDocument();
    });
  });

  it('allows creating new organization', async () => {
    mockGetUserInvitations.mockResolvedValue([]);
    const mockCreateNewOrganization = jest.fn().mockResolvedValue('new-org-id');
    const mockRefreshOrganizations = jest.fn();
    
    mockUseOrganization.mockReturnValue({
      organizations: [],
      currentOrganization: null,
      loading: false,
      setCurrentOrganization: jest.fn(),
      createNewOrganization: mockCreateNewOrganization,
      joinExistingOrganization: jest.fn(),
      refreshOrganizations: mockRefreshOrganizations,
    });

    render(<OnboardingFlow />);

    await waitFor(() => {
      expect(screen.getByText('Choose Your Organization')).toBeInTheDocument();
    });

    // Click create organization button
    const createButton = screen.getByText('+ Create New Organization');
    fireEvent.click(createButton);

    // Should show create form
    const nameInput = screen.getByPlaceholderText('Organization name');
    expect(nameInput).toBeInTheDocument();

    // Enter organization name and create
    fireEvent.change(nameInput, { target: { value: 'My New Organization' } });
    
    const confirmCreateButton = screen.getByText('Create');
    fireEvent.click(confirmCreateButton);

    await waitFor(() => {
      expect(mockCreateNewOrganization).toHaveBeenCalledWith('My New Organization');
      expect(mockRefreshOrganizations).toHaveBeenCalled();
    });
  });

  it('handles errors gracefully', async () => {
    mockGetUserInvitations.mockRejectedValue(new Error('Failed to load invitations'));

    render(<OnboardingFlow />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load invitations')).toBeInTheDocument();
      // Should fallback to discovery step
      expect(screen.getByText('Choose Your Organization')).toBeInTheDocument();
    });
  });
});