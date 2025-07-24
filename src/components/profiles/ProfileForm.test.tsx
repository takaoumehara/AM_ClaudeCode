import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileForm } from './ProfileForm';
import { useAuth } from '@/contexts/AuthContext';
import * as profileUtils from '@/lib/firebase/profiles';

// Mock Firebase utilities
jest.mock('@/lib/firebase/profiles', () => ({
  getUserProfile: jest.fn(),
  updateUserCore: jest.fn(),
  searchSkills: jest.fn(),
}));

// Mock auth context
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockGetUserProfile = profileUtils.getUserProfile as jest.MockedFunction<typeof profileUtils.getUserProfile>;
const mockUpdateUserCore = profileUtils.updateUserCore as jest.MockedFunction<typeof profileUtils.updateUserCore>;
const mockSearchSkills = profileUtils.searchSkills as jest.MockedFunction<typeof profileUtils.searchSkills>;

const mockUser = {
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
};

describe('ProfileForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      signInWithEmail: jest.fn(),
      signUpWithEmail: jest.fn(),
      signInWithGoogle: jest.fn(),
      logout: jest.fn(),
    });
  });

  it('renders form fields correctly', () => {
    render(<ProfileForm />);

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/main title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/main skills/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save profile/i })).toBeInTheDocument();
  });

  it('displays loading state while fetching profile', async () => {
    mockGetUserProfile.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<ProfileForm />);

    expect(screen.getByTestId('loading-spinner') || screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('loads existing profile data', async () => {
    const mockProfile = {
      core: {
        name: 'John Doe',
        mainTitle: 'Software Engineer',
        mainSkills: ['JavaScript', 'React'],
        teamIds: [],
        photoUrl: '',
      },
      personal: {},
      profiles: {},
    };

    mockGetUserProfile.mockResolvedValue(mockProfile);

    render(<ProfileForm />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Software Engineer')).toBeInTheDocument();
      expect(screen.getByText('JavaScript')).toBeInTheDocument();
      expect(screen.getByText('React')).toBeInTheDocument();
    });
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(<ProfileForm />);

    const submitButton = screen.getByRole('button', { name: /save profile/i });
    await user.click(submitButton);

    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    const mockOnSave = jest.fn();
    mockUpdateUserCore.mockResolvedValue(undefined);

    render(<ProfileForm onSave={mockOnSave} />);

    // Fill in the form
    const nameInput = screen.getByLabelText(/full name/i);
    const titleInput = screen.getByLabelText(/main title/i);

    await user.type(nameInput, 'Jane Smith');
    await user.type(titleInput, 'Product Manager');

    const submitButton = screen.getByRole('button', { name: /save profile/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockUpdateUserCore).toHaveBeenCalledWith('test-user-id', {
        name: 'Jane Smith',
        mainTitle: 'Product Manager',
        mainSkills: [],
        teamIds: [],
        photoUrl: '',
      });
    });

    expect(mockOnSave).toHaveBeenCalled();
    expect(screen.getByText(/profile saved successfully/i)).toBeInTheDocument();
  });

  it('handles skill addition and removal', async () => {
    const user = userEvent.setup();
    mockSearchSkills.mockResolvedValue([
      { id: '1', name: 'JavaScript', synonyms: ['JS'], orgIds: [] },
      { id: '2', name: 'TypeScript', synonyms: ['TS'], orgIds: [] },
    ]);

    render(<ProfileForm />);

    const skillInput = screen.getByPlaceholderText(/add a skill/i);

    // Type to trigger search
    await user.type(skillInput, 'Java');

    await waitFor(() => {
      expect(screen.getByText('JavaScript')).toBeInTheDocument();
    });

    // Click on suggestion
    await user.click(screen.getByText('JavaScript'));

    // Verify skill was added
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(skillInput).toHaveValue('');

    // Remove skill
    const removeButton = screen.getByText('×');
    await user.click(removeButton);

    // Verify skill was removed
    expect(screen.queryByText('JavaScript')).not.toBeInTheDocument();
  });

  it('handles skill input with Enter key', async () => {
    const user = userEvent.setup();
    mockSearchSkills.mockResolvedValue([
      { id: '1', name: 'React', synonyms: [], orgIds: [] },
    ]);

    render(<ProfileForm />);

    const skillInput = screen.getByPlaceholderText(/add a skill/i);

    await user.type(skillInput, 'React');

    await waitFor(() => {
      expect(screen.getByText('React')).toBeInTheDocument();
    });

    // Press Enter to add the first suggestion
    await user.keyboard('{Enter}');

    // Verify skill was added
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(skillInput).toHaveValue('');
  });

  it('displays error message on save failure', async () => {
    const user = userEvent.setup();
    mockUpdateUserCore.mockRejectedValue(new Error('Network error'));

    render(<ProfileForm />);

    const nameInput = screen.getByLabelText(/full name/i);
    await user.type(nameInput, 'Test User');

    const submitButton = screen.getByRole('button', { name: /save profile/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to save profile/i)).toBeInTheDocument();
    });
  });

  it('shows saving state during form submission', async () => {
    const user = userEvent.setup();
    let resolvePromise: () => void;
    const savePromise = new Promise<void>((resolve) => {
      resolvePromise = resolve;
    });
    mockUpdateUserCore.mockReturnValue(savePromise);

    render(<ProfileForm />);

    const nameInput = screen.getByLabelText(/full name/i);
    await user.type(nameInput, 'Test User');

    const submitButton = screen.getByRole('button', { name: /save profile/i });
    await user.click(submitButton);

    // Check saving state
    expect(screen.getByText(/saving/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    // Resolve the promise
    resolvePromise!();
    await waitFor(() => {
      expect(screen.queryByText(/saving/i)).not.toBeInTheDocument();
    });
  });

  it('renders with initial data prop', () => {
    const initialData = {
      name: 'Initial Name',
      mainTitle: 'Initial Title',
      mainSkills: ['Initial Skill'],
      teamIds: [],
      photoUrl: '',
    };

    render(<ProfileForm initialData={initialData} />);

    expect(screen.getByDisplayValue('Initial Name')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Initial Title')).toBeInTheDocument();
    expect(screen.getByText('Initial Skill')).toBeInTheDocument();
  });
});