/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CopyAddress } from './CopyAddress';

// ── Helpers ──────────────────────────────────────────────────────────────────

const FULL_ADDRESS = 'GhUgLwY9ky48FechbmvN7XBHkNRJZRwBmw36g8r6KKpG';
const TRUNCATED = 'GhUg...KKpG';

// ── Clipboard mock ────────────────────────────────────────────────────────────

let clipboardWriteText: ReturnType<typeof vi.fn>;

beforeEach(() => {
  clipboardWriteText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: clipboardWriteText },
    writable: true,
    configurable: true,
  });
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('CopyAddress', () => {
  it('renders the truncated address', () => {
    render(<CopyAddress address={FULL_ADDRESS} />);
    expect(screen.getByText(TRUNCATED)).toBeTruthy();
  });

  it('shows the full address in the title (tooltip) attribute', () => {
    render(<CopyAddress address={FULL_ADDRESS} />);
    const btn = screen.getByRole('button');
    expect(btn.getAttribute('title')).toBe(FULL_ADDRESS);
  });

  it('has an accessible aria-label containing the full address', () => {
    render(<CopyAddress address={FULL_ADDRESS} />);
    const btn = screen.getByRole('button');
    expect(btn.getAttribute('aria-label')).toContain(FULL_ADDRESS);
  });

  it('calls clipboard.writeText with the full address on click', async () => {
    render(<CopyAddress address={FULL_ADDRESS} />);
    const btn = screen.getByRole('button');
    await act(async () => {
      fireEvent.click(btn);
    });
    expect(clipboardWriteText).toHaveBeenCalledWith(FULL_ADDRESS);
  });

  it('calls clipboard.writeText when Enter key is pressed', async () => {
    render(<CopyAddress address={FULL_ADDRESS} />);
    const btn = screen.getByRole('button');
    await act(async () => {
      fireEvent.keyDown(btn, { key: 'Enter' });
    });
    expect(clipboardWriteText).toHaveBeenCalledWith(FULL_ADDRESS);
  });

  it('calls clipboard.writeText when Space key is pressed', async () => {
    render(<CopyAddress address={FULL_ADDRESS} />);
    const btn = screen.getByRole('button');
    await act(async () => {
      fireEvent.keyDown(btn, { key: ' ' });
    });
    expect(clipboardWriteText).toHaveBeenCalledWith(FULL_ADDRESS);
  });

  it('announces "Address copied to clipboard" to screen readers after copy', async () => {
    render(<CopyAddress address={FULL_ADDRESS} />);
    const btn = screen.getByRole('button');
    await act(async () => {
      fireEvent.click(btn);
    });
    const status = screen.getByRole('status');
    expect(status.textContent).toBe('Address copied to clipboard');
  });

  it('clears the screen-reader announcement after 2 seconds', async () => {
    render(<CopyAddress address={FULL_ADDRESS} />);
    const btn = screen.getByRole('button');
    await act(async () => {
      fireEvent.click(btn);
    });
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });
    const status = screen.getByRole('status');
    expect(status.textContent).toBe('');
  });

  it('accepts an optional className prop without error', () => {
    const { container } = render(
      <CopyAddress address={FULL_ADDRESS} className="custom-class" />,
    );
    const btn = container.querySelector('button');
    expect(btn?.className).toContain('custom-class');
  });

  it('handles addresses shorter than 8 chars without truncating', () => {
    render(<CopyAddress address="Short" />);
    expect(screen.getByText('Short')).toBeTruthy();
  });

  it('handles clipboard API failure gracefully', async () => {
    clipboardWriteText.mockRejectedValueOnce(new Error('Permission denied'));
    render(<CopyAddress address={FULL_ADDRESS} />);
    const btn = screen.getByRole('button');
    // Should not throw
    await act(async () => {
      fireEvent.click(btn);
    });
    expect(screen.getByText(TRUNCATED)).toBeTruthy();
  });

  it('does not trigger copy for unrecognised keys', async () => {
    render(<CopyAddress address={FULL_ADDRESS} />);
    const btn = screen.getByRole('button');
    await act(async () => {
      fireEvent.keyDown(btn, { key: 'Tab' });
    });
    expect(clipboardWriteText).not.toHaveBeenCalled();
  });

  it('passes waitFor after copy icon resets', async () => {
    render(<CopyAddress address={FULL_ADDRESS} />);
    const btn = screen.getByRole('button');
    await act(async () => {
      fireEvent.click(btn);
    });
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });
    await waitFor(() => {
      expect(screen.getByRole('status').textContent).toBe('');
    });
  });
});
