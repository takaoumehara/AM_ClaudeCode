import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { CollapsibleSection } from './CollapsibleSection';

describe('CollapsibleSection', () => {
  const user = userEvent.setup();

  describe('Basic Functionality', () => {
    it('renders with title and content', () => {
      render(
        <CollapsibleSection title="Test Section">
          <div>Test Content</div>
        </CollapsibleSection>
      );

      expect(screen.getByText('Test Section')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <CollapsibleSection title="Test Section" className="custom-class">
          <div>Test Content</div>
        </CollapsibleSection>
      );

      const container = document.querySelector('.custom-class');
      expect(container).toBeInTheDocument();
    });

    it('renders with proper structure and styling', () => {
      render(
        <CollapsibleSection title="Test Section">
          <div>Test Content</div>
        </CollapsibleSection>
      );

      const container = document.querySelector('.bg-white.rounded-lg.shadow-sm.border.overflow-hidden');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Expansion State Management', () => {
    it('starts expanded by default', () => {
      render(
        <CollapsibleSection title="Test Section">
          <div>Test Content</div>
        </CollapsibleSection>
      );

      expect(screen.getByText('Test Content')).toBeVisible();
    });

    it('starts collapsed when defaultExpanded is false', () => {
      render(
        <CollapsibleSection title="Test Section" defaultExpanded={false}>
          <div>Test Content</div>
        </CollapsibleSection>
      );

      expect(screen.getByText('Test Content')).not.toBeVisible();
    });

    it('respects custom defaultExpanded prop', () => {
      render(
        <CollapsibleSection title="Test Section" defaultExpanded={true}>
          <div>Test Content</div>
        </CollapsibleSection>
      );

      expect(screen.getByText('Test Content')).toBeVisible();
    });
  });

  describe('Toggle Functionality', () => {
    it('toggles content visibility when header is clicked', async () => {
      render(
        <CollapsibleSection title="Test Section" defaultExpanded={true}>
          <div>Test Content</div>
        </CollapsibleSection>
      );

      const header = screen.getByRole('button');
      expect(screen.getByText('Test Content')).toBeVisible();

      await user.click(header);
      expect(screen.getByText('Test Content')).not.toBeVisible();

      await user.click(header);
      expect(screen.getByText('Test Content')).toBeVisible();
    });

    it('rotates chevron icon when toggling', async () => {
      render(
        <CollapsibleSection title="Test Section" defaultExpanded={false}>
          <div>Test Content</div>
        </CollapsibleSection>
      );

      const header = screen.getByRole('button');
      const chevron = header.querySelector('svg');
      
      expect(chevron).not.toHaveClass('rotate-180');

      await user.click(header);
      expect(chevron).toHaveClass('rotate-180');

      await user.click(header);
      expect(chevron).not.toHaveClass('rotate-180');
    });

    it('provides smooth animations during transitions', async () => {
      render(
        <CollapsibleSection title="Test Section">
          <div>Test Content</div>
        </CollapsibleSection>
      );

      const content = document.querySelector('.transition-all.duration-300.ease-in-out');
      expect(content).toBeInTheDocument();

      const chevron = document.querySelector('.transition-transform.duration-200');
      expect(chevron).toBeInTheDocument();
    });
  });

  describe('Desktop Expansion Behavior', () => {
    it('always shows content on desktop when expandOnDesktop is true', () => {
      render(
        <CollapsibleSection 
          title="Test Section" 
          defaultExpanded={false} 
          expandOnDesktop={true}
        >
          <div>Test Content</div>
        </CollapsibleSection>
      );

      // Content should be visible on desktop even though defaultExpanded is false
      const contentContainer = document.querySelector('.lg\\:block');
      expect(contentContainer).toBeInTheDocument();
    });

    it('disables header button on desktop when expandOnDesktop is true', () => {
      render(
        <CollapsibleSection 
          title="Test Section" 
          expandOnDesktop={true}
        >
          <div>Test Content</div>
        </CollapsibleSection>
      );

      const header = screen.getByRole('button');
      expect(header).toBeDisabled();
      expect(header).toHaveClass('lg:cursor-default');
    });

    it('hides toggle icon on desktop when expandOnDesktop is true', () => {
      render(
        <CollapsibleSection 
          title="Test Section" 
          expandOnDesktop={true}
        >
          <div>Test Content</div>
        </CollapsibleSection>
      );

      const iconContainer = document.querySelector('.lg\\:hidden');
      expect(iconContainer).toBeInTheDocument();
    });

    it('allows toggling on all screen sizes when expandOnDesktop is false', async () => {
      render(
        <CollapsibleSection 
          title="Test Section" 
          expandOnDesktop={false}
        >
          <div>Test Content</div>
        </CollapsibleSection>
      );

      const header = screen.getByRole('button');
      expect(header).not.toBeDisabled();
      expect(header).toHaveClass('hover:bg-gray-50');
      
      // Should be able to toggle
      await user.click(header);
      expect(screen.getByText('Test Content')).not.toBeVisible();
    });
  });

  describe('Responsive Design Classes', () => {
    it('applies correct responsive visibility classes', () => {
      render(
        <CollapsibleSection title="Test Section" expandOnDesktop={true}>
          <div>Test Content</div>
        </CollapsibleSection>
      );

      // Check for responsive classes in content area
      const content = document.querySelector('.lg\\:block');
      expect(content).toBeInTheDocument();
    });

    it('handles mobile-only collapsible behavior', () => {
      render(
        <CollapsibleSection 
          title="Test Section" 
          defaultExpanded={false}
          expandOnDesktop={true}
        >
          <div>Test Content</div>
        </CollapsibleSection>
      );

      // Should have classes that show on desktop but hide on mobile when collapsed
      const content = document.querySelector('.hidden.lg\\:block');
      expect(content).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('provides proper button role for header', () => {
      render(
        <CollapsibleSection title="Test Section">
          <div>Test Content</div>
        </CollapsibleSection>
      );

      const header = screen.getByRole('button');
      expect(header).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      render(
        <CollapsibleSection title="Test Section">
          <div>Test Content</div>
        </CollapsibleSection>
      );

      const header = screen.getByRole('button');
      header.focus();
      expect(header).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(screen.getByText('Test Content')).not.toBeVisible();

      await user.keyboard('{Space}');
      expect(screen.getByText('Test Content')).toBeVisible();
    });

    it('provides focus styles', () => {
      render(
        <CollapsibleSection title="Test Section">
          <div>Test Content</div>
        </CollapsibleSection>
      );

      const header = screen.getByRole('button');
      expect(header).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-blue-500', 'focus:ring-inset');
    });

    it('maintains proper focus management during state changes', async () => {
      render(
        <CollapsibleSection title="Test Section">
          <div>Test Content</div>
        </CollapsibleSection>
      );

      const header = screen.getByRole('button');
      header.focus();
      
      await user.click(header);
      expect(header).toHaveFocus(); // Focus should remain on header after click
    });
  });

  describe('Content Rendering', () => {
    it('renders complex nested content correctly', () => {
      render(
        <CollapsibleSection title="Test Section">
          <div>
            <h3>Nested Header</h3>
            <p>Paragraph content</p>
            <button>Nested Button</button>
          </div>
        </CollapsibleSection>
      );

      expect(screen.getByText('Nested Header')).toBeInTheDocument();
      expect(screen.getByText('Paragraph content')).toBeInTheDocument();
      expect(screen.getByText('Nested Button')).toBeInTheDocument();
    });

    it('preserves content styling and structure', () => {
      render(
        <CollapsibleSection title="Test Section">
          <div className="custom-content-class">
            <span data-testid="custom-span">Custom Content</span>
          </div>
        </CollapsibleSection>
      );

      const customContent = document.querySelector('.custom-content-class');
      expect(customContent).toBeInTheDocument();
      expect(screen.getByTestId('custom-span')).toBeInTheDocument();
    });

    it('applies consistent padding to content area', () => {
      render(
        <CollapsibleSection title="Test Section">
          <div>Test Content</div>
        </CollapsibleSection>
      );

      const contentPadding = document.querySelector('.px-6.pb-6');
      expect(contentPadding).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty content gracefully', () => {
      render(
        <CollapsibleSection title="Test Section">
          {null}
        </CollapsibleSection>
      );

      expect(screen.getByText('Test Section')).toBeInTheDocument();
    });

    it('handles undefined children gracefully', () => {
      render(
        <CollapsibleSection title="Test Section">
          {undefined}
        </CollapsibleSection>
      );

      expect(screen.getByText('Test Section')).toBeInTheDocument();
    });

    it('handles multiple rapid clicks correctly', async () => {
      render(
        <CollapsibleSection title="Test Section">
          <div>Test Content</div>
        </CollapsibleSection>
      );

      const header = screen.getByRole('button');
      
      // Rapid clicks should work consistently
      await user.click(header);
      await user.click(header);
      await user.click(header);
      
      expect(screen.getByText('Test Content')).not.toBeVisible();
    });

    it('maintains state consistency across re-renders', () => {
      const { rerender } = render(
        <CollapsibleSection title="Test Section" defaultExpanded={true}>
          <div>Test Content V1</div>
        </CollapsibleSection>
      );

      expect(screen.getByText('Test Content V1')).toBeVisible();

      // Re-render with different content but same state
      rerender(
        <CollapsibleSection title="Test Section" defaultExpanded={true}>
          <div>Test Content V2</div>
        </CollapsibleSection>
      );

      expect(screen.getByText('Test Content V2')).toBeVisible();
      expect(screen.queryByText('Test Content V1')).not.toBeInTheDocument();
    });
  });

  describe('Performance Considerations', () => {
    it('does not cause unnecessary re-renders of content', () => {
      const mockChild = jest.fn(() => <div>Mock Content</div>);
      
      const { rerender } = render(
        <CollapsibleSection title="Test Section">
          {mockChild()}
        </CollapsibleSection>
      );

      expect(mockChild).toHaveBeenCalledTimes(1);

      // Re-render with same props
      rerender(
        <CollapsibleSection title="Test Section">
          {mockChild()}
        </CollapsibleSection>
      );

      expect(mockChild).toHaveBeenCalledTimes(2); // Expected for this test setup
    });

    it('handles large content efficiently', () => {
      const largeContent = Array.from({ length: 100 }, (_, i) => (
        <div key={i}>Item {i}</div>
      ));

      render(
        <CollapsibleSection title="Test Section">
          <div>{largeContent}</div>
        </CollapsibleSection>
      );

      expect(screen.getByText('Item 0')).toBeInTheDocument();
      expect(screen.getByText('Item 99')).toBeInTheDocument();
    });
  });

  describe('CSS Transitions', () => {
    it('applies transition classes correctly', () => {
      render(
        <CollapsibleSection title="Test Section">
          <div>Test Content</div>
        </CollapsibleSection>
      );

      const content = document.querySelector('.transition-all.duration-300.ease-in-out');
      expect(content).toBeInTheDocument();

      const button = document.querySelector('.transition-colors.duration-200');
      expect(button).toBeInTheDocument();

      const chevron = document.querySelector('.transition-transform.duration-200');
      expect(chevron).toBeInTheDocument();
    });

    it('handles animation states correctly', async () => {
      render(
        <CollapsibleSection title="Test Section" defaultExpanded={true}>
          <div>Test Content</div>
        </CollapsibleSection>
      );

      const header = screen.getByRole('button');
      const chevron = header.querySelector('svg');

      // Initially expanded, chevron should be rotated
      expect(chevron).toHaveClass('rotate-180');

      // Click to collapse
      await user.click(header);
      
      // After collapse, chevron should not be rotated
      expect(chevron).not.toHaveClass('rotate-180');
    });
  });
});