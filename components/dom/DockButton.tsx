/* eslint-disable @next/next/no-img-element */
import styles from "./ControlDock.module.css";

interface DockButtonProps {
  icon: string; // path under /assets/icons — shown while `active` is false
  /** Shown while `active` is true; crossfades with `icon` (DS §3.3). */
  activeIcon?: string;
  label: string;
  active?: boolean;
  disabled?: boolean;
  /** Button mode (Shuffle, Reveal, About, Back-to-Home): fires a JS action. */
  onClick?: () => void;
  /** Anchor mode (Email, LinkedIn, X, Resume): real `<a>` semantics —
   * mailto/external-link/download, so middle-click/right-click/screen
   * readers all work as expected. Mutually exclusive with `onClick`. */
  href?: string;
  target?: string;
  rel?: string;
}

export default function DockButton({
  icon,
  activeIcon,
  label,
  onClick,
  active = false,
  disabled = false,
  href,
  target,
  rel,
}: DockButtonProps) {
  const className = `${styles.button} ${active ? styles.buttonActive : ""} ${
    disabled ? styles.buttonDisabled : ""
  }`;

  const icons = (
    <span className={styles.iconStack}>
      <img
        className={styles.icon}
        style={activeIcon ? { opacity: active ? 0 : 1 } : undefined}
        src={icon}
        alt=""
        aria-hidden="true"
      />
      {activeIcon && (
        <img
          className={styles.icon}
          style={{ opacity: active ? 1 : 0 }}
          src={activeIcon}
          alt=""
          aria-hidden="true"
        />
      )}
    </span>
  );

  if (href) {
    return (
      <a
        className={className}
        href={href}
        target={target}
        rel={rel}
        aria-label={label}
        title={label}
      >
        {icons}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      title={label}
    >
      {icons}
    </button>
  );
}
