import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ImageUpload } from './ImageUpload';
import { useAuth } from '@/contexts/AuthContext';
import * as profileUtils from '@/lib/firebase/profiles';

// Mock Firebase utilities
jest.mock('@/lib/firebase/profiles', () => ({
  uploadProfilePhoto: jest.fn(),
  deleteProfilePhoto: jest.fn(),
}));

// Mock auth context
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUploadProfilePhoto = profileUtils.uploadProfilePhoto as jest.MockedFunction<typeof profileUtils.uploadProfilePhoto>;
const mockDeleteProfilePhoto = profileUtils.deleteProfilePhoto as jest.MockedFunction<typeof profileUtils.deleteProfilePhoto>;

const mockUser = {
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
};

// Mock FileReader
const mockFileReader = {
  readAsDataURL: jest.fn(),
  result: 'data:image/jpeg;base64,mockbase64data',
  onload: null as any,
};

global.FileReader = jest.fn().mockImplementation(() => mockFileReader);

describe('ImageUpload', () => {
  const mockOnPhotoUpdate = jest.fn();
  const mockOnPhotoRemove = jest.fn();

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

  it('renders upload button when no photo', () => {
    render(
      <ImageUpload
        onPhotoUpdate={mockOnPhotoUpdate}
        onPhotoRemove={mockOnPhotoRemove}
      />
    );

    expect(screen.getByText(/upload photo/i)).toBeInTheDocument();
    expect(screen.queryByText(/remove/i)).not.toBeInTheDocument();
  });

  it('renders change and remove buttons when photo exists', () => {
    render(
      <ImageUpload
        currentPhotoUrl="http://example.com/photo.jpg"
        onPhotoUpdate={mockOnPhotoUpdate}
        onPhotoRemove={mockOnPhotoRemove}
      />
    );

    expect(screen.getByText(/change photo/i)).toBeInTheDocument();
    expect(screen.getByText(/remove/i)).toBeInTheDocument();
  });

  it('displays current photo when provided', () => {
    const photoUrl = 'http://example.com/photo.jpg';
    
    render(
      <ImageUpload
        currentPhotoUrl={photoUrl}
        onPhotoUpdate={mockOnPhotoUpdate}
        onPhotoRemove={mockOnPhotoRemove}
      />
    );

    const image = screen.getByAltText('Profile');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', photoUrl);
  });

  it('validates file type', async () => {
    const user = userEvent.setup();
    
    render(
      <ImageUpload
        onPhotoUpdate={mockOnPhotoUpdate}
        onPhotoRemove={mockOnPhotoRemove}
      />
    );

    const uploadButton = screen.getByText(/upload photo/i);
    await user.click(uploadButton);

    const fileInput = screen.getByDisplayValue('') as HTMLInputElement;
    
    // Create a non-image file
    const textFile = new File(['hello'], 'hello.txt', { type: 'text/plain' });
    
    await user.upload(fileInput, textFile);

    expect(screen.getByText(/please select an image file/i)).toBeInTheDocument();
  });

  it('validates file size', async () => {
    const user = userEvent.setup();
    
    render(
      <ImageUpload
        onPhotoUpdate={mockOnPhotoUpdate}
        onPhotoRemove={mockOnPhotoRemove}
      />
    );

    const uploadButton = screen.getByText(/upload photo/i);
    await user.click(uploadButton);

    const fileInput = screen.getByDisplayValue('') as HTMLInputElement;
    
    // Create a large file (6MB)
    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
    
    await user.upload(fileInput, largeFile);

    expect(screen.getByText(/image size must be less than 5mb/i)).toBeInTheDocument();
  });

  it('uploads valid image file', async () => {
    const user = userEvent.setup();
    const mockPhotoUrl = 'http://example.com/uploaded-photo.jpg';
    mockUploadProfilePhoto.mockResolvedValue(mockPhotoUrl);
    
    render(
      <ImageUpload
        onPhotoUpdate={mockOnPhotoUpdate}
        onPhotoRemove={mockOnPhotoRemove}
      />
    );

    const uploadButton = screen.getByText(/upload photo/i);
    await user.click(uploadButton);

    const fileInput = screen.getByDisplayValue('') as HTMLInputElement;
    
    // Create a valid image file
    const imageFile = new File(['image data'], 'photo.jpg', { type: 'image/jpeg' });
    
    // Mock FileReader
    mockFileReader.readAsDataURL.mockImplementation(() => {
      setTimeout(() => {
        mockFileReader.onload && mockFileReader.onload({} as ProgressEvent<FileReader>);
      }, 0);
    });

    await user.upload(fileInput, imageFile);

    await waitFor(() => {
      expect(mockUploadProfilePhoto).toHaveBeenCalledWith('test-user-id', imageFile);
    });

    expect(mockOnPhotoUpdate).toHaveBeenCalledWith(mockPhotoUrl);
  });

  it('handles upload error', async () => {
    const user = userEvent.setup();
    mockUploadProfilePhoto.mockRejectedValue(new Error('Upload failed'));
    
    render(
      <ImageUpload
        onPhotoUpdate={mockOnPhotoUpdate}
        onPhotoRemove={mockOnPhotoRemove}
      />
    );

    const uploadButton = screen.getByText(/upload photo/i);
    await user.click(uploadButton);

    const fileInput = screen.getByDisplayValue('') as HTMLInputElement;
    const imageFile = new File(['image data'], 'photo.jpg', { type: 'image/jpeg' });
    
    mockFileReader.readAsDataURL.mockImplementation(() => {
      setTimeout(() => {
        mockFileReader.onload && mockFileReader.onload({} as ProgressEvent<FileReader>);
      }, 0);
    });

    await user.upload(fileInput, imageFile);

    await waitFor(() => {
      expect(screen.getByText(/failed to upload image/i)).toBeInTheDocument();
    });
  });

  it('removes photo successfully', async () => {
    const user = userEvent.setup();
    mockDeleteProfilePhoto.mockResolvedValue(undefined);
    
    render(
      <ImageUpload
        currentPhotoUrl="http://example.com/photo.jpg"
        onPhotoUpdate={mockOnPhotoUpdate}
        onPhotoRemove={mockOnPhotoRemove}
      />
    );

    const removeButton = screen.getByText(/remove/i);
    await user.click(removeButton);

    await waitFor(() => {
      expect(mockDeleteProfilePhoto).toHaveBeenCalledWith('test-user-id');
    });

    expect(mockOnPhotoRemove).toHaveBeenCalled();
  });

  it('handles photo removal error', async () => {
    const user = userEvent.setup();
    mockDeleteProfilePhoto.mockRejectedValue(new Error('Delete failed'));
    
    render(
      <ImageUpload
        currentPhotoUrl="http://example.com/photo.jpg"
        onPhotoUpdate={mockOnPhotoUpdate}
        onPhotoRemove={mockOnPhotoRemove}
      />
    );

    const removeButton = screen.getByText(/remove/i);
    await user.click(removeButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to remove image/i)).toBeInTheDocument();
    });
  });

  it('shows loading state during upload', async () => {
    const user = userEvent.setup();
    let resolveUpload: (value: string) => void;
    const uploadPromise = new Promise<string>((resolve) => {
      resolveUpload = resolve;
    });
    mockUploadProfilePhoto.mockReturnValue(uploadPromise);
    
    render(
      <ImageUpload
        onPhotoUpdate={mockOnPhotoUpdate}
        onPhotoRemove={mockOnPhotoRemove}
      />
    );

    const uploadButton = screen.getByText(/upload photo/i);
    await user.click(uploadButton);

    const fileInput = screen.getByDisplayValue('') as HTMLInputElement;
    const imageFile = new File(['image data'], 'photo.jpg', { type: 'image/jpeg' });
    
    mockFileReader.readAsDataURL.mockImplementation(() => {
      setTimeout(() => {
        mockFileReader.onload && mockFileReader.onload({} as ProgressEvent<FileReader>);
      }, 0);
    });

    await user.upload(fileInput, imageFile);

    // Check loading state
    await waitFor(() => {
      expect(screen.getByTestId('loading-spinner') || document.querySelector('.animate-spin')).toBeInTheDocument();
    });

    // Resolve upload
    resolveUpload!('http://example.com/uploaded.jpg');
    
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });
  });

  it('disables buttons during upload', async () => {
    const user = userEvent.setup();
    let resolveUpload: (value: string) => void;
    const uploadPromise = new Promise<string>((resolve) => {
      resolveUpload = resolve;
    });
    mockUploadProfilePhoto.mockReturnValue(uploadPromise);
    
    render(
      <ImageUpload
        currentPhotoUrl="http://example.com/photo.jpg"
        onPhotoUpdate={mockOnPhotoUpdate}
        onPhotoRemove={mockOnPhotoRemove}
      />
    );

    const uploadButton = screen.getByText(/change photo/i);
    await user.click(uploadButton);

    const fileInput = screen.getByDisplayValue('') as HTMLInputElement;
    const imageFile = new File(['image data'], 'photo.jpg', { type: 'image/jpeg' });
    
    mockFileReader.readAsDataURL.mockImplementation(() => {
      setTimeout(() => {
        mockFileReader.onload && mockFileReader.onload({} as ProgressEvent<FileReader>);
      }, 0);
    });

    await user.upload(fileInput, imageFile);

    // Check that buttons are disabled
    await waitFor(() => {
      expect(uploadButton).toBeDisabled();
    });

    // Resolve upload
    resolveUpload!('http://example.com/uploaded.jpg');
    
    await waitFor(() => {
      expect(uploadButton).not.toBeDisabled();
    });
  });
});