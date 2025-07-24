import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ProfileCheckbox, CompactProfileCheckbox, SelectionIndicator } from './ProfileCheckbox';

describe('ProfileCheckbox', () => {
  const mockOnToggle = jest.fn();
  const defaultProps = {
    profileId: 'profile1',
    isSelected: false,
    canSelect: true,
    onToggle: mockOnToggle
  };

  beforeEach(() => {
    mockOnToggle.mockClear();
  });

  it('renders checkbox with correct initial state', () => {
    render(<ProfileCheckbox {...defaultProps} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
    expect(checkbox).not.toBeDisabled();
  });

  it('renders selected state correctly', () => {
    render(<ProfileCheckbox {...defaultProps} isSelected={true} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('renders disabled state when cannot select', () => {
    render(<ProfileCheckbox {...defaultProps} canSelect={false} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeDisabled();
  });

  it('calls onToggle when clicked', async () => {
    const user = userEvent.setup();
    render(<ProfileCheckbox {...defaultProps} />);

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    expect(mockOnToggle).toHaveBeenCalledWith('profile1');
    expect(mockOnToggle).toHaveBeenCalledTimes(1);
  });

  it('does not call onToggle when disabled', async () => {
    const user = userEvent.setup();
    render(<ProfileCheckbox {...defaultProps} canSelect={false} />);

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    expect(mockOnToggle).not.toHaveBeenCalled();
  });

  it('stops propagation on change event', () => {
    const parentOnClick = jest.fn();
    render(
      <div onClick={parentOnClick}>
        <ProfileCheckbox {...defaultProps} />
      </div>
    );

    const checkbox = screen.getByRole('checkbox');
    fireEvent.change(checkbox, { target: { checked: true } });

    expect(mockOnToggle).toHaveBeenCalledWith('profile1');
    expect(parentOnClick).not.toHaveBeenCalled();
  });

  it('applies correct size classes', () => {
    const { rerender } = render(<ProfileCheckbox {...defaultProps} size="sm" />);
    expect(document.querySelector('.w-4.h-4')).toBeInTheDocument();

    rerender(<ProfileCheckbox {...defaultProps} size="md" />);
    expect(document.querySelector('.w-5.h-5')).toBeInTheDocument();

    rerender(<ProfileCheckbox {...defaultProps} size="lg" />);
    expect(document.querySelector('.w-6.h-6')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<ProfileCheckbox {...defaultProps} className="custom-class" />);
    
    const container = document.querySelector('.custom-class');
    expect(container).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<ProfileCheckbox {...defaultProps} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-label', 'Select profile for comparison');
    expect(checkbox).toHaveAttribute('id', 'checkbox-profile1');

    const label = screen.getByLabelText('Select profile for comparison');
    expect(label).toBeInTheDocument();
  });

  it('shows visual indicator when selected', () => {
    render(<ProfileCheckbox {...defaultProps} isSelected={true} />);

    const checkmark = document.querySelector('svg');
    expect(checkmark).toBeInTheDocument();
    expect(checkmark).toHaveClass('text-white');
  });

  it('applies disabled styling when cannot select', () => {
    render(<ProfileCheckbox {...defaultProps} canSelect={false} />);

    const label = screen.getByLabelText('Select profile for comparison').closest('label');
    expect(label).toHaveClass('cursor-not-allowed', 'opacity-50');
  });
});

describe('CompactProfileCheckbox', () => {
  const mockOnToggle = jest.fn();
  const defaultProps = {
    profileId: 'profile1',
    isSelected: false,
    canSelect: true,
    onToggle: mockOnToggle
  };

  it('renders with small size and margin', () => {
    render(<CompactProfileCheckbox {...defaultProps} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    
    const container = checkbox.closest('div');
    expect(container).toHaveClass('mr-2');
  });

  it('passes through all props to ProfileCheckbox', async () => {
    const user = userEvent.setup();
    render(<CompactProfileCheckbox {...defaultProps} isSelected={true} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();

    await user.click(checkbox);
    expect(mockOnToggle).toHaveBeenCalledWith('profile1');
  });
});

describe('SelectionIndicator', () => {
  it('renders selection count and max count', () => {
    render(<SelectionIndicator count={2} maxCount={4} />);

    expect(screen.getByText('2 of 4 selected')).toBeInTheDocument();
  });

  it('does not render when count is 0', () => {
    render(<SelectionIndicator count={0} maxCount={4} />);

    expect(screen.queryByText('0 of 4 selected')).not.toBeInTheDocument();
  });

  it('renders with single item correctly', () => {
    render(<SelectionIndicator count={1} maxCount={4} />);

    expect(screen.getByText('1 of 4 selected')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<SelectionIndicator count={2} maxCount={4} className="custom-indicator" />);

    const indicator = screen.getByText('2 of 4 selected').parentElement;
    expect(indicator).toHaveClass('custom-indicator');
  });

  it('shows indicator dot', () => {
    render(<SelectionIndicator count={2} maxCount={4} />);

    const dot = document.querySelector('.w-2.h-2.bg-blue-600.rounded-full');
    expect(dot).toBeInTheDocument();
  });

  it('has proper styling classes', () => {
    render(<SelectionIndicator count={2} maxCount={4} />);

    const indicator = screen.getByText('2 of 4 selected').parentElement;
    expect(indicator).toHaveClass('inline-flex', 'items-center', 'px-2', 'py-1', 'rounded-full', 'text-xs', 'font-medium');
  });
});