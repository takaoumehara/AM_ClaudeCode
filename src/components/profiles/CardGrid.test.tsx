import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CardGrid, EmptyProfilesState, ProfilesErrorState } from './CardGrid';

describe('CardGrid', () => {
  it('renders children correctly', () => {
    render(
      <CardGrid>
        <div>Card 1</div>
        <div>Card 2</div>
        <div>Card 3</div>
      </CardGrid>
    );

    expect(screen.getByText('Card 1')).toBeInTheDocument();
    expect(screen.getByText('Card 2')).toBeInTheDocument();
    expect(screen.getByText('Card 3')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <CardGrid className="custom-class">
        <div>Content</div>
      </CardGrid>
    );

    const grid = container.firstChild;
    expect(grid).toHaveClass('custom-class');
  });

  it('shows loading skeleton when loading is true', () => {
    render(
      <CardGrid loading={true}>
        <div>This should not appear</div>
      </CardGrid>
    );

    // Should show multiple skeleton cards
    const skeletons = screen.getAllByText('', { selector: '.animate-pulse' });
    expect(skeletons.length).toBeGreaterThan(0);

    // Children should not be rendered during loading
    expect(screen.queryByText('This should not appear')).not.toBeInTheDocument();
  });

  it('shows loading skeleton with correct number of items', () => {
    const { container } = render(<CardGrid loading={true} />);

    const skeletonCards = container.querySelectorAll('.animate-pulse');
    expect(skeletonCards).toHaveLength(8); // Default number of skeleton cards
  });

  it('shows empty state when no children and emptyState provided', () => {
    const emptyState = <div>No items to display</div>;
    
    render(<CardGrid emptyState={emptyState} />);

    expect(screen.getByText('No items to display')).toBeInTheDocument();
  });

  it('does not show empty state when children are present', () => {
    const emptyState = <div>No items to display</div>;
    
    render(
      <CardGrid emptyState={emptyState}>
        <div>Has content</div>
      </CardGrid>
    );

    expect(screen.getByText('Has content')).toBeInTheDocument();
    expect(screen.queryByText('No items to display')).not.toBeInTheDocument();
  });

  it('does not show empty state when loading', () => {
    const emptyState = <div>No items to display</div>;
    
    render(<CardGrid loading={true} emptyState={emptyState} />);

    expect(screen.queryByText('No items to display')).not.toBeInTheDocument();
  });

  it('applies correct grid styles', () => {
    const { container } = render(
      <CardGrid>
        <div>Content</div>
      </CardGrid>
    );

    const grid = container.firstChild as HTMLElement;
    expect(grid).toHaveClass('grid');
    expect(grid).toHaveClass('gap-6');
    expect(grid).toHaveStyle({
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))'
    });
  });
});

describe('EmptyProfilesState', () => {
  it('renders empty state correctly', () => {
    render(<EmptyProfilesState />);

    expect(screen.getByText('No profiles found')).toBeInTheDocument();
    expect(screen.getByText('There are no profiles to display at the moment.')).toBeInTheDocument();
  });

  it('displays the correct icon', () => {
    const { container } = render(<EmptyProfilesState />);

    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('w-12', 'h-12', 'text-gray-400');
  });

  it('has proper styling structure', () => {
    const { container } = render(<EmptyProfilesState />);

    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('text-center', 'py-12');
  });
});

describe('ProfilesErrorState', () => {
  it('renders error state with default message', () => {
    render(<ProfilesErrorState />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Unable to load profiles. Please try again.')).toBeInTheDocument();
  });

  it('renders error state with custom message', () => {
    const customMessage = 'Custom error message';
    render(<ProfilesErrorState message={customMessage} />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it('displays retry button when onRetry is provided', () => {
    const mockOnRetry = jest.fn();
    render(<ProfilesErrorState onRetry={mockOnRetry} />);

    const retryButton = screen.getByText('Try again');
    expect(retryButton).toBeInTheDocument();
    expect(retryButton).toHaveAttribute('type', 'button');
  });

  it('does not display retry button when onRetry is not provided', () => {
    render(<ProfilesErrorState />);

    expect(screen.queryByText('Try again')).not.toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnRetry = jest.fn();
    
    render(<ProfilesErrorState onRetry={mockOnRetry} />);

    const retryButton = screen.getByText('Try again');
    await user.click(retryButton);

    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });

  it('displays the correct error icon', () => {
    const { container } = render(<ProfilesErrorState />);

    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('w-12', 'h-12', 'text-red-400');
  });

  it('has proper styling structure', () => {
    const { container } = render(<ProfilesErrorState />);

    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('text-center', 'py-12');

    const iconWrapper = container.querySelector('.bg-red-100');
    expect(iconWrapper).toBeInTheDocument();
    expect(iconWrapper).toHaveClass('w-24', 'h-24', 'rounded-full');
  });

  it('retry button has correct styling', () => {
    const mockOnRetry = jest.fn();
    render(<ProfilesErrorState onRetry={mockOnRetry} />);

    const retryButton = screen.getByText('Try again');
    expect(retryButton).toHaveClass(
      'inline-flex',
      'items-center',
      'px-4',
      'py-2',
      'border',
      'border-transparent',
      'text-sm',
      'font-medium',
      'rounded-md',
      'text-white',
      'bg-blue-600',
      'hover:bg-blue-700'
    );
  });

  it('handles multiple retry clicks correctly', async () => {
    const user = userEvent.setup();
    const mockOnRetry = jest.fn();
    
    render(<ProfilesErrorState onRetry={mockOnRetry} />);

    const retryButton = screen.getByText('Try again');
    
    await user.click(retryButton);
    await user.click(retryButton);
    await user.click(retryButton);

    expect(mockOnRetry).toHaveBeenCalledTimes(3);
  });

  it('renders with both custom message and retry handler', async () => {
    const user = userEvent.setup();
    const mockOnRetry = jest.fn();
    const customMessage = 'Network connection failed';
    
    render(
      <ProfilesErrorState 
        message={customMessage} 
        onRetry={mockOnRetry} 
      />
    );

    expect(screen.getByText(customMessage)).toBeInTheDocument();
    
    const retryButton = screen.getByText('Try again');
    await user.click(retryButton);
    
    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });
});