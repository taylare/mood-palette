/**
 * CopyButton
 *
 * A reusable button that triggers a copy action and swaps to a confirmation
 * state for a moment afterwards. It does not touch the clipboard itself: the
 * parent passes in the copy handler and the isCopied flag, so several triggers
 * (for example a swatch and its own copy button) can share one copied state.
 *
 * Variants:
 * - "icon": a round icon only button, used on swatches.
 * - "text": a pill button with an icon and a label, used for "Copy all".
 */
function CopyButton({ onCopy, isCopied, ariaLabel, label = 'Copy', variant = 'icon', className = '' }) {
  const icon = isCopied ? <CheckIcon /> : <CopyIcon />;

  return (
    <button
      type="button"
      className={`copy-button copy-button--${variant} ${isCopied ? 'is-copied' : ''} ${className}`.trim()}
      onClick={onCopy}
      aria-label={ariaLabel}
    >
      {icon}
      {variant === 'text' && <span>{isCopied ? 'Copied!' : label}</span>}
    </button>
  );
}

function CopyIcon() {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="9" y="9" width="11" height="11" rx="2.5" />
      <path d="M5 15V6.5A2.5 2.5 0 0 1 7.5 4H15" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

export default CopyButton;
