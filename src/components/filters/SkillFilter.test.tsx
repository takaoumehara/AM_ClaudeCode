import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SkillFilter } from './SkillFilter';

const mockAvailableSkills = [
  'JavaScript',
  'TypeScript',
  'React',
  'Node.js',
  'Python',
  'Java',
  'CSS',
  'HTML',
];

describe('SkillFilter', () => {
  const mockOnSkillsChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const defaultProps = {
    availableSkills: mockAvailableSkills,
    selectedSkills: [],
    onSkillsChange: mockOnSkillsChange,
  };

  it('renders with default placeholder text', () => {
    render(<SkillFilter {...defaultProps} />);
    
    expect(screen.getByText('Filter by skills...')).toBeInTheDocument();
  });

  it('displays selected skills count', () => {
    render(
      <SkillFilter 
        {...defaultProps} 
        selectedSkills={['JavaScript', 'React']} 
      />
    );
    
    expect(screen.getByText('2 skills selected')).toBeInTheDocument();
  });

  it('displays singular form for one selected skill', () => {
    render(
      <SkillFilter 
        {...defaultProps} 
        selectedSkills={['JavaScript']} 
      />
    );
    
    expect(screen.getByText('1 skill selected')).toBeInTheDocument();
  });

  it('opens dropdown when clicked', async () => {
    const user = userEvent.setup();
    render(<SkillFilter {...defaultProps} />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(screen.getByPlaceholderText('Search skills...')).toBeInTheDocument();
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
  });

  it('closes dropdown when clicking outside', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <SkillFilter {...defaultProps} />
        <div data-testid="outside">Outside element</div>
      </div>
    );
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(screen.getByPlaceholderText('Search skills...')).toBeInTheDocument();
    
    await user.click(screen.getByTestId('outside'));
    
    await waitFor(() => {
      expect(screen.queryByPlaceholderText('Search skills...')).not.toBeInTheDocument();
    });
  });

  it('filters skills based on search input', async () => {
    const user = userEvent.setup();
    render(<SkillFilter {...defaultProps} />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    const searchInput = screen.getByPlaceholderText('Search skills...');
    await user.type(searchInput, 'Script');
    
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.queryByText('React')).not.toBeInTheDocument();
    expect(screen.queryByText('Python')).not.toBeInTheDocument();
  });

  it('shows no results message when search has no matches', async () => {
    const user = userEvent.setup();
    render(<SkillFilter {...defaultProps} />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    const searchInput = screen.getByPlaceholderText('Search skills...');
    await user.type(searchInput, 'nonexistent');
    
    expect(screen.getByText('No skills found matching "nonexistent"')).toBeInTheDocument();
  });

  it('selects skill when checkbox is clicked', async () => {
    const user = userEvent.setup();
    render(<SkillFilter {...defaultProps} />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    const javascriptCheckbox = screen.getByLabelText('JavaScript');
    await user.click(javascriptCheckbox);
    
    expect(mockOnSkillsChange).toHaveBeenCalledWith(['JavaScript']);
  });

  it('deselects skill when already selected checkbox is clicked', async () => {
    const user = userEvent.setup();
    render(
      <SkillFilter 
        {...defaultProps} 
        selectedSkills={['JavaScript', 'React']} 
      />
    );
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    const javascriptCheckbox = screen.getByLabelText('JavaScript');
    await user.click(javascriptCheckbox);
    
    expect(mockOnSkillsChange).toHaveBeenCalledWith(['React']);
  });

  it('shows selected skills as tags below the dropdown', () => {
    render(
      <SkillFilter 
        {...defaultProps} 
        selectedSkills={['JavaScript', 'React']} 
      />
    );
    
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    
    // Should have remove buttons (×)
    const removeButtons = screen.getAllByText('×');
    expect(removeButtons).toHaveLength(2);
  });

  it('removes skill when tag remove button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <SkillFilter 
        {...defaultProps} 
        selectedSkills={['JavaScript', 'React']} 
      />
    );
    
    const removeButtons = screen.getAllByText('×');
    await user.click(removeButtons[0]); // Remove first skill (JavaScript)
    
    expect(mockOnSkillsChange).toHaveBeenCalledWith(['React']);
  });

  it('shows clear all button when skills are selected', async () => {
    const user = userEvent.setup();
    render(
      <SkillFilter 
        {...defaultProps} 
        selectedSkills={['JavaScript', 'React']} 
      />
    );
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(screen.getByText('Clear all (2)')).toBeInTheDocument();
  });

  it('clears all skills when clear all button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <SkillFilter 
        {...defaultProps} 
        selectedSkills={['JavaScript', 'React']} 
      />
    );
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    const clearAllButton = screen.getByText('Clear all (2)');
    await user.click(clearAllButton);
    
    expect(mockOnSkillsChange).toHaveBeenCalledWith([]);
  });

  it('does not show clear all button when no skills selected', async () => {
    const user = userEvent.setup();
    render(<SkillFilter {...defaultProps} />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(screen.queryByText(/Clear all/)).not.toBeInTheDocument();
  });

  it('shows checkmarks for selected skills', async () => {
    const user = userEvent.setup();
    render(
      <SkillFilter 
        {...defaultProps} 
        selectedSkills={['JavaScript']} 
      />
    );
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    const javascriptCheckbox = screen.getByLabelText('JavaScript');
    expect(javascriptCheckbox).toBeChecked();
    
    const reactCheckbox = screen.getByLabelText('React');
    expect(reactCheckbox).not.toBeChecked();
  });

  it('handles empty available skills list', async () => {
    const user = userEvent.setup();
    render(
      <SkillFilter 
        {...defaultProps} 
        availableSkills={[]} 
      />
    );
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(screen.getByText('No skills available')).toBeInTheDocument();
  });

  it('disables component when loading', () => {
    render(<SkillFilter {...defaultProps} loading={true} />);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('rotates dropdown arrow when opened', async () => {
    const user = userEvent.setup();
    render(<SkillFilter {...defaultProps} />);
    
    const button = screen.getByRole('button');
    const arrow = button.querySelector('svg');
    
    expect(arrow).not.toHaveClass('transform rotate-180');
    
    await user.click(button);
    
    expect(arrow).toHaveClass('transform rotate-180');
  });

  it('case-insensitive search', async () => {
    const user = userEvent.setup();
    render(<SkillFilter {...defaultProps} />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    const searchInput = screen.getByPlaceholderText('Search skills...');
    await user.type(searchInput, 'JAVA');
    
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText('Java')).toBeInTheDocument();
  });

  it('maintains scroll position in dropdown', async () => {
    const user = userEvent.setup();
    const manySkills = Array.from({ length: 50 }, (_, i) => `Skill${i + 1}`);
    
    render(
      <SkillFilter 
        {...defaultProps} 
        availableSkills={manySkills} 
      />
    );
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    // Should have scrollable container
    const scrollContainer = screen.getByRole('button').nextElementSibling;
    expect(scrollContainer).toHaveClass('overflow-auto');
  });

  it('handles rapid selection/deselection', async () => {
    const user = userEvent.setup();
    render(<SkillFilter {...defaultProps} />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    const javascriptCheckbox = screen.getByLabelText('JavaScript');
    
    // Rapid clicks
    await user.click(javascriptCheckbox);
    await user.click(javascriptCheckbox);
    await user.click(javascriptCheckbox);
    
    // Should handle all clicks correctly
    expect(mockOnSkillsChange).toHaveBeenCalledTimes(3);
    expect(mockOnSkillsChange).toHaveBeenLastCalledWith(['JavaScript']);
  });
});