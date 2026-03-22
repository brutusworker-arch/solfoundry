/**
 * Reusable Button component with loading spinner support.
 * @module components/common/Button
 */
import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Shows a spinner and disables the button while true */
  isLoading?: boolean;
  /** Text displayed alongside the spinner when isLoading is true */
  loadingText?: string;
  /** Visual variant of the button */
  variant?: ButtonVariant;
  /** Size preset */
  size?: ButtonSize;
  /** Button contents shown when not loading */
  children: React.ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-[#9945FF] hover:bg-[#7C3AED] text-white disabled:bg-gray-700 disabled:text-gray-500',
  secondary:
    'bg-[#00FF88] hover:bg-[#00FF88]/90 text-gray-900 font-semibold disabled:bg-gray-700 disabled:text-gray-500',
  danger:
    'bg-red-600 hover:bg-red-500 text-white disabled:bg-gray-700 disabled:text-gray-500',
  ghost:
    'bg-transparent hover:bg-gray-800 text-gray-300 hover:text-white disabled:text-gray-600',
  outline:
    'bg-transparent border border-gray-700 hover:bg-gray-800 text-gray-300 hover:text-white disabled:border-gray-700 disabled:text-gray-600',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm min-h-[34px]',
  md: 'px-4 py-2.5 text-sm min-h-[40px]',
  lg: 'px-6 py-3 text-base min-h-[48px]',
};

/** Animated SVG spinner shown while isLoading is true. */
function Spinner({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

/**
 * Button component with optional loading state.
 *
 * @example
 * <Button isLoading={submitting} loadingText="Submitting..." onClick={handleSubmit}>
 *   Submit PR
 * </Button>
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      isLoading = false,
      loadingText,
      variant = 'primary',
      size = 'md',
      children,
      disabled,
      className = '',
      type = 'button',
      ...rest
    },
    ref,
  ) => {
    const isDisabled = disabled || isLoading;

    const spinnerSize =
      size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={isLoading}
        className={[
          'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9945FF] focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900',
          'disabled:cursor-not-allowed',
          VARIANT_CLASSES[variant],
          SIZE_CLASSES[size],
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...rest}
      >
        {isLoading ? (
          <>
            <Spinner className={spinnerSize} />
            <span>{loadingText ?? children}</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';

export default Button;
