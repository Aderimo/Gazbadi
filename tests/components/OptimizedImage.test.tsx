import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import OptimizedImage from '@/components/ui/OptimizedImage';

describe('OptimizedImage', () => {
  it('varsayılan olarak loading="lazy" ile render eder', () => {
    render(<OptimizedImage src="/test.jpg" alt="test" />);
    const img = screen.getByAltText('test');
    expect(img).toHaveAttribute('loading', 'lazy');
    expect(img).toHaveAttribute('decoding', 'async');
  });

  it('lazy=false olduğunda loading="eager" ile render eder', () => {
    render(<OptimizedImage src="/test.jpg" alt="test" lazy={false} />);
    const img = screen.getByAltText('test');
    expect(img).toHaveAttribute('loading', 'eager');
    expect(img).toHaveAttribute('decoding', 'auto');
  });

  it('alt text ile render eder', () => {
    render(<OptimizedImage src="/hero.jpg" alt="Hero image" />);
    expect(screen.getByAltText('Hero image')).toBeInTheDocument();
  });

  it('özel className ile render eder', () => {
    render(<OptimizedImage src="/test.jpg" alt="test" className="w-full object-cover" />);
    const img = screen.getByAltText('test');
    expect(img).toHaveClass('w-full', 'object-cover');
  });

  it('sizes attribute ile render eder', () => {
    render(<OptimizedImage src="/test.jpg" alt="test" sizes="(max-width: 640px) 100vw, 50vw" />);
    const img = screen.getByAltText('test');
    expect(img).toHaveAttribute('sizes', '(max-width: 640px) 100vw, 50vw');
  });
});
