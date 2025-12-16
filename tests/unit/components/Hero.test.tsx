import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/tests/utils/test-utils';
import Hero from '@/app/(public)/_components/Hero';

// Mock the useRevealOnScroll hook
vi.mock('@/hooks/use-reveal-on-scroll', () => ({
  useRevealOnScroll: () => ({
    ref: { current: null },
    isVisible: true,
  }),
}));

describe('Hero Component', () => {
  it('renders the main headline', () => {
    render(<Hero />);
    
    expect(screen.getByText(/Learn at your pace/i)).toBeInTheDocument();
    expect(screen.getByText(/master new skills/i)).toBeInTheDocument();
  });

  it('renders the description text', () => {
    render(<Hero />);
    
    expect(
      screen.getByText(/Access thousands of courses taught by industry experts/i)
    ).toBeInTheDocument();
  });

  it('renders CTA buttons', () => {
    render(<Hero />);
    
    expect(screen.getByText(/Start learning free/i)).toBeInTheDocument();
    expect(screen.getByText(/Explore courses/i)).toBeInTheDocument();
  });

  it('has correct links for CTA buttons', () => {
    render(<Hero />);
    
    const startLearningLink = screen.getByText(/Start learning free/i).closest('a');
    const exploreCoursesLink = screen.getByText(/Explore courses/i).closest('a');
    
    expect(startLearningLink).toHaveAttribute('href', '/courses');
    expect(exploreCoursesLink).toHaveAttribute('href', '/courses');
  });
});
