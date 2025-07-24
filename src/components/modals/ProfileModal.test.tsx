import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ProfileModal, ModalLoadingState, ModalErrorState } from './ProfileModal';

// Mock createPortal to render in the same document
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (children: React.ReactNode) => children,
}));

describe('ProfileModal', () => {
  const mockOnClose = jest.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    mockOnClose.mockClear();
    // Reset body styles
    document.body.style.overflow = 'unset';
  });

  it('renders modal when open', () => {
    render(
      <ProfileModal isOpen={true} onClose={mockOnClose}>
        <div>Modal Content</div>
      </ProfileModal>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Modal Content')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <ProfileModal isOpen={false} onClose={mockOnClose}>
        <div>Modal Content</div>
      </ProfileModal>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    render(
      <ProfileModal isOpen={true} onClose={mockOnClose}>
        <div>Modal Content</div>
      </ProfileModal>
    );

    const closeButton = screen.getByLabelText('Close modal');
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when escape key is pressed', async () => {
    render(
      <ProfileModal isOpen={true} onClose={mockOnClose}>
        <div>Modal Content</div>
      </ProfileModal>
    );

    await user.keyboard('{Escape}');

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop is clicked', async () => {
    render(
      <ProfileModal isOpen={true} onClose={mockOnClose}>
        <div>Modal Content</div>
      </ProfileModal>
    );

    const backdrop = screen.getByRole('dialog').parentElement;
    await user.click(backdrop!);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('does not close when clicking inside modal content', async () => {
    render(
      <ProfileModal isOpen={true} onClose={mockOnClose}>
        <div>Modal Content</div>
      </ProfileModal>
    );

    const content = screen.getByText('Modal Content');
    await user.click(content);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('prevents body scroll when open', () => {
    const { rerender } = render(
      <ProfileModal isOpen={false} onClose={mockOnClose}>
        <div>Modal Content</div>
      </ProfileModal>
    );

    expect(document.body.style.overflow).toBe('unset');

    rerender(
      <ProfileModal isOpen={true} onClose={mockOnClose}>
        <div>Modal Content</div>
      </ProfileModal>
    );

    expect(document.body.style.overflow).toBe('hidden');

    rerender(
      <ProfileModal isOpen={false} onClose={mockOnClose}>
        <div>Modal Content</div>
      </ProfileModal>
    );

    expect(document.body.style.overflow).toBe('unset');
  });

  it('has proper ARIA attributes', () => {
    render(
      <ProfileModal isOpen={true} onClose={mockOnClose}>
        <div>Modal Content</div>
      </ProfileModal>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
  });

  it('traps focus within modal', async () => {
    render(
      <ProfileModal isOpen={true} onClose={mockOnClose}>
        <div>
          <button>First Button</button>
          <button>Second Button</button>
        </div>
      </ProfileModal>
    );

    const firstButton = screen.getByText('First Button');
    const secondButton = screen.getByText('Second Button');
    const closeButton = screen.getByLabelText('Close modal');

    // Tab should cycle through focusable elements
    firstButton.focus();
    await user.keyboard('{Tab}');
    expect(secondButton).toHaveFocus();

    await user.keyboard('{Tab}');
    expect(closeButton).toHaveFocus();

    // Tab from last element should go to first
    await user.keyboard('{Tab}');
    expect(firstButton).toHaveFocus();

    // Shift+Tab should go backwards
    await user.keyboard('{Shift>}{Tab}{/Shift}');
    expect(closeButton).toHaveFocus();
  });

  it('restores focus to previously focused element when closed', async () => {
    const triggerButton = document.createElement('button');
    triggerButton.textContent = 'Open Modal';
    document.body.appendChild(triggerButton);
    triggerButton.focus();

    const { rerender } = render(
      <ProfileModal isOpen={false} onClose={mockOnClose}>
        <div>Modal Content</div>
      </ProfileModal>
    );

    rerender(
      <ProfileModal isOpen={true} onClose={mockOnClose}>
        <div>Modal Content</div>
      </ProfileModal>
    );

    rerender(
      <ProfileModal isOpen={false} onClose={mockOnClose}>
        <div>Modal Content</div>
      </ProfileModal>
    );

    await waitFor(() => {
      expect(triggerButton).toHaveFocus();
    });

    document.body.removeChild(triggerButton);
  });
});

describe('ModalLoadingState', () => {
  it('renders loading state with spinner and message', () => {
    render(<ModalLoadingState />);

    expect(screen.getByText('Loading profiles for comparison...')).toBeInTheDocument();
    // Check for spinner by class name since it's a div with animation
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });
});

describe('ModalErrorState', () => {
  const mockOnRetry = jest.fn();

  beforeEach(() => {
    mockOnRetry.mockClear();
  });

  it('renders error state with default message', () => {
    render(<ModalErrorState onRetry={mockOnRetry} />);

    expect(screen.getByText('Unable to load comparison')).toBeInTheDocument();
    expect(screen.getByText('Failed to load comparison data')).toBeInTheDocument();
    expect(screen.getByText('Try again')).toBeInTheDocument();
  });

  it('renders error state with custom message', () => {
    render(<ModalErrorState message="Network error occurred" onRetry={mockOnRetry} />);

    expect(screen.getByText('Network error occurred')).toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', async () => {
    const user = userEvent.setup();
    render(<ModalErrorState onRetry={mockOnRetry} />);

    const retryButton = screen.getByText('Try again');
    await user.click(retryButton);

    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });

  it('does not render retry button when onRetry is not provided', () => {
    render(<ModalErrorState />);

    expect(screen.queryByText('Try again')).not.toBeInTheDocument();
  });

  it('has proper error icon', () => {
    render(<ModalErrorState />);

    const errorIcon = screen.getByRole('generic').querySelector('svg');
    expect(errorIcon).toBeInTheDocument();
  });
});