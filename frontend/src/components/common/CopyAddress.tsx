/**
 * CopyAddress — Displays a truncated wallet address with click-to-copy behaviour.
 *
 * - Shows first 4 + "..." + last 4 characters of the address.
 * - Clicking (or pressing Enter/Space) copies the full address to the clipboard.
 * - Icon transitions from a clipboard to a checkmark for 2 seconds after copy.
 * - Full address exposed via the `title` attribute for hover tooltips.
 * - Screen reader announcement via an `aria-live` region.
 *
 * @module components/common/CopyAddress
 */
import { useState, useCallback } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface CopyAddressProps {
  /** Full wallet address to copy. */
  address: string;
  /** Optional extra Tailwind classes applied to the wrapper button. */
  className?: string;
}

// ============================================================================
// Icons (inline SVG to avoid extra deps)
// ============================================================================

const ClipboardIcon = () => (
  <svg
    aria-hidden="true"
    className="w-4 h-4 shrink-0"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.75}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5A2.25 2.25 0 0118 21.75H6A2.25 2.25 0 013.75 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
    />
  </svg>
);

const CheckIcon = () => (
  <svg
    aria-hidden="true"
    className="w-4 h-4 shrink-0 text-emerald-400"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

// ============================================================================
// Helpers
// ============================================================================

/**
 * Truncates an address to the "GhUg...KKpG" format.
 * Falls back to the raw value when it is too short to truncate.
 */
function truncateAddress(address: string): string {
  if (address.length <= 8) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Reusable wallet-address chip with copy-to-clipboard functionality.
 *
 * @example
 * <CopyAddress address="GhUgLwY9ky48FechbmvN7XBHkNRJZRwBmw36g8r6KKpG" />
 */
export function CopyAddress({ address, className = '' }: CopyAddressProps) {
  const [copied, setCopied] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  const handleCopy = useCallback(async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setAnnouncement('Address copied to clipboard');
      setTimeout(() => {
        setCopied(false);
        setAnnouncement('');
      }, 2000);
    } catch {
      // Clipboard API unavailable — fail silently.
    }
  }, [address]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        void handleCopy();
      }
    },
    [handleCopy],
  );

  return (
    <>
      <button
        type="button"
        onClick={() => void handleCopy()}
        onKeyDown={handleKeyDown}
        title={address}
        aria-label={`Copy wallet address ${address}`}
        className={[
          'inline-flex items-center gap-1.5 font-mono text-xs sm:text-sm',
          'text-gray-400 hover:text-white transition-colors',
          'rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9945FF]/70',
          'cursor-pointer select-none',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <span>{truncateAddress(address)}</span>
        {copied ? <CheckIcon /> : <ClipboardIcon />}
      </button>

      {/* Screen-reader live region — hidden visually */}
      <span
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </span>
    </>
  );
}

export default CopyAddress;
