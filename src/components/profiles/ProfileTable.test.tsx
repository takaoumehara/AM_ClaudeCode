import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileTable, SortField, SortDirection } from './ProfileTable';
import { ProfileListItem } from '@/lib/firebase/profiles';

// Mock Next.js components
jest.mock('next/link', () => {
  return ({ children, href }: any) => (
    <a href={href}>{children}</a>
  );
});

jest.mock('next/image', () => {
  return ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} {...props} />
  );
});

const mockProfiles: ProfileListItem[] = [
  {
    id: 'user1',
    profile: {
      core: {
        name: 'Alice Johnson',
        photoUrl: 'http://example.com/alice.jpg',
        mainTitle: 'Software Engineer',
        teamIds: ['team1', 'team2'],
        mainSkills: ['JavaScript', 'React', 'TypeScript', 'Node.js'],
      },
      personal: {},
      profiles: {},
    },
  },
  {
    id: 'user2',
    profile: {
      core: {
        name: 'Bob Smith',
        photoUrl: '',
        mainTitle: 'Product Manager',
        teamIds: ['team1'],
        mainSkills: ['Strategy', 'Analytics'],
      },
      personal: {},
      profiles: {},
    },
  },
  {
    id: 'user3',
    profile: {
      core: {
        name: 'Charlie Brown',
        photoUrl: '',
        mainTitle: '',
        teamIds: [],
        mainSkills: [],
      },
      personal: {},
      profiles: {},
    },
  },
];

describe('ProfileTable', () => {
  const defaultProps = {
    profiles: mockProfiles,
    loading: false,
  };

  it('renders table headers correctly', () => {
    render(<ProfileTable {...defaultProps} />);

    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Skills')).toBeInTheDocument();
    expect(screen.getByText('Teams')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('renders profile data correctly in desktop view', () => {
    render(<ProfileTable {...defaultProps} />);

    // Check names
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    expect(screen.getByText('Bob Smith')).toBeInTheDocument();
    expect(screen.getByText('Charlie Brown')).toBeInTheDocument();

    // Check titles
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('Product Manager')).toBeInTheDocument();
    expect(screen.getByText('No title')).toBeInTheDocument();

    // Check skills
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Strategy')).toBeInTheDocument();
    expect(screen.getByText('No skills listed')).toBeInTheDocument();
  });

  it('displays profile photos when available', () => {
    render(<ProfileTable {...defaultProps} />);

    const alicePhoto = screen.getByAltText('Alice Johnson');
    expect(alicePhoto).toBeInTheDocument();
    expect(alicePhoto).toHaveAttribute('src', 'http://example.com/alice.jpg');
  });

  it('shows default avatar for profiles without photos', () => {
    render(<ProfileTable {...defaultProps} />);

    // Should have SVG icons for profiles without photos
    const svgIcons = screen.getAllByRole('generic');
    expect(svgIcons.length).toBeGreaterThan(0);
  });

  it('limits skills display to 3 items with overflow indicator', () => {
    render(<ProfileTable {...defaultProps} />);

    // Alice has 4 skills, should show 3 + overflow
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('+1')).toBeInTheDocument(); // +1 more skill
  });

  it('displays team count correctly', () => {
    render(<ProfileTable {...defaultProps} />);

    expect(screen.getByText('2 teams')).toBeInTheDocument(); // Alice
    expect(screen.getByText('1 team')).toBeInTheDocument(); // Bob
    expect(screen.getByText('No teams')).toBeInTheDocument(); // Charlie
  });

  it('renders View links for each profile', () => {
    render(<ProfileTable {...defaultProps} />);

    const viewLinks = screen.getAllByText('View');
    expect(viewLinks).toHaveLength(3);
    
    expect(viewLinks[0]).toHaveAttribute('href', '/profiles/user1');
    expect(viewLinks[1]).toHaveAttribute('href', '/profiles/user2');
    expect(viewLinks[2]).toHaveAttribute('href', '/profiles/user3');
  });

  it('shows loading skeleton when loading', () => {
    render(<ProfileTable profiles={[]} loading={true} />);

    // Should show skeleton rows
    const skeletonRows = screen.getByRole('table').querySelectorAll('.animate-pulse');
    expect(skeletonRows.length).toBeGreaterThan(0);
  });

  it('shows empty state when no profiles', () => {
    render(<ProfileTable profiles={[]} loading={false} />);

    expect(screen.getByText('No profiles to display')).toBeInTheDocument();
    expect(screen.getByText('No profiles match your current filters or search criteria.')).toBeInTheDocument();
  });

  it('calls onSort when sortable headers are clicked', async () => {
    const user = userEvent.setup();
    const mockOnSort = jest.fn();

    render(
      <ProfileTable 
        {...defaultProps} 
        onSort={mockOnSort}
        sortField="name"
        sortDirection="asc"
      />
    );

    const nameHeader = screen.getByText('Name').closest('th');
    await user.click(nameHeader!);

    expect(mockOnSort).toHaveBeenCalledWith('name', 'desc');
  });

  it('displays sort direction indicators correctly', () => {
    render(
      <ProfileTable 
        {...defaultProps} 
        sortField="name"
        sortDirection="asc"
      />
    );

    // Check that sorting indicators are present
    const nameHeader = screen.getByText('Name').closest('th');
    expect(nameHeader).toBeInTheDocument();
    
    // Should have sort arrows
    const sortArrows = nameHeader!.querySelectorAll('svg');
    expect(sortArrows.length).toBe(2); // Up and down arrows
  });

  it('toggles sort direction on repeated clicks', async () => {
    const user = userEvent.setup();
    const mockOnSort = jest.fn();

    render(
      <ProfileTable 
        {...defaultProps} 
        onSort={mockOnSort}
        sortField="name"
        sortDirection="asc"
      />
    );

    const nameHeader = screen.getByText('Name').closest('th');
    
    // First click should change to desc
    await user.click(nameHeader!);
    expect(mockOnSort).toHaveBeenCalledWith('name', 'desc');

    // Simulate props update
    render(
      <ProfileTable 
        {...defaultProps} 
        onSort={mockOnSort}
        sortField="name"
        sortDirection="desc"
      />
    );

    // Second click should change back to asc
    await user.click(nameHeader!);
    expect(mockOnSort).toHaveBeenCalledWith('name', 'asc');
  });

  it('handles different sort fields correctly', async () => {
    const user = userEvent.setup();
    const mockOnSort = jest.fn();

    render(
      <ProfileTable 
        {...defaultProps} 
        onSort={mockOnSort}
      />
    );

    // Test different sortable columns
    await user.click(screen.getByText('Title').closest('th')!);
    expect(mockOnSort).toHaveBeenCalledWith('title', 'asc');

    await user.click(screen.getByText('Skills').closest('th')!);
    expect(mockOnSort).toHaveBeenCalledWith('skillCount', 'asc');

    await user.click(screen.getByText('Teams').closest('th')!);
    expect(mockOnSort).toHaveBeenCalledWith('teamCount', 'asc');
  });

  it('works without onSort handler', async () => {
    const user = userEvent.setup();

    render(<ProfileTable {...defaultProps} />);

    const nameHeader = screen.getByText('Name').closest('th');
    
    // Should not throw error when clicking without onSort
    await user.click(nameHeader!);
    
    // Just verify it rendered without crashing
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
  });

  it('handles profiles with missing or null values gracefully', () => {
    const profilesWithMissingData: ProfileListItem[] = [
      {
        id: 'user1',
        profile: {
          core: {
            name: 'Test User',
            teamIds: [],
            mainSkills: [],
            // Missing optional fields
          },
          personal: {},
          profiles: {},
        },
      },
    ];

    render(<ProfileTable profiles={profilesWithMissingData} />);

    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('No title')).toBeInTheDocument();
    expect(screen.getByText('No skills listed')).toBeInTheDocument();
    expect(screen.getByText('No teams')).toBeInTheDocument();
  });

  it('applies hover effects to table rows', () => {
    render(<ProfileTable {...defaultProps} />);

    const tableRows = screen.getAllByRole('row');
    const dataRow = tableRows[1]; // First data row (after header)
    
    expect(dataRow).toHaveClass('hover:bg-gray-50');
    expect(dataRow).toHaveClass('transition-colors');
  });

  it('handles large numbers of skills correctly', () => {
    const profileWithManySkills: ProfileListItem[] = [
      {
        id: 'user1',
        profile: {
          core: {
            name: 'Skilled User',
            teamIds: [],
            mainSkills: ['Skill1', 'Skill2', 'Skill3', 'Skill4', 'Skill5', 'Skill6'],
          },
          personal: {},
          profiles: {},
        },
      },
    ];

    render(<ProfileTable profiles={profileWithManySkills} />);

    expect(screen.getByText('Skill1')).toBeInTheDocument();
    expect(screen.getByText('Skill2')).toBeInTheDocument();
    expect(screen.getByText('Skill3')).toBeInTheDocument();
    expect(screen.getByText('+3')).toBeInTheDocument(); // +3 more skills
  });

  it('maintains accessibility with proper table structure', () => {
    render(<ProfileTable {...defaultProps} />);

    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();

    const columnHeaders = screen.getAllByRole('columnheader');
    expect(columnHeaders.length).toBe(6); // All columns

    const rows = screen.getAllByRole('row');
    expect(rows.length).toBe(4); // Header + 3 data rows
  });
});