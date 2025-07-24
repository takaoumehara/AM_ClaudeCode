import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';
import { signInWithEmail, signInWithGoogle } from '@/lib/firebase/auth';

// Mock the auth functions
jest.mock('@/lib/firebase/auth', () => ({
  signInWithEmail: jest.fn(),
  signInWithGoogle: jest.fn(),
}));

// Mock the router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form elements', () => {
    render(<LoginForm />);
    
    expect(screen.getByText('Sign In to AboutMe Cards')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();
  });

  it('shows validation error for empty fields', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);
    
    expect(screen.getByText('Please fill in all fields')).toBeInTheDocument();
  });

  it('calls signInWithEmail on form submission', async () => {
    const user = userEvent.setup();
    const mockSignInWithEmail = signInWithEmail as jest.MockedFunction<typeof signInWithEmail>;
    mockSignInWithEmail.mockResolvedValueOnce({} as any);
    
    render(<LoginForm />);
    
    await user.type(screen.getByLabelText('Email Address'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(mockSignInWithEmail).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('calls Google sign in on Google button click', async () => {
    const user = userEvent.setup();
    const mockSignInWithGoogle = signInWithGoogle as jest.MockedFunction<typeof signInWithGoogle>;
    mockSignInWithGoogle.mockResolvedValueOnce({} as any);
    
    render(<LoginForm />);
    
    await user.click(screen.getByRole('button', { name: /continue with google/i }));
    
    await waitFor(() => {
      expect(mockSignInWithGoogle).toHaveBeenCalled();
    });
  });

  it('displays error message on authentication failure', async () => {
    const user = userEvent.setup();
    const mockSignInWithEmail = signInWithEmail as jest.MockedFunction<typeof signInWithEmail>;
    mockSignInWithEmail.mockRejectedValueOnce(new Error('Invalid credentials'));
    
    render(<LoginForm />);
    
    await user.type(screen.getByLabelText('Email Address'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('disables form elements while loading', async () => {
    const user = userEvent.setup();
    const mockSignInWithEmail = signInWithEmail as jest.MockedFunction<typeof signInWithEmail>;
    
    // Mock a slow response
    mockSignInWithEmail.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));
    
    render(<LoginForm />);
    
    await user.type(screen.getByLabelText('Email Address'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Check that elements are disabled during loading
    expect(screen.getByLabelText('Email Address')).toBeDisabled();
    expect(screen.getByLabelText('Password')).toBeDisabled();
    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
  });
});