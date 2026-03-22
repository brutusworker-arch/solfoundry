/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renders children when not loading', () => {
    render(<Button>Submit PR</Button>);
    expect(screen.getByText('Submit PR')).toBeTruthy();
  });

  it('renders loadingText when isLoading is true', () => {
    render(
      <Button isLoading loadingText="Submitting...">
        Submit PR
      </Button>,
    );
    expect(screen.getByText('Submitting...')).toBeTruthy();
    expect(screen.queryByText('Submit PR')).toBeNull();
  });

  it('falls back to children as loading label when loadingText is omitted', () => {
    render(<Button isLoading>Submit PR</Button>);
    expect(screen.getByText('Submit PR')).toBeTruthy();
  });

  it('is disabled while loading', () => {
    render(
      <Button isLoading loadingText="Claiming...">
        Claim
      </Button>,
    );
    const btn = screen.getByRole('button');
    expect(btn).toHaveProperty('disabled', true);
  });

  it('does not fire onClick while loading', () => {
    const handler = vi.fn();
    render(
      <Button isLoading loadingText="Claiming..." onClick={handler}>
        Claim
      </Button>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(handler).not.toHaveBeenCalled();
  });

  it('fires onClick when not loading', () => {
    const handler = vi.fn();
    render(<Button onClick={handler}>Click me</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toHaveProperty('disabled', true);
  });

  it('renders spinner svg when loading', () => {
    render(<Button isLoading loadingText="Loading...">Go</Button>);
    const svg = document.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.classList.toString()).toContain('animate-spin');
  });

  it('sets aria-busy when loading', () => {
    render(<Button isLoading loadingText="Loading...">Go</Button>);
    const btn = screen.getByRole('button');
    expect(btn.getAttribute('aria-busy')).toBe('true');
  });

  it('applies variant classes', () => {
    render(<Button variant="danger">Delete</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('bg-red-600');
  });

  it('applies size classes', () => {
    render(<Button size="lg">Large</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('min-h-[48px]');
  });

  it('merges custom className', () => {
    render(<Button className="w-full">Full width</Button>);
    expect(screen.getByRole('button').className).toContain('w-full');
  });
});
