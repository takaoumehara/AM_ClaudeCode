import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileCard } from './ProfileCard';
import { UserProfile } from '@/lib/firebase/profiles';

// Mock Next.js components
jest.mock('next/link', () => {
  return ({ children, href, onClick }: any) => (
    <a href={href} onClick={onClick}>
      {children}
    </a>
  );
});

jest.mock('next/image', () => {
  return ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} {...props} />
  );
});

const mockProfile: UserProfile = {
  core: {
    name: 'John Doe',
    photoUrl: 'https://example.com/photo.jpg',
    mainTitle: 'Software Engineer',
    teamIds: ['team1'],
    mainSkills: ['JavaScript', 'React', 'TypeScript', 'Node.js', 'Python'],
  },
  personal: {},
  profiles: {},
};

const mockProfileWithoutPhoto: UserProfile = {
  core: {
    name: 'Jane Smith',
    photoUrl: '',
    mainTitle: 'Product Manager',
    teamIds: ['team2'],
    mainSkills: ['Strategy', 'Analytics'],
  },
  personal: {},
  profiles: {},
};

const mockProfileMinimal: UserProfile = {
  core: {
    name: 'Bob Johnson',
    photoUrl: '',
    mainTitle: '',
    teamIds: [],
    mainSkills: [],
  },
  personal: {},
  profiles: {},
};

describe('ProfileCard', () => {
  const defaultProps = {
    profile: mockProfile,
    userId: 'user123',
  };

  it('renders profile information correctly', () => {
    render(<ProfileCard {...defaultProps} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });

  it('displays profile photo when provided', () => {
    render(<ProfileCard {...defaultProps} />);

    const image = screen.getByAltText('John Doe');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/photo.jpg');
  });

  it('displays default avatar when no photo provided', () => {
    render(
      <ProfileCard
        profile={mockProfileWithoutPhoto}
        userId="user456"
      />
    );

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByRole('generic')).toBeInTheDocument(); // SVG icon container
  });

  it('limits skills display to 3 items', () => {
    render(<ProfileCard {...defaultProps} />);

    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.queryByText('Node.js')).not.toBeInTheDocument();
    expect(screen.queryByText('Python')).not.toBeInTheDocument();
  });

  it('shows "more" indicator when profile has more than 3 skills', () => {
    render(<ProfileCard {...defaultProps} />);

    expect(screen.getByText('+2 more')).toBeInTheDocument();
  });

  it('does not show "more" indicator when profile has 3 or fewer skills', () => {
    render(
      <ProfileCard
        profile={mockProfileWithoutPhoto}
        userId="user456"
      />
    );

    expect(screen.queryByText(/\+\d+ more/)).not.toBeInTheDocument();
  });

  it('displays empty state for skills when no skills provided', () => {
    render(
      <ProfileCard
        profile={mockProfileMinimal}
        userId="user789"
      />
    );

    expect(screen.getByText('No skills listed')).toBeInTheDocument();
  });

  it('does not display title when not provided', () => {
    render(
      <ProfileCard
        profile={mockProfileMinimal}
        userId="user789"
      />
    );

    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    expect(screen.queryByText('Software Engineer')).not.toBeInTheDocument();
  });

  it('renders as a clickable link to profile page', () => {
    render(<ProfileCard {...defaultProps} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/profiles/user123');
  });

  it('calls onClick handler when provided', async () => {
    const user = userEvent.setup();
    const mockOnClick = jest.fn();

    render(<ProfileCard {...defaultProps} onClick={mockOnClick} />);

    const link = screen.getByRole('link');
    await user.click(link);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('applies hover effects correctly', () => {
    render(<ProfileCard {...defaultProps} />);

    const card = screen.getByRole('link').firstChild;
    expect(card).toHaveClass('group');
    expect(card).toHaveClass('hover:shadow-md');
    expect(card).toHaveClass('transition-all');
    expect(card).toHaveClass('cursor-pointer');
  });

  it('handles profiles with undefined skills gracefully', () => {
    const profileWithoutSkills: UserProfile = {
      core: {
        name: 'Test User',
        photoUrl: '',
        mainTitle: 'Test Title',
        teamIds: [],
        mainSkills: undefined as any, // Test undefined case
      },
      personal: {},
      profiles: {},
    };

    render(
      <ProfileCard
        profile={profileWithoutSkills}
        userId="test123"
      />
    );

    expect(screen.getByText('No skills listed')).toBeInTheDocument();
  });

  it('truncates long names appropriately', () => {
    const profileWithLongName: UserProfile = {
      core: {
        name: 'This is a very long name that should be displayed properly',
        photoUrl: '',
        mainTitle: 'Title',
        teamIds: [],
        mainSkills: ['Skill1'],
      },
      personal: {},
      profiles: {},
    };

    render(
      <ProfileCard
        profile={profileWithLongName}
        userId="long123"
      />
    );

    expect(screen.getByText('This is a very long name that should be displayed properly')).toBeInTheDocument();
  });

  it('handles empty string values correctly', () => {
    const profileWithEmptyStrings: UserProfile = {
      core: {
        name: 'Valid Name',
        photoUrl: '',
        mainTitle: '',
        teamIds: [],
        mainSkills: ['', 'Valid Skill', ''],
      },
      personal: {},
      profiles: {},
    };

    render(
      <ProfileCard
        profile={profileWithEmptyStrings}
        userId="empty123"
      />
    );

    expect(screen.getByText('Valid Name')).toBeInTheDocument();
    expect(screen.getByText('Valid Skill')).toBeInTheDocument();
    // Empty strings should still be rendered as skill tags
    expect(screen.getAllByText('').length).toBeGreaterThan(0);
  });

  it('maintains proper accessibility attributes', () => {
    render(<ProfileCard {...defaultProps} />);

    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    
    const image = screen.getByAltText('John Doe');
    expect(image).toHaveAttribute('alt', 'John Doe');
  });

  it('renders correctly with minimal props', () => {
    const minimalProfile: UserProfile = {
      core: {
        name: 'Minimal User',
        teamIds: [],
        mainSkills: [],
      },
      personal: {},
      profiles: {},
    };

    render(
      <ProfileCard
        profile={minimalProfile}
        userId="minimal123"
      />
    );

    expect(screen.getByText('Minimal User')).toBeInTheDocument();
    expect(screen.getByText('No skills listed')).toBeInTheDocument();
  });
});